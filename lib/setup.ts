import 'server-only';
import { cache } from 'react';
import { db } from './db';
import { getInstitution } from './site';

/**
 * Whether this deployment has been claimed by a college yet.
 *
 * A fresh copy of this repository pointed at an empty database belongs to
 * nobody. The wizard at /setup is what claims it: it records the institution
 * and creates the first administrator.
 *
 * `open` is the security boundary, and it is deliberately tied to accounts
 * rather than to the institution row: the moment any account exists, the
 * wizard closes for good, so nobody can wander in later and appoint
 * themselves administrator of a running college's site.
 */
export const setupState = cache(async () => {
  const [accounts, institution] = await Promise.all([db.user.count(), getInstitution()]);
  return {
    open: accounts === 0,
    configured: institution !== null,
    accounts,
  };
});
