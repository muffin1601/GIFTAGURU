import type { Instrumentation } from "next";

/**
 * Server-render and Server Action failures are otherwise redacted by Next.js
 * before they reach app/error.tsx in production. This makes the digest from
 * the admin error screen match a concise, safe server log entry.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;

  console.error("Next request error", {
    message,
    digest,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
