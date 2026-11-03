# Recipes one-time-code authentication (development branch)

The fixed authorized mailbox is **lawrencelove@yahoo.com**. Visitors do not choose the destination. The server sends a six-digit code (10-minute lifetime); the newest request invalidates earlier codes. Codes are HMAC-hashed in D1 and limited to five attempts. A successful login creates a 30-day HttpOnly, Secure session cookie; logout revokes the session.

## Required configuration before deployment

1. Configure an email provider. The Worker currently uses **Resend** to send email; set up a verified sender domain and obtain an API key. A Yahoo address may be the **recipient**, but cannot be used as the sender without authorization from that domain.
2. Set Worker secrets: `RESEND_API_KEY` and `AUTH_SECRET` (a unique cryptographically random value, at least 32 bytes). Do not commit either.
3. Set Worker environment variable `EMAIL_FROM` to a verified sender, e.g. `Recipes <recipes@your-verified-domain.example>`. This is an example, not a configured address.
4. Apply D1 migrations `0001_recipes.sql` and `0003_auth.sql` before deploying the Worker. `0002_seed_recipes.sql` must be generated and reviewed separately.
5. Configure the Worker deployment and run end-to-end tests before sharing the URL.

**Not yet deployed or tested.** The existing GitHub Pages application remains unchanged.

## Security limitations / follow-up

- All Worker-served static assets and API routes are gated by the session. This does **not** make the separate public GitHub repository or GitHub Pages data private.
- The current login rate limit is five requests per IP per hour, plus five attempts per code. Add Cloudflare edge-level rate limiting and monitoring for production; database-backed limits alone can be abused.
- The existing static app still uses browser-local sql.js/IndexedDB. D1 CRUD endpoints and frontend migration are separate work; this commit only adds login.
- Third-party cookie restrictions may affect login when the Recipes Worker is embedded inside Hub on a different workers.dev hostname. Test iframe behavior and consider top-level login navigation or a shared custom domain.
- Service-worker caching from the existing application must be reviewed to ensure authenticated content is not inadvertently served after logout.
- Before production, restrict Worker static assets to a curated public directory rather than the current broad repo root.
