import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get("/api/hello", () => {
    return "Hey";
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

//app.handle(new Request("http://localhost/")).then(console.log)