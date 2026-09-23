'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { completeSetup, type SetupState } from '@/app/actions/setup';
import { MEDIA_POLICY } from '@/lib/media';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
      {pending ? 'Setting up…' : 'Create the site'}
    </button>
  );
}

export default function SetupForm({ year }: { year: number }) {
  const [state, action] = useActionState<SetupState, FormData>(completeSetup, {});

  return (
    <form action={action}>
      <fieldset className="setup-step">
        <legend>
          <span className="setup-step-n">1</span> The college
        </legend>

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input type="text" id="name" name="name" required placeholder="Government Degree College …" />
          <span className="hint">As it should appear in the page title and the footer.</span>
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="shortName">Short name</label>
            <input type="text" id="shortName" name="shortName" required placeholder="GDC …" />
            <span className="hint">Used in the portal and in reference numbers.</span>
          </div>
          <div className="field">
            <label htmlFor="established">Year founded</label>
            <input type="number" id="established" name="established" required min={1800} max={year} placeholder="1998" />
          </div>
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="nameUr">Full name in Urdu (optional)</label>
            <input type="text" id="nameUr" name="nameUr" dir="rtl" />
          </div>
          <div className="field">
            <label htmlFor="shortNameUr">Short name in Urdu (optional)</label>
            <input type="text" id="shortNameUr" name="shortNameUr" dir="rtl" />
          </div>
        </div>
        <p className="form-note" style={{ marginTop: 0 }}>
          Leave the Urdu fields blank and the English name is shown to Urdu readers instead.
        </p>

        <div className="field">
          <label htmlFor="affiliation">Affiliation (optional)</label>
          <input type="text" id="affiliation" name="affiliation" placeholder="Affiliated with the University of …" />
        </div>

        <div className="field">
          <label htmlFor="crest">College crest (optional)</label>
          <input type="file" id="crest" name="crest" accept={MEDIA_POLICY.image.mimes.join(',')} />
          <span className="hint">A square image works best. Without one the site uses a plain shield.</span>
        </div>
      </fieldset>

      <fieldset className="setup-step">
        <legend>
          <span className="setup-step-n">2</span> Where to find it
        </legend>

        <div className="field">
          <label htmlFor="district">City or district</label>
          <input type="text" id="district" name="district" required placeholder="Zaim" />
          <span className="hint">Used in sentences such as “students of … and the surrounding districts”.</span>
        </div>

        <div className="field">
          <label htmlFor="address">Postal address</label>
          <input type="text" id="address" name="address" required placeholder="Main Campus Road, …, Pakistan" />
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="phone">Telephone</label>
            <input type="tel" id="phone" name="phone" required placeholder="+92 …" />
          </div>
          <div className="field">
            <label htmlFor="admissionsPhone">Admissions telephone (optional)</label>
            <input type="tel" id="admissionsPhone" name="admissionsPhone" placeholder="+92 …" />
          </div>
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="email">College email</label>
            <input type="email" id="email" name="email" required placeholder="info@yourcollege.edu.pk" />
            <span className="hint">
              Office addresses such as <code>library@</code> and <code>exams@</code> are taken from this domain.
            </span>
          </div>
          <div className="field">
            <label htmlFor="admissionsEmail">Admissions email (optional)</label>
            <input type="email" id="admissionsEmail" name="admissionsEmail" placeholder="admissions@yourcollege.edu.pk" />
          </div>
        </div>
      </fieldset>

      <fieldset className="setup-step">
        <legend>
          <span className="setup-step-n">3</span> The principal
        </legend>

        <div className="field">
          <label htmlFor="principalName">Name</label>
          <input type="text" id="principalName" name="principalName" required placeholder="Prof. …" />
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="principalDesignation">Title</label>
            <input type="text" id="principalDesignation" name="principalDesignation" defaultValue="Principal" />
          </div>
          <div className="field">
            <label htmlFor="principalQualification">Qualifications (optional)</label>
            <input type="text" id="principalQualification" name="principalQualification" placeholder="Ph.D. …, M.Phil. …" />
          </div>
        </div>
        <p className="form-note" style={{ marginTop: 0 }}>
          You can add the principal’s photograph and message afterwards, from the admin panel.
        </p>
      </fieldset>

      <fieldset className="setup-step">
        <legend>
          <span className="setup-step-n">4</span> Your administrator account
        </legend>
        <p className="text-muted" style={{ marginTop: 0 }}>
          This is the account you will use to run the site. It is the only one created now; staff and
          student accounts are added afterwards.
        </p>

        <div className="field">
          <label htmlFor="adminName">Your name</label>
          <input type="text" id="adminName" name="adminName" required autoComplete="name" />
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="adminUsername">Username</label>
            <input
              type="text"
              id="adminUsername"
              name="adminUsername"
              required
              minLength={4}
              autoComplete="username"
              pattern="[a-zA-Z0-9._\-]+"
            />
          </div>
          <div className="field">
            <label htmlFor="adminEmail">Your email</label>
            <input type="email" id="adminEmail" name="adminEmail" required autoComplete="email" />
          </div>
        </div>

        <div className="form-grid" style={{ gap: '1rem' }}>
          <div className="field">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              name="adminPassword"
              required
              minLength={10}
              autoComplete="new-password"
            />
            <span className="hint">At least 10 characters. Choose something only you know.</span>
          </div>
          <div className="field">
            <label htmlFor="adminPasswordConfirm">Repeat password</label>
            <input
              type="password"
              id="adminPasswordConfirm"
              name="adminPasswordConfirm"
              required
              minLength={10}
              autoComplete="new-password"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="setup-step">
        <legend>
          <span className="setup-step-n">5</span> Starting content
        </legend>
        <label style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', fontSize: '.95rem' }}>
          <input type="checkbox" name="exampleContent" defaultChecked style={{ width: 'auto', marginTop: '.3rem' }} />
          <span>
            <strong>Add example content to start from.</strong>
            <br />
            <span className="text-muted" style={{ fontSize: '.88rem' }}>
              Two placeholder departments, a few notices, events, facilities and gallery tiles, so every page
              has something on it. All of it is clearly marked and can be edited or deleted. No students,
              attendance or results are invented.
            </span>
          </span>
        </label>
      </fieldset>

      <Submit />

      {state.error && (
        <div className="form-status err" role="alert">
          {state.error}
        </div>
      )}
    </form>
  );
}
