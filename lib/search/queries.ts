import "server-only";

import { prisma } from "@/lib/prisma";
import { formatSyp } from "@/lib/format";
import {
  NETWORK_DEVICE_TYPE_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/labels";

// Bounded per query — see "sensible limits per result group" in the module
// plan. Network results (4 sub-kinds) are fetched at a smaller per-kind
// limit and truncated again after combining — see globalSearch() in
// lib/search/actions.ts.
const RESULT_LIMIT = 5;
const NETWORK_SUB_LIMIT = 3;

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

// A ticket has no stored number — same derived "#" + last 8 id chars shown
// on the ticket list/detail pages (see components/tickets/tickets-table.tsx).
// This recognizes a query that looks like that fragment (with or without a
// leading #) so typing a ticket number finds the ticket; anything that
// isn't a plausible id fragment (contains spaces, punctuation, etc.) is
// ignored so normal text searches don't get a spurious id filter.
function ticketIdFragment(query: string): string | null {
  const cleaned = query.replace(/^#/, "").trim();
  if (cleaned.length < 4 || cleaned.length > 25) {
    return null;
  }
  if (!/^[a-z0-9]+$/i.test(cleaned)) {
    return null;
  }
  return cleaned;
}

export async function searchCustomers(query: string): Promise<SearchResultItem[]> {
  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { phone2: { contains: query, mode: "insensitive" } },
        { customerNumber: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { fullName: "asc" },
    take: RESULT_LIMIT,
    select: { id: true, fullName: true, customerNumber: true, phone: true },
  });

  return customers.map((customer) => ({
    id: customer.id,
    title: customer.fullName,
    subtitle: `${customer.customerNumber} · ${customer.phone}`,
    href: `/customers/${customer.id}`,
  }));
}

export async function searchSubscriptions(query: string): Promise<SearchResultItem[]> {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      OR: [
        { plan: { name: { contains: query, mode: "insensitive" } } },
        { customer: { fullName: { contains: query, mode: "insensitive" } } },
        { customer: { phone: { contains: query, mode: "insensitive" } } },
        { customer: { customerNumber: { contains: query, mode: "insensitive" } } },
      ],
    },
    orderBy: { startDate: "desc" },
    take: RESULT_LIMIT,
    select: {
      id: true,
      status: true,
      plan: { select: { name: true } },
      customer: { select: { fullName: true } },
    },
  });

  return subscriptions.map((subscription) => ({
    id: subscription.id,
    title: `${subscription.customer.fullName} — ${subscription.plan.name}`,
    subtitle: SUBSCRIPTION_STATUS_LABELS[subscription.status],
    href: `/subscriptions/${subscription.id}`,
  }));
}

// No Payment detail page exists — results link to the customer's profile,
// where full payment history/context is already shown (see the approved
// plan's navigation mapping).
export async function searchPayments(query: string): Promise<SearchResultItem[]> {
  const payments = await prisma.payment.findMany({
    where: {
      OR: [
        { reference: { contains: query, mode: "insensitive" } },
        { customer: { fullName: { contains: query, mode: "insensitive" } } },
        { customer: { phone: { contains: query, mode: "insensitive" } } },
        { customer: { customerNumber: { contains: query, mode: "insensitive" } } },
      ],
    },
    orderBy: { paidAt: "desc" },
    take: RESULT_LIMIT,
    select: {
      id: true,
      amountSyp: true,
      paidAt: true,
      reference: true,
      customerId: true,
      customer: { select: { fullName: true } },
    },
  });

  return payments.map((payment) => ({
    id: payment.id,
    title: `${formatSyp(payment.amountSyp)} — ${payment.customer.fullName}`,
    subtitle: payment.reference
      ? `مرجع: ${payment.reference}`
      : payment.paidAt.toLocaleDateString("en-CA"),
    href: `/customers/${payment.customerId}`,
  }));
}

export async function searchTickets(query: string): Promise<SearchResultItem[]> {
  const idFragment = ticketIdFragment(query);

  const tickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { customer: { fullName: { contains: query, mode: "insensitive" } } },
        { customer: { phone: { contains: query, mode: "insensitive" } } },
        { customer: { customerNumber: { contains: query, mode: "insensitive" } } },
        ...(idFragment ? [{ id: { endsWith: idFragment, mode: "insensitive" as const } }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: RESULT_LIMIT,
    select: {
      id: true,
      title: true,
      status: true,
      customer: { select: { fullName: true } },
    },
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    subtitle: `#${ticket.id.slice(-8).toUpperCase()} · ${ticket.customer?.fullName ?? "بلاغ شبكة عام"} · ${TICKET_STATUS_LABELS[ticket.status]}`,
    href: `/tickets/${ticket.id}`,
  }));
}

export async function searchDevices(query: string): Promise<SearchResultItem[]> {
  const devices = await prisma.networkDevice.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { hostname: { contains: query, mode: "insensitive" } },
        { vendor: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
        { serialNumber: { contains: query, mode: "insensitive" } },
        { mac: { contains: query, mode: "insensitive" } },
        { managementIp: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take: NETWORK_SUB_LIMIT,
    select: { id: true, name: true, type: true, managementIp: true },
  });

  return devices.map((device) => ({
    id: device.id,
    title: device.name,
    subtitle: `جهاز · ${NETWORK_DEVICE_TYPE_LABELS[device.type]}${device.managementIp ? ` · ${device.managementIp}` : ""}`,
    href: `/network/devices/${device.id}`,
  }));
}

// No detail page exists — links to the (already searchable) buildings list
// page, pre-filtered by the same query.
export async function searchBuildings(query: string): Promise<SearchResultItem[]> {
  const buildings = await prisma.building.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { area: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take: NETWORK_SUB_LIMIT,
    select: { id: true, name: true, area: true },
  });

  return buildings.map((building) => ({
    id: building.id,
    title: building.name,
    subtitle: `بناء · ${building.area}`,
    href: `/network/buildings?q=${encodeURIComponent(building.name)}`,
  }));
}

// No detail page and no search param on that list page — links to the
// plain list (out of scope to add filtering there for this feature).
export async function searchDistributionPoints(query: string): Promise<SearchResultItem[]> {
  const points = await prisma.distributionPoint.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { area: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take: NETWORK_SUB_LIMIT,
    select: { id: true, name: true, code: true },
  });

  return points.map((point) => ({
    id: point.id,
    title: point.name,
    subtitle: `نقطة توزيع · ${point.code}`,
    href: `/network/distribution-points`,
  }));
}

// Finds which customer a searched IP/MAC currently belongs to — the
// "customer network assignment" requirement. Only current assignments are
// searched (isCurrent), matching how the rest of the app treats network
// history (see prisma/schema.prisma's NetworkAssignment comment).
export async function searchNetworkAssignments(query: string): Promise<SearchResultItem[]> {
  const assignments = await prisma.networkAssignment.findMany({
    where: {
      isCurrent: true,
      OR: [
        { ipAddress: { contains: query, mode: "insensitive" } },
        { macAddress: { contains: query, mode: "insensitive" } },
      ],
    },
    take: NETWORK_SUB_LIMIT,
    select: {
      id: true,
      ipAddress: true,
      macAddress: true,
      customerId: true,
      customer: { select: { fullName: true } },
    },
  });

  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.ipAddress ?? assignment.macAddress ?? "",
    subtitle: `ربط شبكي · المشترك: ${assignment.customer.fullName}`,
    href: `/customers/${assignment.customerId}`,
  }));
}
