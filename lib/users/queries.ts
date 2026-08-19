import "server-only";

import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

// Never selects passwordHash — every list/detail read in this module goes
// through this explicit column list so a hash can never leak into a page or
// client bundle by accident.
const USER_LIST_SELECT = {
  id: true,
  username: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export interface ListUsersParams {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
}

export async function listUsers(params: ListUsersParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.UserWhereInput = {};

  if (params.search) {
    const search = params.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }
  if (params.role) {
    where.role = params.role;
  }
  if (params.isActive !== undefined) {
    where.isActive = params.isActive;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: USER_LIST_SELECT,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
