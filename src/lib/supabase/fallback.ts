const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Supabase environment is not configured for this workspace.";

function createNotConfiguredError() {
  return new Error(SUPABASE_NOT_CONFIGURED_MESSAGE);
}

function createEmptyResult() {
  return Promise.resolve({
    data: null,
    error: null,
    count: null,
  });
}

function createMutationErrorResult() {
  return Promise.resolve({
    data: null,
    error: createNotConfiguredError(),
    count: null,
  });
}

function createNoopQueryBuilder() {
  const queryResult = createEmptyResult();
  const mutationResult = createMutationErrorResult();

  const builder = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "then") {
          return queryResult.then.bind(queryResult);
        }

        if (property === "catch") {
          return queryResult.catch.bind(queryResult);
        }

        if (property === "finally") {
          return queryResult.finally.bind(queryResult);
        }

        if (property === "maybeSingle" || property === "single") {
          return async () => ({
            data: null,
            error: null,
          });
        }

        if (property === "insert" || property === "update" || property === "upsert" || property === "delete") {
          return async () => mutationResult;
        }

        return () => builder;
      },
    }
  );

  return builder;
}

export function createFallbackSupabaseClient() {
  const queryBuilder = createNoopQueryBuilder();

  return {
    from() {
      return queryBuilder;
    },
    rpc() {
      return Promise.resolve({
        data: null,
        error: createNotConfiguredError(),
      });
    },
    auth: {
      async getUser() {
        return {
          data: { user: null },
          error: null,
        };
      },
      async getSession() {
        return {
          data: { session: null },
          error: null,
        };
      },
      async signInWithPassword() {
        return {
          data: { user: null, session: null },
          error: createNotConfiguredError(),
        };
      },
      async signOut() {
        return {
          error: null,
        };
      },
    },
  } as const;
}
