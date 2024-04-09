import { Application, Router, Context } from "https://deno.land/x/oak@14.2.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { load } from "https://deno.land/std@0.221.0/dotenv/mod.ts";
import { RetrieverQueryEngine } from "npm:llamaindex@0.2.3";
const env = await load();
const clientUrl = env["CLIENT_URL"];

const port = 8002;
const app = new Application();

const router = new Router();

let customQueryEngine: RetrieverQueryEngine;

router.post('/', async (ctx: Context) => {
  // Lazy-load the module containing customQueryEngine
  const { createCustomQueryEngine } = await import('./engine/index.ts');
  const { question } = await ctx.request.body.json();
  if (!customQueryEngine) {
    customQueryEngine = createCustomQueryEngine();
  }
  const response = await customQueryEngine.query({
      query: question
   })
  const responseObj = {
    response: response.toString()
  }
  ctx.response.status = 200
  ctx.response.body = JSON.stringify(responseObj)
});

app.use(oakCors({
  'origin': clientUrl,
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false,
  'optionsSuccessStatus': 200,
  'credentials': true,
})); // Enable CORS for All Routes
app.use(router.allowedMethods());
app.use(router.routes());

app.addEventListener('listen', () => {
  console.log(`Listening on: localhost:${port}`);
});

await app.listen({ port });