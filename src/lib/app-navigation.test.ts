import { describe, expect, it } from "vitest";

import { isNavigationItemActive } from "@/lib/app-navigation";

describe("isNavigationItemActive", () => {
  it("marks exact and nested routes active without matching similar paths", () => {
    expect(isNavigationItemActive("/medications", "/medications")).toBe(true);
    expect(isNavigationItemActive("/medications/routine-id/reference", "/medications")).toBe(true);
    expect(isNavigationItemActive("/medication-history", "/medications")).toBe(false);
  });
});
