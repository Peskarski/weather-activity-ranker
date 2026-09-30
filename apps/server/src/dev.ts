import { createServer } from "node:http";
import { GRAPHQL_ENDPOINT, yoga } from "./yoga.ts";

const PORT = Number(process.env.PORT ?? 4010);

createServer(yoga).listen(PORT, () => {
  console.log(`GraphQL API on http://localhost:${PORT}${GRAPHQL_ENDPOINT}`);
});
