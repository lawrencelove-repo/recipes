// Cloudflare Recipes API scaffold. Writes remain disabled until authenticated
// endpoints and data migration have been implemented and reviewed.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health" && request.method === "GET") {
      try {
        const result = await env.DB.prepare("SELECT 1 AS ok").first();
        return Response.json({ status: result?.ok === 1 ? "ok" : "error", database: "recipes-db" });
      } catch (error) {
        return Response.json({ status: "error", message: "Database unavailable" }, { status: 503 });
      }
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "API endpoint not implemented" }, { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
