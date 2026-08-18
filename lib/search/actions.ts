"use server";

import { auth } from "@/lib/auth";
import {
  searchBuildings,
  searchCustomers,
  searchDevices,
  searchDistributionPoints,
  searchNetworkAssignments,
  searchPayments,
  searchSubscriptions,
  searchTickets,
  type SearchResultItem,
} from "./queries";

const MIN_QUERY_LENGTH = 2;
const NETWORK_RESULT_LIMIT = 5;

export interface GlobalSearchResults {
  customers: SearchResultItem[];
  subscriptions: SearchResultItem[];
  payments: SearchResultItem[];
  tickets: SearchResultItem[];
  network: SearchResultItem[];
}

const EMPTY_RESULTS: GlobalSearchResults = {
  customers: [],
  subscriptions: [],
  payments: [],
  tickets: [],
  network: [],
};

export async function globalSearchAction(rawQuery: string): Promise<GlobalSearchResults> {
  const session = await auth();
  if (!session) {
    return EMPTY_RESULTS;
  }

  const query = rawQuery.trim();
  if (query.length < MIN_QUERY_LENGTH) {
    return EMPTY_RESULTS;
  }

  const [customers, subscriptions, payments, tickets, devices, assignments, buildings, points] =
    await Promise.all([
      searchCustomers(query),
      searchSubscriptions(query),
      searchPayments(query),
      searchTickets(query),
      searchDevices(query),
      searchNetworkAssignments(query),
      searchBuildings(query),
      searchDistributionPoints(query),
    ]);

  // Devices and assignments carry a real detail page or resolve to a
  // customer's own page — prioritized over the two list-only kinds when
  // truncating the combined network group down to its display limit.
  const network = [...devices, ...assignments, ...buildings, ...points].slice(
    0,
    NETWORK_RESULT_LIMIT,
  );

  return { customers, subscriptions, payments, tickets, network };
}
