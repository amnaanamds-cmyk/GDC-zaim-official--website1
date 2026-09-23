import Link from 'next/link';
import { site, mailbox } from '@/lib/site';
import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'How this website supports keyboard navigation, screen readers, contrast, reduced motion and Urdu language support.',
};

export default async function AccessibilityPage() {
  const inst = await site();
  return (
    <>
      <PageHero
        title="Accessibility Statement"
        lead="This website is built to be usable by everyone, including visitors who rely on assistive technology or who access it on low-bandwidth connections."
        crumbs={[{ label: 'Accessibility' }]}
      />
      <section className="section">
        <div className="container-narrow">
          <h2>What we have done</h2>
          <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
            <li><strong>Server-rendered pages.</strong> Content arrives as HTML, so it is readable by search engines, screen readers and browsers with JavaScript disabled. Filters and search use ordinary links and form submissions.</li>
            <li><strong>Keyboard navigation.</strong> Every interactive element — menus, filters, dialogs and forms — can be operated with a keyboard, and a &ldquo;skip to main content&rdquo; link is the first focusable item on each page.</li>
            <li><strong>Visible focus.</strong> A high-contrast focus ring marks the element currently in focus.</li>
            <li><strong>Colour contrast.</strong> Text and interface colours meet the WCAG 2.1 AA contrast ratio in both the light and dark themes, verified for every text and background pair in the palette.</li>
            <li><strong>Semantic structure.</strong> Pages use landmarks, ordered headings, table captions and scope attributes.</li>
            <li><strong>Labels and descriptions.</strong> Every form control has a visible or screen-reader label; uploaded images carry a description entered at upload time.</li>
            <li><strong>Responsive layout.</strong> The site reflows to a single column on small screens without horizontal scrolling.</li>
            <li><strong>Reduced motion.</strong> Animations and scroll effects are disabled automatically when the operating system requests reduced motion.</li>
            <li><strong>Language support.</strong> Content can be switched between English and Urdu, with the page direction changing to right-to-left for Urdu. The choice is stored server-side, so pages arrive already translated.</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>Known limitations</h2>
          <ul className="stack" style={{ paddingInlineStart: '1.2rem' }}>
            <li>Some documents published for download are scanned PDFs that are not yet searchable. These are being replaced with accessible versions.</li>
            <li>Urdu translation currently covers navigation, headings and key labels rather than the full body text of every page.</li>
            <li>Uploaded videos do not yet carry captions. A caption field is planned for the media uploader.</li>
          </ul>

          <h2 style={{ marginTop: '2.5rem' }}>Reporting a problem</h2>
          <p>
            If any part of this website is difficult to use, please tell us. Write to{' '}
            <a href={`mailto:${mailbox(inst, 'itsupport')}`}>{mailbox(inst, 'itsupport')}</a> or use the{' '}
            <Link href="/contact#complaint">complaints and feedback form</Link>, describing the page and what
            happened. We aim to respond within five working days.
          </p>

          <div className="callout" style={{ marginTop: '1.5rem' }}>
            <p className="mb-0">
              If you cannot access a document or service online, the relevant office will provide it in person
              during working hours — Monday to Friday, 08:00 to 14:00.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
