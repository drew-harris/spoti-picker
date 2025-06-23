import type { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import type { BunSQLTransaction } from "drizzle-orm/bun-sql";
import { ResultAsync, fromPromise } from "neverthrow";
import { env } from "./env";

export * as schema from "./schema.ts";

export const rawDb = drizzle(env.DATABASE_URL);

export const useDb = <T>(
  useFn: (db: typeof rawDb) => Promise<T>,
): ResultAsync<T, Error> => {
  const result = fromPromise(
    useFn(rawDb),
    (e) => new Error("Database Error", { cause: e }),
  );
  return result;
};

type Transaction = BunSQLTransaction<
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export const useTransaction = <T>(
  useFn: (tx: Transaction) => Promise<T>,
): ResultAsync<T, Error> => {
  const result = fromPromise(
    rawDb.transaction(useFn),
    (e) => new Error("Transaction Error", { cause: e }),
  );
  return result;
};
