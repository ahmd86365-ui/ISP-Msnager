// Thrown by any module's delete service when dependent records make a hard
// delete unsafe (see lib/shared/delete-guard.ts for how the reasons are
// built). Server actions catch this and surface `reasons` to the UI instead
// of a raw database error.
export class DeleteBlockedError extends Error {
  reasons: string[];

  constructor(reasons: string[]) {
    super(`Delete blocked: ${reasons.join("; ")}`);
    this.name = "DeleteBlockedError";
    this.reasons = reasons;
  }
}

// Thrown by a service function when the acting user is authenticated but
// not allowed to perform this specific action (e.g. an ADMIN acting on an
// OWNER account — see lib/users/guard.ts). Server actions catch this and
// surface `message` to the UI instead of a raw database/authorization error.
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
