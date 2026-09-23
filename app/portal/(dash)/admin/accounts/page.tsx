import Link from 'next/link';
import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { fmtShort } from '@/lib/format';
import PortalShell, { type PortalLink } from '@/components/PortalShell';
import { CreateAccountForm, ResetPasswordForm, AccountToggles } from './AccountControls';

export const metadata: Metadata = { title: 'Accounts' };
export const dynamic = 'force-dynamic';

const LINKS: PortalLink[] = [
  { label: 'Accounts', href: '/portal/admin/accounts', icon: 'users' },
  { label: 'Dashboard', href: '/portal/admin', icon: 'grid' },
  { label: 'Website content', href: '/portal/admin/website', icon: 'image' },
  { label: 'Event media', href: '/portal/admin/media', icon: 'mic' },
  { label: 'Announcements', href: '/portal/admin#notices', icon: 'bell' },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrator',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  LIBRARIAN: 'Library staff',
};

export default async function AccountsPage() {
  const admin = await requireRole(Role.ADMIN);
  const inst = await site();

  const [users, departments, programmes, unlinkedFaculty, unlinkedStudents] = await Promise.all([
    db.user.findMany({ orderBy: [{ role: 'asc' }, { name: 'asc' }] }),
    db.department.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
    db.programme.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.faculty.findMany({ where: { userId: null }, orderBy: { name: 'asc' }, select: { id: true, name: true, designation: true } }),
    db.student.findMany({ where: { userId: null }, orderBy: { name: 'asc' }, select: { id: true, name: true, regNo: true } }),
  ]);

  const now = new Date();
  const activeAdmins = users.filter((u) => u.role === Role.ADMIN && u.active).length;
  const pending = users.filter((u) => u.mustChangePassword).length;

  return (
    <PortalShell user={admin} title="Admin Panel" subtitle={inst.shortName} links={LINKS} heading="Accounts">
      <p className="lead" style={{ marginTop: 0 }}>
        Every login at {inst.shortName} is created here. Nobody outside the college can make an account,
        and nobody — including you — can see another person&rsquo;s password once they have chosen it.
      </p>

      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">Accounts</span>
          <span className="k-value">{users.length}</span>
          <span className="k-trend text-muted">{users.filter((u) => u.active).length} active</span>
        </div>
        <div className="kpi">
          <span className="k-label">Teachers</span>
          <span className="k-value">{users.filter((u) => u.role === Role.TEACHER).length}</span>
          <span className="k-trend text-muted">Can mark attendance and submit marks</span>
        </div>
        <div className="kpi">
          <span className="k-label">Students</span>
          <span className="k-value">{users.filter((u) => u.role === Role.STUDENT).length}</span>
          <span className="k-trend text-muted">Can see their own results</span>
        </div>
        <div className="kpi">
          <span className="k-label">Yet to set a password</span>
          <span className="k-value">{pending}</span>
          <span className="k-trend text-muted">Still using the one you gave them</span>
        </div>
      </div>

      {activeAdmins === 1 && (
        <div className="callout callout--accent">
          <p className="mb-0">
            <strong>You are the only administrator.</strong> If this account is lost, nobody can administer
            the site — the setup wizard closed when it was created. Create a second administrator account
            for somebody you trust.
          </p>
        </div>
      )}

      <div className="admin-doc-split">
        <div className="admin-edit-card">
          <h2 style={{ marginTop: 0 }}>Create an account</h2>
          <CreateAccountForm
            departments={departments.map((d) => ({ id: d.id, label: d.name }))}
            programmes={programmes.map((p) => ({ id: p.id, label: p.name }))}
            unlinkedFaculty={unlinkedFaculty.map((f) => ({ id: f.id, label: `${f.name} — ${f.designation}` }))}
            unlinkedStudents={unlinkedStudents.map((s) => ({ id: s.id, label: `${s.name} — ${s.regNo}` }))}
          />
        </div>

        <div>
          <h2 style={{ marginTop: 0 }}>Everyone with a login</h2>
          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Accounts</caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last signed in</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const locked = Boolean(u.lockedUntil && u.lockedUntil > now);
                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                        <br />
                        <span className="text-muted" style={{ fontSize: '.85rem' }}>{u.username}</span>
                      </td>
                      <td>{ROLE_LABEL[u.role]}</td>
                      <td>
                        {!u.active && <span className="badge">Deactivated</span>}
                        {u.active && locked && <span className="badge badge-warning">Locked</span>}
                        {u.active && !locked && u.mustChangePassword && (
                          <span className="badge badge-warning">Password not set</span>
                        )}
                        {u.active && !locked && !u.mustChangePassword && (
                          <span className="badge badge-brand">Active</span>
                        )}
                      </td>
                      <td>{u.lastLoginAt ? fmtShort(u.lastLoginAt) : <span className="text-muted">Never</span>}</td>
                      <td>
                        <div className="stack" style={{ gap: '.5rem' }}>
                          <ResetPasswordForm userId={u.id} name={u.name} />
                          {u.id !== admin.id && (
                            <AccountToggles userId={u.id} name={u.name} active={u.active} locked={locked} />
                          )}
                          {u.id === admin.id && (
                            <span className="text-muted" style={{ fontSize: '.82rem' }}>
                              This is you —{' '}
                              <Link href="/portal/account">change your own password</Link>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="form-note" style={{ marginTop: '1.5rem' }}>
            Accounts are never deleted. A teacher who has left still marked the attendance on record, so
            deactivating keeps that history while stopping them signing in.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
