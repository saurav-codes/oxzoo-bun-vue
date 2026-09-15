import { Hono } from "hono";

const app = new Hono();

app.get("/api/greeting", (c) => {
  const tag = process.env.GREETING_TAG ?? "";
  return c.text(`hello world oxzoo-bun-vue_${tag}`);
});

app.get("/health", (c) => c.text("ok"));

export default { port: Number(process.env.PORT) || 9105, fetch: app.fetch };
