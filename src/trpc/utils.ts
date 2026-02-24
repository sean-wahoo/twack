import { TRPCError } from "@trpc/server";
import {
  PrismaClientUnknownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@/prisma/generated/prisma/internal/prismaNamespace";

export const trpcErrorHandling = (e: unknown) => {
  if (e instanceof PrismaClientKnownRequestError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-known-request-error",
      cause: e,
    });
  }
  if (e instanceof PrismaClientUnknownRequestError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-unknown-request-error",
      cause: e,
    });
  }
  if (e instanceof PrismaClientInitializationError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-initialization-error",
      cause: e,
    });
  }
  if (e instanceof PrismaClientValidationError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-validation-error",
      cause: e,
    });
  }
  if (e instanceof PrismaClientRustPanicError) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "prisma-client-rust-panic-error",
      cause: e,
    });
  }
  if (!(e instanceof TRPCError)) {
    console.log({ e });
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "idk man",
      cause: e,
    });
  } else {
    return e as TRPCError;
  }
};
