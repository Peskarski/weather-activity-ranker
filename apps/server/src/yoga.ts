import { readFileSync } from "node:fs";
import { createSchema, createYoga } from "graphql-yoga";
import { resolvers } from "./graphql/resolvers.ts";

export const GRAPHQL_ENDPOINT = "/api/graphql";

const typeDefs = readFileSync(new URL("./graphql/schema.graphql", import.meta.url), "utf8");

export const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: GRAPHQL_ENDPOINT,
  landingPage: false,
});
