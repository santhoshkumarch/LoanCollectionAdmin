export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: new Set(["*"]),

  ADMIN: new Set([
    "managers:view",
    "managers:create",
    "managers:delete",

    "shops:view",
    "shops:create",
    "shops:delete",

    "customers:view",
    "customers:create",
    "customers:update",
    "customers:approve",
    "customers:reject",
    "customers:delete",

    "cashiers:view",
    "cashiers:create",
    "cashiers:update",
    "cashiers:delete",
    // cashiers:approve → SUPER_ADMIN only

    "loans:view",
    "loans:create",
    "loans:update",
    "loans:settle",
    // loans:approveSettlement, loans:delete → SUPER_ADMIN only

    "collections:view",
    "collections:create",
    "collections:verify",
    // collections:delete → SUPER_ADMIN only

    "cashbox:view",
    "cashbox:create",
    "cashbox:update",

    "approvals:view",
    "approvals:approve",
    "approvals:reject",

    "reports:view",
    "notifications:view",
  ]),

  MANAGER: new Set([
    "shops:view",
    "shops:create",
    "shops:delete",

    "cashiers:view",
    "cashiers:create",
    "cashiers:update",
    "cashiers:delete",

    "customers:view",
    "loans:view",
    "collections:view",
    "reports:view",
    "notifications:view",
  ]),

  CASHIER: new Set([]),
};
