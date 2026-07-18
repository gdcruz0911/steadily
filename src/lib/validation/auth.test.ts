import { describe, expect, it } from "vitest";

import { authCredentialsSchema } from "@/lib/validation/auth";

describe("authCredentialsSchema", () => {
  it("accepts a valid email and password", () => {
    expect(
      authCredentialsSchema.safeParse({
        email: "person@example.test",
        password: "long-enough-password",
      }).success,
    ).toBe(true);
  });

  it("rejects malformed credentials", () => {
    expect(
      authCredentialsSchema.safeParse({
        email: "not-an-email",
        password: "short",
      }).success,
    ).toBe(false);
  });
});
