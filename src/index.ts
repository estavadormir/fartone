import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";

class InvalidURLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidURLError";
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const app = new Elysia()
  .use(swagger())
  .onError(({ code, error }) => {
    switch (error.name) {
      case "InvalidURLError":
        return { status: 400, error: error.message };
      case "NotFoundError":
        return { status: 404, error: error.message };
      default:
        return { status: 500, error: "Internal server error" };
    }
  })
  .post(
    "/check",
    async ({ body }) => {
      try {
        new URL(body.url);
      } catch {
        throw new InvalidURLError("Invalid URL provided");
      }

      console.log(`[CHECK] Received request for URL: ${body.url}`);
      let found = false;
      let contents: string[] = [];

      try {
        const response = await fetch(body.url);
        if (!response.ok) {
          throw new Error(`Target URL returned ${response.status}`);
        }

        const rewriter = new HTMLRewriter().on(body.selector, {
          element(element) {
            found = true;
          },
          text(text) {
            if (text.text.trim()) {
              contents.push(text.text.trim());
            }
          },
        });

        await rewriter.transform(response).text();

        if (!found || contents.length === 0) {
          throw new NotFoundError("Element not found");
        }

        return {
          status: 200,
          success: true,
          contents,
          timestamp: new Date().toISOString(),
        };
      } catch (e) {
        if (e instanceof NotFoundError || e instanceof InvalidURLError) {
          throw e;
        }
        throw new Error("Internal server error");
      }
    },
    {
      body: t.Object({
        url: t.String(),
        selector: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.Number(),
          success: t.Boolean(),
          contents: t.Array(t.String()),
          timestamp: t.String(),
        }),
        400: t.Object({
          status: t.Number(),
          error: t.String(),
        }),
        404: t.Object({
          status: t.Number(),
          error: t.String(),
        }),
        500: t.Object({
          status: t.Number(),
          error: t.String(),
        }),
      },
    },
  )
  .post(
    "/compare",
    async ({ body }) => {
      try {
        new URL(body.url);
      } catch {
        throw new InvalidURLError("Invalid URL provided");
      }

      let contents: string[] = [];

      try {
        const response = await fetch(body.url);
        if (!response.ok) {
          throw new Error(`Target URL returned ${response.status}`);
        }

        const rewriter = new HTMLRewriter().on(body.selector, {
          text(text) {
            if (text.text.trim()) {
              contents.push(text.text.trim());
            }
          },
        });

        await rewriter.transform(response).text();

        const matches = contents.some((content) =>
          content.toLowerCase().includes(body.expectedContent.toLowerCase()),
        );

        if (!matches) {
          throw new NotFoundError("Content not found");
        }

        return {
          status: 200,
          success: true,
          matchedContent: contents.find((content) =>
            content.toLowerCase().includes(body.expectedContent.toLowerCase()),
          )!,
          timestamp: new Date().toISOString(),
        };
      } catch (e) {
        if (e instanceof NotFoundError || e instanceof InvalidURLError) {
          throw e;
        }
        throw new Error("Internal server error");
      }
    },
    {
      body: t.Object({
        url: t.String(),
        selector: t.String(),
        expectedContent: t.String(),
      }),
      response: {
        200: t.Object({
          status: t.Number(),
          success: t.Boolean(),
          matchedContent: t.String(),
          timestamp: t.String(),
        }),
        400: t.Object({
          status: t.Number(),
          error: t.String(),
        }),
        404: t.Object({
          status: t.Number(),
          error: t.String(),
        }),
        500: t.Object({
          status: t.Number(),
          error: t.String(),
        }),
      },
    },
  );

app.listen(3000, () => {
  console.log(`🚀 Server started at http://localhost:3000`);
});

process.on("SIGTERM", () => {
  console.log("📴 Server shutting down");
  process.exit(0);
});
