import { ORPCError, type ORPCErrorCode } from "@orpc/client";
import type { Context } from "hono";
import type { JSONValue } from "hono/utils/types";
import { ResultAsync } from "neverthrow";
import { type ZodSchema, z } from "zod";
import { log } from "./logging";

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
    public code: ORPCErrorCode,
    { cause }: { cause?: Error | unknown } = {},
  ) {
    super(message, { cause });
  }
}

export const unwrap = async <T>(result: ResultAsync<T, Error>): Promise<T> => {
  return new Promise((resolve, reject) => {
    result.match(
      (value) => {
        resolve(value);
      },
      (error) => {
        let code: ORPCErrorCode = "INTERNAL_SERVER_ERROR";
        if (error instanceof ErrorWithStatus) {
          code = error.code;
        }
        log.error(error);
        reject(
          new ORPCError(code, {
            cause: error,
            message: error.message,
          }),
        );
      },
    );
  });
};
