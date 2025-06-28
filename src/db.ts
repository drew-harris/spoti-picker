import { drizzle } from "drizzle-orm/bun-sqlite";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultAsync, fromPromise } from "neverthrow";
import { env } from "./env.ts";
import { ErrorWithStatus } from "./safeRoute.ts";

export * as schema from "./schema.ts";

export const rawDb = drizzle(env.DB_PATH, {
  logger: false,
});

export class DatabaseError extends ErrorWithStatus {
  constructor(...args: ConstructorParameters<typeof ErrorWithStatus>) {
    super(...args);
  }
}

export const useDb = <T>(
  useFn: (db: typeof rawDb) => Promise<T>,
): ResultAsync<T, DatabaseError> => {
  const result = fromPromise(
    useFn(rawDb),
    (e) => new DatabaseError("Database Error", "Internal ", { cause: e }),
  );
  return result;
};

export const useTransaction = <T>(
  useFn: (tx: SQLiteTransaction<any, any, any, any>) => Promise<T>,
): ResultAsync<T, Error> => {
  const result = fromPromise(
    rawDb.transaction(useFn),
    (e) =>
      new DatabaseError("Transaction Error", "INTERNAL_SERVER_ERROR", {
        cause: e,
      }),
  );
  return result;
};
