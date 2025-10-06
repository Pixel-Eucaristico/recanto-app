import { cookies } from "next/headers";

const ONE_DAY = 60 * 60 * 24;

export const sessionService = {
  async set(token: string) {
    (await cookies()).set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ONE_DAY,
      path: "/",
    });
  },
  async clear() {
    (await cookies()).delete("session");
  },
  async get() {
    return (await cookies()).get("session")?.value ?? null;
  },
};
