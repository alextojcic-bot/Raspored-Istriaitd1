import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const store = getStore("raspored-najma");

  if (req.method === "GET") {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!key) {
      return new Response(JSON.stringify({ error: "missing key" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const value = await store.get(key, { type: "text" });
    if (value === null) {
      return new Response(JSON.stringify(null), {
        headers: { "content-type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ key, value }), {
      headers: { "content-type": "application/json" }
    });
  }

  if (req.method === "POST") {
    let body: { key?: string; value?: string };
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "invalid json" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const { key, value } = body;
    if (!key) {
      return new Response(JSON.stringify({ error: "missing key" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    await store.set(key, value ?? "");
    return new Response(JSON.stringify({ key, value }), {
      headers: { "content-type": "application/json" }
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/storage" };
