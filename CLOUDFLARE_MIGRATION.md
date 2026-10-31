# Recipes: Cloudflare Workers + D1

## Current deployment (October 2026)

- GitHub Pages serves the preserved browser-local SQLite application from `legacy`.
- `main` contains the Cloudflare Workers + D1 application, deployed manually using `.github/workflows/deploy-cloudflare.yml`.
- `feature/cloudflare-d1` was the initial migration branch and has been merged into `main`.
- Worker: `recipes`; D1 database: `recipes-db`; binding: `DB`.
- Login uses a six-digit email OTP through Resend. The current test recipient is `lawrencelove@gmail.com`, with sender `onboarding@resend.dev`. Switch to a verified sender domain before returning the recipient to Yahoo.
- Initial live login has been reported working. Full CRUD and D1 data integrity verification are **not yet confirmed**.

## Validation and deployment

- `.github/workflows/validate-cloudflare.yml`: JavaScript syntax, static build checks and Wrangler dry run on `main` and the migration branch.
- `.github/workflows/deploy-cloudflare.yml`: manually deploys `main`; does not replay seed migrations. Requires GitHub secrets `CLOUDFLARE_API_TOKEN`, `RESEND_API_KEY`, and `AUTH_SECRET`.
- `.github/workflows/audit-d1.yml`: manual **read-only** D1 counts and foreign-key checks. Inspect the job output; a successful workflow run does not automatically imply all counts match the source.

## Remaining closeout

1. Run the read-only D1 audit and compare all five table counts with the original source data.
2. Export a recoverable production D1 backup before destructive CRUD tests; verify that the export can be restored to an isolated database.
3. Test create, edit, delete, favorite, enabled, reload persistence, and preservation of ingredient/instruction grouping.
4. Reconcile browser-only edits and images that may not have been included in the seed import.
5. Verify sender domain with Resend and restore the preferred Yahoo login recipient.
6. Consider automatic production deployment only after tests and backup verification.

## Safety notes

Never re-import seed recipes into the existing production database during routine deploys. The GitHub Pages `legacy` branch is not a backup of data saved only in an individual browser. Do not publish authentication tables or session tokens in diagnostic output.
