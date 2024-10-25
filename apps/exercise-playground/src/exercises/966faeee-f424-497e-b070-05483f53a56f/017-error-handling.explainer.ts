import { TRPCError } from "@trpc/server";

// https://trpc.io/docs/server/error-handling

const error400 = new TRPCError({ code: "BAD_REQUEST" });
const error401 = new TRPCError({ code: "UNAUTHORIZED" });
const error403 = new TRPCError({ code: "FORBIDDEN" });
const error404 = new TRPCError({ code: "NOT_FOUND" });
const error405 = new TRPCError({ code: "METHOD_NOT_SUPPORTED" });
const error408 = new TRPCError({ code: "TIMEOUT" });
const error409 = new TRPCError({ code: "CONFLICT" });
const error412 = new TRPCError({ code: "PRECONDITION_FAILED" });
const error413 = new TRPCError({ code: "PAYLOAD_TOO_LARGE" });
const error415 = new TRPCError({ code: "UNSUPPORTED_MEDIA_TYPE" });
const error422 = new TRPCError({ code: "UNPROCESSABLE_CONTENT" });
const error429 = new TRPCError({ code: "TOO_MANY_REQUESTS" });
const error499 = new TRPCError({ code: "CLIENT_CLOSED_REQUEST" });
const error500 = new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
const error501 = new TRPCError({ code: "NOT_IMPLEMENTED" });
const error502 = new TRPCError({ code: "BAD_GATEWAY" });
const error503 = new TRPCError({ code: "SERVICE_UNAVAILABLE" });
const error504 = new TRPCError({ code: "GATEWAY_TIMEOUT" });