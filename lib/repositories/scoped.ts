import { prisma } from "@/lib/prisma";

/**
 * USER-SCOPED DATA ACCESS
 * ----------------------------------------------------------------------------
 * `forUser(userId)` returns a Prisma client whose every query against a
 * user-owned model is forced to carry `WHERE/data.userId = userId`. Callers
 * physically cannot read or mutate another user's rows through it.
 *
 * Why a client extension instead of "remember to add userId":
 * the W07 codebase appends `userId` by hand on each call (see app/actions.ts).
 * One forgotten filter = a cross-tenant leak. Here the filter is injected by
 * the data layer, so omission is impossible by construction.
 *
 * Operations whose `where` must be a *unique* selector (findUnique, update,
 * delete, upsert) cannot be scope-guaranteed by appending userId, so they are
 * REJECTED on scoped models. Use the *Many variants (findFirst/updateMany/
 * deleteMany), which accept arbitrary filters and are safely scoped.
 *
 * Raw SQL ($queryRaw/$executeRaw) bypasses this layer — vector writes/searches
 * must include userId explicitly (see app/api/das/ingest/route.ts).
 */

// Models that belong to a specific user. Must match Prisma model names.
const USER_SCOPED_MODELS = new Set<string>([
  // W08 SECTOR DAS
  "StudyDocument",
  "DocumentChunk",
  "UserAttempt",
  "UserUsage",
  // W05–W07 telemetry
  "IeltsModule",
  "Task",
  "DailyCommand",
  "ResearchExtraction",
  "ResearchProject",
  "FitnessLog",
  "Notification",
  "AnkiTelemetry",
]);

// Inject userId into the `where` filter.
const WHERE_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "deleteMany",
]);

// Inject userId into the `data` payload.
const DATA_OPS = new Set(["create", "createMany", "createManyAndReturn"]);

// Unique-selector ops that cannot be safely scoped by appending userId.
const REJECTED_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "update",
  "delete",
  "upsert",
]);

function injectData(data: unknown, userId: string): unknown {
  if (Array.isArray(data)) return data.map((row) => ({ ...row, userId }));
  return { ...(data as object), userId };
}

export function forUser(userId: string) {
  if (!userId) throw new Error("forUser(): userId is required");

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!USER_SCOPED_MODELS.has(model)) return query(args);

          if (REJECTED_OPS.has(operation)) {
            throw new Error(
              `Scoped client: "${operation}" is not allowed on user-owned model "${model}". ` +
                `Use findFirst / updateMany / deleteMany so the userId filter is enforced.`,
            );
          }

          const a = (args ?? {}) as Record<string, unknown>;

          if (WHERE_OPS.has(operation)) {
            a.where = { ...(a.where as object), userId };
            return query(a);
          }

          if (DATA_OPS.has(operation)) {
            a.data = injectData(a.data, userId);
            return query(a);
          }

          return query(a);
        },
      },
    },
  });
}

export type ScopedClient = ReturnType<typeof forUser>;
