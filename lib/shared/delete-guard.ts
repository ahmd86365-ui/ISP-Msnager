// Pure "should this delete be blocked" logic, kept separate from each
// module's Prisma-querying service.ts so it's directly unit-testable
// without a live database (this project's test environment has no DB —
// see tests/unit/delete-guard.test.ts). Every entity's delete service
// counts its dependent records, then hands the counts to this function to
// build the (or lack of) blocking reasons shown to the user in Arabic.

export interface DependentRecordCount {
  count: number;
  label: string;
}

export function buildDeleteBlockReasons(params: {
  entityLabel: string;
  dependents: DependentRecordCount[];
  suggestion?: string;
}): string[] {
  const blocking = params.dependents.filter((dependent) => dependent.count > 0);
  if (blocking.length === 0) {
    return [];
  }

  const list = blocking.map((dependent) => `${dependent.count} ${dependent.label}`).join("، ");
  const reasons = [`لا يمكن حذف ${params.entityLabel} نهائياً لوجود سجلات مرتبطة به: ${list}.`];
  if (params.suggestion) {
    reasons.push(params.suggestion);
  }
  return reasons;
}
