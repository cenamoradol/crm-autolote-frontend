export const COOKIE_ACCESS = "crmautolo_at";
export const COOKIE_REFRESH = "crmautolo_rt";
export const COOKIE_SA_STORE = "crmautolo_sa_store";

export function cookieBaseOptions() {
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false");

  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure,
    path: "/"
  };
}
