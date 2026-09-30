import { GraphQLError } from "graphql";

export type ErrorCode = "BAD_USER_INPUT" | "PLACE_NOT_FOUND" | "UPSTREAM_UNAVAILABLE";

export const apiError = (code: ErrorCode, message: string) =>
  new GraphQLError(message, { extensions: { code } });
