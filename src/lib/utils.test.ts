import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes", () => {
    expect(cn("mt-2", "px-2", "px-4")).toBe("mt-2 px-4");
  });
});
