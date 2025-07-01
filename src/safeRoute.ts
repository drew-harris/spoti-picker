import { ORPCError, type ORPCErrorCode } from "@orpc/client";
import { ResultAsync } from "neverthrow";
import { log } from "./logging";

export class ErrorWithStatus extends Error {
  constructor(
    message: string,
    public code: ORPCErrorCode,
    { cause }: { cause?: Error | unknown } = {},
  ) {
    super(message, { cause });
  }
}

export type SuccessVariant<T extends ResultAsync<any, any>> =
  T extends ResultAsync<infer U, any> ? U : never;

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
