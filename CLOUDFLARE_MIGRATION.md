# Recipes: Cloudflare Workers + D1 migration

Development branch: `feature/cloudflare-d1`. Do not merge into `main` until verified.

Worker: `recipes`
D1 database: `recipes-db`
Binding: `DB`

## Current state
- Worker configuration, D1 schema, and read-only health endpoint are scaffolded.
- **No remote database migration has been executed.**
- **No Worker has been deployed.**
- Existing GitHub Pages and local IndexedDB data are untouched.
- No recipe write API is exposed yet.

## Next implementation phases
1. Import seed recipes while preserving existing IDs, grouped ingredients, and instructions.
2. Build authenticated CRUD API, including server-side authorization and validation.
3. Refactor browser database interface and UI for async API reads and writes.
4. Plan persistent image storage (R2) and migration of local-only photos.
5. Implement explicit backup/export and reconciliation of local-only browser edits.
6. Add manual deployment workflow; migrate remote schema and verify before enabling app writes.

## Operational safeguards
- Never reset or overwrite a user's browser IndexedDB data automatically.
- Do not publicly expose unauthenticated write endpoints.
- Avoid deploying incomplete migration code over the existing GitHub Pages site.
- Cloudflare account API token must be configured as a GitHub Actions secret in this repository before deployment.
