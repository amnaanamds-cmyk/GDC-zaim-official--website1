'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';

export type FormState = { ok?: string; error?: string };

/** Short human-friendly reference, e.g. CMP-2026-4821. */
function reference(prefix: string) {
  return `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ------------------------------------------------------------------ *
 * General enquiry  (SRS §14)
 * ------------------------------------------------------------------ */
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please give your name.').max(120),
  email: z.email('Enter a valid email address.'),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(1, 'Choose a subject.'),
  message: z.string().trim().min(10, 'Please write a little more detail.').max(4000),
});

export async function sendEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    subject: formData.get('subject'),
    message: formData.get('message'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.contactMessage.create({ data: parsed.data });
  return { ok: 'Thank you — your enquiry has been recorded and routed to the relevant office.' };
}

/* ------------------------------------------------------------------ *
 * Complaints & feedback  (SRS §14)
 * ------------------------------------------------------------------ */
const complaintSchema = z.object({
  category: z.string().trim().min(1, 'Choose a category.'),
  departmentId: z.string().trim().optional(),
  details: z.string().trim().min(15, 'Please describe the issue in a little more detail.').max(4000),
  contact: z.string().trim().max(200).optional(),
});

export async function submitComplaint(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = complaintSchema.safeParse({
    category: formData.get('category'),
    departmentId: formData.get('departmentId') || undefined,
    details: formData.get('details'),
    contact: formData.get('contact') || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ref = reference('CMP');
  await db.complaint.create({
    data: {
      ref,
      category: parsed.data.category,
      departmentId: parsed.data.departmentId || null,
      details: parsed.data.details,
      contact: parsed.data.contact || null,
    },
  });

  revalidatePath('/portal/admin');
  return {
    ok: `Complaint recorded. Your reference is ${ref} — keep it to follow the progress. It has been routed to the responsible department.`,
  };
}

/* ------------------------------------------------------------------ *
 * Certificate and document requests  (SRS §13)
 * ------------------------------------------------------------------ */
const serviceSchema = z.object({
  studentName: z.string().trim().min(2, 'Please give your name.').max(120),
  regNo: z.string().trim().min(4, 'Enter your registration number.').max(40),
  serviceType: z.string().trim().min(1, 'Choose the document you need.'),
  purpose: z.string().trim().min(5, 'Say briefly what the document is for.').max(500),
  contact: z.string().trim().min(7, 'Enter a mobile number we can reach you on.').max(40),
});

export async function requestService(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = serviceSchema.safeParse({
    studentName: formData.get('studentName'),
    regNo: formData.get('regNo'),
    serviceType: formData.get('serviceType'),
    purpose: formData.get('purpose'),
    contact: formData.get('contact'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ref = reference('SRV');
  await db.serviceRequest.create({ data: { ref, ...parsed.data } });

  return {
    ok: `Request submitted. Your reference is ${ref}. Track it with the form below — the office updates the stage as it progresses.`,
  };
}

/** Look up a request by its reference so the applicant can see the stage. */
export async function trackService(_prev: FormState & { stage?: string }, formData: FormData) {
  const ref = String(formData.get('ref') ?? '').trim();
  if (!ref) return { error: 'Enter the reference number you were given.' };

  const request = await db.serviceRequest.findUnique({ where: { ref } });
  if (!request) return { error: `No request found with reference ${ref}.` };

  const stage = request.stage.replace('_', ' ').toLowerCase();
  return {
    ok: `${request.serviceType} for ${request.regNo} — currently ${stage}.`,
    stage: request.stage,
  };
}

/* ------------------------------------------------------------------ *
 * Event registration  (SRS §15)
 * ------------------------------------------------------------------ */
const eventRegSchema = z.object({
  eventId: z.string().trim().min(1, 'Choose an event.'),
  studentName: z.string().trim().min(2, 'Please give your name.').max(120),
  regNo: z.string().trim().min(4, 'Enter your registration number.').max(40),
});

export async function registerForEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = eventRegSchema.safeParse({
    eventId: formData.get('eventId'),
    studentName: formData.get('studentName'),
    regNo: formData.get('regNo'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const event = await db.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event) return { error: 'That event is no longer listed.' };
  if (!event.registrationOpen) return { error: `Registration for ${event.title} is closed.` };

  const existing = await db.eventRegistration.findFirst({
    where: { eventId: event.id, regNo: parsed.data.regNo },
  });
  if (existing) return { error: `${parsed.data.regNo} is already registered for ${event.title}.` };

  await db.eventRegistration.create({ data: parsed.data });
  revalidatePath('/events');

  return { ok: `Registered for ${event.title}. Bring your college identity card on the day.` };
}
