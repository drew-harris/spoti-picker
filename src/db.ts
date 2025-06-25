import { drizzle } from "drizzle-orm/bun-sqlite";
import { ResultAsync, fromPromise } from "neverthrow";
import { env } from "./env.ts";

export * as schema from "./schema.ts";

export const rawDb = drizzle(env.DB_PATH, {
  logger: false,
});

export const useDb = <T>(
  useFn: (db: typeof rawDb) => Promise<T>,
): ResultAsync<T, Error> => {
  const result = fromPromise(
    useFn(rawDb),
    (e) => new Error("Database Error", { cause: e }),
  );
  return result;
};

// export const useTransaction = <T>(
//   useFn: (tx: SQLiteTransaction) => Promise<T>,
// ): ResultAsync<T, Error> => {
//   const result = fromPromise(
//     rawDb.transaction(useFn),
//     (e) => new Error("Transaction Error", { cause: e }),
//   );
//   return result;
// };
