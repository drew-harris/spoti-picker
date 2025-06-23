import type { Context } from "hono";
import type { JSONValue } from "hono/utils/types";
import { ResultAsync } from "neverthrow";
import { type ZodSchema, z } from "zod";

export const safeRoute = <
  T extends JSONValue,
  M extends string,
  Z extends ZodSchema,
  W extends string = "json",
>(
  handler: (
    c: Context<
      any,
      M,
      {
        out: {
          [type in W]: z.infer<Z>;
        };
        in: {
          [type in W]: z.infer<Z>;
        };
      }
    >,
    input: z.infer<Z>,
  ) => ResultAsync<T, Error>,
  schema?: Z,
  inputMethod: W = "json" as W,
) => {
  return async (
    c: Context<
      any,
      M,
      {
        out: {
          [type in W]: z.infer<Z>;
        };
        in: {
          [type in W]: z.infer<Z>;
        };
      }
    >,
  ) => {
    let input: z.infer<Z> = null;
    if (schema) {
      if (inputMethod === "json") {
        input = schema.parse(await c.req.json());
      }
      if (inputMethod === "query") {
        input = schema.parse(c.req.query());
      }
    }

    const result = await handler(c, input);
    if (result.isOk()) {
      return c.json(result.value);
    } else {
      // have to throw error to keep types happy
      console.log(result.error);
      throw result.error;
    }
  };
};

export class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const unwrap = async <T>(
  result: ResultAsync<T, Error>,
): Promise<Response | T> => {
  return new Promise((resolve) => {
    result.match(
      (value) => {
        resolve(value);
      },
      (error) => {
        let status = 500;
        if (error instanceof ErrorWithStatus) {
          status = error.status;
        }
        resolve(
          new Response(JSON.stringify({ error: error.message }), {
            status,
            headers: { "Content-Type": "application/json" },
          }),
        );
      },
    );
  });
};
