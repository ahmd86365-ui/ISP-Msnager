import { describe, expect, it } from "vitest";

import { buildDeleteBlockReasons } from "@/lib/shared/delete-guard";
import { DeleteBlockedError } from "@/lib/shared/errors";

describe("buildDeleteBlockReasons", () => {
  it("returns no reasons when every dependent count is zero", () => {
    const reasons = buildDeleteBlockReasons({
      entityLabel: "هذا المشترك",
      dependents: [
        { count: 0, label: "اشتراك" },
        { count: 0, label: "دفعة" },
      ],
    });
    expect(reasons).toEqual([]);
  });

  it("lists only the dependents that have a non-zero count", () => {
    const reasons = buildDeleteBlockReasons({
      entityLabel: "هذا المشترك",
      dependents: [
        { count: 3, label: "اشتراك" },
        { count: 0, label: "دفعة" },
        { count: 5, label: "تذكرة دعم" },
      ],
    });
    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toContain("3 اشتراك");
    expect(reasons[0]).toContain("5 تذكرة دعم");
    expect(reasons[0]).not.toContain("دفعة");
    expect(reasons[0]).toContain("هذا المشترك");
  });

  it("appends the suggestion as a second reason when provided and blocking", () => {
    const reasons = buildDeleteBlockReasons({
      entityLabel: "هذه الباقة",
      dependents: [{ count: 2, label: "اشتراك" }],
      suggestion: "استخدم خيار التعطيل بدلاً من الحذف.",
    });
    expect(reasons).toHaveLength(2);
    expect(reasons[1]).toBe("استخدم خيار التعطيل بدلاً من الحذف.");
  });

  it("omits the suggestion entirely when nothing is blocking", () => {
    const reasons = buildDeleteBlockReasons({
      entityLabel: "هذه الباقة",
      dependents: [{ count: 0, label: "اشتراك" }],
      suggestion: "استخدم خيار التعطيل بدلاً من الحذف.",
    });
    expect(reasons).toEqual([]);
  });
});

describe("DeleteBlockedError", () => {
  it("carries the reasons array for the action layer to surface", () => {
    const err = new DeleteBlockedError(["سبب أول", "سبب ثانٍ"]);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("DeleteBlockedError");
    expect(err.reasons).toEqual(["سبب أول", "سبب ثانٍ"]);
  });
});
