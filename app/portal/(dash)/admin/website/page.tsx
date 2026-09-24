import Link from 'next/link';
import type { Metadata } from 'next';
import { Role } from '@prisma/client';
import { requireRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { site } from '@/lib/site';
import { fmtShort } from '@/lib/format';
import { MEDIA_POLICY } from '@/lib/media';
import { storageBackend } from '@/lib/storage';
import { adminNav } from '@/lib/admin-nav';
import PortalShell from '@/components/PortalShell';
import ContentForm from '@/components/admin/ContentForm';
import PhotoPicker from '@/components/admin/PhotoPicker';
import DangerButton from '@/components/admin/DangerButton';
import {
  saveInstitution,
  saveLeader,
  removeLeaderPhoto,
  setSiteImage,
  saveGalleryItem,
  deleteGalleryItem,
  addDownload,
  deleteDownload,
} from '@/app/actions/content';

export const metadata: Metadata = { title: 'Website Content' };
export const dynamic = 'force-dynamic';

/** Where each banner appears, so the administrator knows what they are changing. */
const SLOT_HELP: Record<string, { label: string; where: string }> = {
  hero: {
    label: 'Home page banner',
    where: 'Fills the width of the home page, behind the welcome message.',
  },
  'about-campus': {
    label: 'About page photograph',
    where: 'Sits beside the college history on the About page.',
  },
};

const DOWNLOAD_CATEGORIES = [
  'Prospectus', 'Admission', 'Examination', 'Academic', 'Scholarship', 'Forms', 'Policy',
];

export default async function WebsiteContentPage() {
  const inst = await site();
  const user = await requireRole(Role.ADMIN);

  const [leaders, images, gallery, documents] = await Promise.all([
    db.leader.findMany({ orderBy: { order: 'asc' } }),
    db.siteImage.findMany({ orderBy: { slot: 'asc' } }),
    db.galleryItem.findMany({ orderBy: { order: 'asc' } }),
    db.download.findMany({ orderBy: { publishedAt: 'desc' } }),
  ]);

  const withPhoto = leaders.filter((l) => l.photoPath).length;
  const tilesFilled = gallery.filter((g) => g.imagePath).length;

  return (
    <PortalShell
      user={user}
      title="Admin Panel"
      subtitle={inst.shortName}
      links={adminNav('/portal/admin/website')}
      heading="Website Content"
    >
      <p className="lead" style={{ marginTop: 0 }}>
        Everything on this page is published straight to the public website. Changes appear the
        moment you save — there is nothing else to press and no need to wait for a rebuild.
      </p>

      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">Leadership portraits</span>
          <span className="k-value">{withPhoto}/{leaders.length}</span>
          <span className="k-trend text-muted">Shown on the About page</span>
        </div>
        <div className="kpi">
          <span className="k-label">Gallery photographs</span>
          <span className="k-value">{tilesFilled}/{gallery.length}</span>
          <span className="k-trend text-muted">
            {gallery.length - tilesFilled} tile{gallery.length - tilesFilled === 1 ? '' : 's'} still a placeholder
          </span>
        </div>
        <div className="kpi">
          <span className="k-label">Documents published</span>
          <span className="k-value">{documents.length}</span>
          <span className="k-trend text-muted">On the downloads page</span>
        </div>
        <div className="kpi">
          <span className="k-label">Files are stored</span>
          <span className="k-value" style={{ fontSize: '1.4rem' }}>
            {storageBackend === 'blob' ? 'In cloud storage' : 'On this server'}
          </span>
          <span className="k-trend text-muted">
            {storageBackend === 'blob'
              ? 'Uploads survive every deployment'
              : 'Fine on a college server; connect Blob storage when hosting on Vercel'}
          </span>
        </div>
      </div>

      {/* ---------------- The college itself ---------------- */}
      <section className="panel" id="institution">
        <h2>College profile</h2>
        <p className="text-muted">
          The name, contact details and description used across the whole site — the header, the
          footer, every page title and the About page. Changing the name here renames the site.
        </p>

        <ContentForm action={saveInstitution} submitLabel="Save the college profile">
          <div className="admin-doc-split">
            <div>
              <PhotoPicker
                name="crest"
                current={inst.crestPath}
                alt={`${inst.shortName} crest`}
                shape="portrait"
                label="College crest"
                hint="A square image works best. Leave empty to keep the current one."
              />
            </div>

            <div className="stack">
              <div className="form-grid" style={{ gap: '1rem' }}>
                <div className="field">
                  <label htmlFor="i-name">Full name</label>
                  <input type="text" id="i-name" name="name" defaultValue={inst.name} required />
                </div>
                <div className="field">
                  <label htmlFor="i-short">Short name</label>
                  <input type="text" id="i-short" name="shortName" defaultValue={inst.shortName} required />
                </div>
                <div className="field">
                  <label htmlFor="i-nameur">Full name in Urdu</label>
                  <input type="text" id="i-nameur" name="nameUr" dir="rtl" defaultValue={inst.nameUr} />
                </div>
                <div className="field">
                  <label htmlFor="i-shortur">Short name in Urdu</label>
                  <input type="text" id="i-shortur" name="shortNameUr" dir="rtl" defaultValue={inst.shortNameUr} />
                </div>
                <div className="field">
                  <label htmlFor="i-dept">Governing body</label>
                  <input type="text" id="i-dept" name="department" defaultValue={inst.department} />
                </div>
                <div className="field">
                  <label htmlFor="i-deptur">Governing body in Urdu</label>
                  <input type="text" id="i-deptur" name="departmentUr" dir="rtl" defaultValue={inst.departmentUr} />
                </div>
                <div className="field">
                  <label htmlFor="i-est">Year founded</label>
                  <input type="number" id="i-est" name="established" defaultValue={inst.established} required />
                </div>
                <div className="field">
                  <label htmlFor="i-aff">Affiliation</label>
                  <input type="text" id="i-aff" name="affiliation" defaultValue={inst.affiliation} />
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Where to find the college</h3>
          <div className="form-grid" style={{ gap: '1rem' }}>
            <div className="field">
              <label htmlFor="i-district">City or district</label>
              <input type="text" id="i-district" name="district" defaultValue={inst.district} required />
            </div>
            <div className="field">
              <label htmlFor="i-hours">Office hours</label>
              <input type="text" id="i-hours" name="officeHours" defaultValue={inst.officeHours} />
            </div>
            <div className="field">
              <label htmlFor="i-addr">Postal address</label>
              <input type="text" id="i-addr" name="address" defaultValue={inst.address} required />
            </div>
            <div className="field">
              <label htmlFor="i-addrur">Postal address in Urdu</label>
              <input type="text" id="i-addrur" name="addressUr" dir="rtl" defaultValue={inst.addressUr} />
            </div>
            <div className="field">
              <label htmlFor="i-phone">Telephone</label>
              <input type="tel" id="i-phone" name="phone" defaultValue={inst.phone} required />
            </div>
            <div className="field">
              <label htmlFor="i-aphone">Admissions telephone</label>
              <input type="tel" id="i-aphone" name="admissionsPhone" defaultValue={inst.admissionsPhone} />
            </div>
            <div className="field">
              <label htmlFor="i-email">College email</label>
              <input type="email" id="i-email" name="email" defaultValue={inst.email} required />
              <span className="hint">
                Office addresses such as <code>library@</code> come from this domain.
              </span>
            </div>
            <div className="field">
              <label htmlFor="i-aemail">Admissions email</label>
              <input type="email" id="i-aemail" name="admissionsEmail" defaultValue={inst.admissionsEmail} />
            </div>
          </div>

          <h3 style={{ marginTop: '2rem' }}>The principal</h3>
          <div className="form-grid" style={{ gap: '1rem' }}>
            <div className="field">
              <label htmlFor="i-pname">Name</label>
              <input type="text" id="i-pname" name="principalName" defaultValue={inst.principalName} required />
            </div>
            <div className="field">
              <label htmlFor="i-pdes">Title</label>
              <input type="text" id="i-pdes" name="principalDesignation" defaultValue={inst.principalDesignation} />
            </div>
            <div className="field">
              <label htmlFor="i-pqual">Qualifications</label>
              <input type="text" id="i-pqual" name="principalQualification" defaultValue={inst.principalQualification} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="i-pmsg">Principal&rsquo;s message</label>
            <textarea id="i-pmsg" name="principalMessage" rows={7} defaultValue={inst.principalMessage} />
            <span className="hint">
              Leave a blank line between paragraphs. The first two appear on the home page and all of
              them on the About page. Leave it empty for a short generated welcome.
            </span>
          </div>

          <h3 style={{ marginTop: '2rem' }}>How the college describes itself</h3>
          <div className="field">
            <label htmlFor="i-tag">One-line description</label>
            <textarea id="i-tag" name="tagline" rows={2} defaultValue={inst.tagline} />
            <span className="hint">Shown under the college name on the home page and in the footer.</span>
          </div>
          <div className="field">
            <label htmlFor="i-tagur">One-line description in Urdu</label>
            <textarea id="i-tagur" name="taglineUr" rows={2} dir="rtl" defaultValue={inst.taglineUr} />
          </div>
          <div className="field">
            <label htmlFor="i-lead">About page introduction</label>
            <textarea id="i-lead" name="aboutLead" rows={3} defaultValue={inst.aboutLead} />
          </div>
          <div className="field">
            <label htmlFor="i-hist">History</label>
            <textarea id="i-hist" name="historyBody" rows={8} defaultValue={inst.historyBody} />
            <span className="hint">
              Leave a blank line between paragraphs. Empty means a short paragraph written from the
              founding year and district.
            </span>
          </div>
        </ContentForm>
      </section>

      {/* ---------------- Leadership ---------------- */}
      <section className="panel" id="leadership">
        <h2>Principal &amp; college leadership</h2>
        <p className="text-muted">
          Upload a portrait for any office holder and correct their name or responsibilities. A card
          with no photograph falls back to an icon, so the page never looks broken.
        </p>

        <div className="admin-card-grid">
          {leaders.map((leader) => (
            <article className="admin-edit-card" key={leader.id}>
              <ContentForm action={saveLeader} submitLabel="Save this person">
                <input type="hidden" name="id" value={leader.id} />

                <PhotoPicker
                  current={leader.photoPath}
                  alt={leader.alt}
                  shape="portrait"
                  label={`Portrait — ${leader.role}`}
                />

                <div className="field">
                  <label htmlFor={`role-${leader.id}`}>Office</label>
                  <input type="text" id={`role-${leader.id}`} name="role" defaultValue={leader.role} required />
                </div>

                <div className="field">
                  <label htmlFor={`name-${leader.id}`}>Name</label>
                  <input type="text" id={`name-${leader.id}`} name="name" defaultValue={leader.name} required />
                </div>

                <div className="field">
                  <label htmlFor={`detail-${leader.id}`}>Responsibilities</label>
                  <textarea id={`detail-${leader.id}`} name="detail" defaultValue={leader.detail} required rows={3} />
                </div>
              </ContentForm>

              {leader.photoPath && (
                <div className="cluster" style={{ marginTop: '.75rem' }}>
                  <DangerButton
                    action={removeLeaderPhoto}
                    id={leader.id}
                    label="Remove photograph"
                    confirm={`Remove the photograph of ${leader.name}? The card will go back to showing an icon.`}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- Banners ---------------- */}
      <section className="panel" id="banners">
        <h2>Page photographs</h2>
        <p className="text-muted">
          The large photographs built into the design. Replacing one changes every page that uses it.
        </p>

        <div className="admin-card-grid">
          {images.map((image) => {
            const help = SLOT_HELP[image.slot];
            return (
              <article className="admin-edit-card" key={image.slot}>
                <ContentForm action={setSiteImage} submitLabel="Upload this photograph">
                  <input type="hidden" name="slot" value={image.slot} />

                  <PhotoPicker
                    current={image.imagePath}
                    alt={image.alt}
                    label={help?.label ?? image.slot}
                  />

                  <p className="form-note" style={{ marginTop: 0 }}>
                    {help?.where ?? `Used wherever the site asks for “${image.slot}”.`}
                  </p>

                  <div className="field">
                    <label htmlFor={`alt-${image.slot}`}>Description for screen readers</label>
                    <textarea id={`alt-${image.slot}`} name="alt" defaultValue={image.alt} rows={2} required />
                    <span className="hint">
                      Describe what is in the photograph. Blind visitors hear this instead of seeing it.
                    </span>
                  </div>

                  <p className="form-note" style={{ marginBottom: 0 }}>
                    Last changed {fmtShort(image.updatedAt)}.
                  </p>
                </ContentForm>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------------- Gallery ---------------- */}
      <section className="panel" id="gallery">
        <div className="split" style={{ marginBottom: '.5rem' }}>
          <h2 className="mb-0">Photo gallery</h2>
          <Link className="btn btn-ghost" href="/gallery">
            View the public gallery
          </Link>
        </div>
        <p className="text-muted">
          The tiles on the gallery page. The library and laboratory tiles are waiting for their
          photographs — choose a file on the tile and save.
        </p>

        <div className="admin-card-grid">
          {gallery.map((item) => (
            <article className="admin-edit-card" key={item.id}>
              <ContentForm action={saveGalleryItem} submitLabel="Save this tile">
                <input type="hidden" name="id" value={item.id} />

                <PhotoPicker current={item.imagePath} alt={item.alt} label={`Photograph — ${item.title}`} />

                <div className="field">
                  <label htmlFor={`g-title-${item.id}`}>Caption</label>
                  <input type="text" id={`g-title-${item.id}`} name="title" defaultValue={item.title} required />
                </div>

                <div className="field">
                  <label htmlFor={`g-cat-${item.id}`}>Category</label>
                  <input type="text" id={`g-cat-${item.id}`} name="category" defaultValue={item.category} required />
                </div>

                <div className="field">
                  <label htmlFor={`g-alt-${item.id}`}>Description for screen readers</label>
                  <textarea id={`g-alt-${item.id}`} name="alt" defaultValue={item.alt ?? ''} rows={2} />
                </div>
              </ContentForm>

              <div className="cluster" style={{ marginTop: '.75rem' }}>
                <DangerButton
                  action={deleteGalleryItem}
                  id={item.id}
                  label="Delete tile"
                  confirm={`Delete “${item.title}” from the gallery? The photograph is deleted too.`}
                />
              </div>
            </article>
          ))}

          <article className="admin-edit-card admin-edit-card--new">
            <h3>Add a new tile</h3>
            <ContentForm action={saveGalleryItem} submitLabel="Add to the gallery" pendingLabel="Adding…">
              <PhotoPicker
                label="Photograph"
                hint={`${MEDIA_POLICY.image.label}. Required for a new tile.`}
              />

              <div className="field">
                <label htmlFor="g-new-title">Caption</label>
                <input type="text" id="g-new-title" name="title" required placeholder="Annual Sports Gala 2026" />
              </div>

              <div className="field">
                <label htmlFor="g-new-cat">Category</label>
                <input type="text" id="g-new-cat" name="category" required defaultValue="Campus" />
              </div>

              <div className="field">
                <label htmlFor="g-new-alt">Description for screen readers</label>
                <textarea id="g-new-alt" name="alt" rows={2} />
              </div>
            </ContentForm>
          </article>
        </div>
      </section>

      {/* ---------------- Downloads ---------------- */}
      <section className="panel" id="documents">
        <h2>Downloadable documents</h2>
        <p className="text-muted">
          The prospectus, admission forms, datesheets and policies on the downloads page.
        </p>

        <div className="admin-doc-split">
          <div className="admin-edit-card">
            <h3>Publish a document</h3>
            <ContentForm action={addDownload} submitLabel="Publish document" pendingLabel="Uploading…">
              <div className="field">
                <label htmlFor="d-title">Title</label>
                <input type="text" id="d-title" name="title" required placeholder="Prospectus 2026–27" />
              </div>

              <div className="field">
                <label htmlFor="d-cat">Category</label>
                <select id="d-cat" name="category" defaultValue="Prospectus">
                  {DOWNLOAD_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="d-file">File</label>
                <input
                  type="file"
                  id="d-file"
                  name="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf"
                />
                <span className="hint">{MEDIA_POLICY.document.label}.</span>
              </div>
            </ContentForm>
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption className="visually-hidden">Documents currently published</caption>
              <thead>
                <tr>
                  <th scope="col">Document</th>
                  <th scope="col">Category</th>
                  <th scope="col">Published</th>
                  <th scope="col">File</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td><strong>{doc.title}</strong></td>
                    <td>{doc.category}</td>
                    <td>{fmtShort(doc.publishedAt)}</td>
                    <td>
                      {doc.filePath ? (
                        <a href={doc.filePath} target="_blank" rel="noreferrer">
                          {doc.fileType} · {doc.size}
                        </a>
                      ) : (
                        <span className="text-muted">{doc.fileType} · not uploaded</span>
                      )}
                    </td>
                    <td>
                      <DangerButton
                        action={deleteDownload}
                        id={doc.id}
                        label="Withdraw"
                        pendingLabel="Withdrawing…"
                        confirm={`Withdraw “${doc.title}” from the downloads page? The file is deleted too.`}
                      />
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-muted">
                      Nothing published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Photographs and videos of events</h2>
        <p className="text-muted">
          Event coverage has a screen of its own, because photographs and videos are uploaded there
          in batches and filed under the event they belong to.
        </p>
        <Link className="btn btn-primary" href="/portal/admin/media">
          Go to event media
        </Link>
      </section>
    </PortalShell>
  );
}
