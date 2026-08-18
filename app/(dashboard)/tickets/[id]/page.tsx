import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusTag } from "@/components/shared/status-tag";
import { TicketStatusSelect } from "@/components/tickets/ticket-status-select";
import { TicketAssignSelect } from "@/components/tickets/ticket-assign-select";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { getTicketById, listActiveUsersForAssignSelect } from "@/lib/tickets/queries";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_STYLE,
} from "@/lib/labels";
import { formatRelativeArabic } from "@/lib/format";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicketById(id);

  if (!ticket) {
    notFound();
  }

  const technicians = await listActiveUsersForAssignSelect();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">{ticket.title}</h1>
              <StatusTag
                color={TICKET_PRIORITY_STYLE[ticket.priority].color}
                tint={TICKET_PRIORITY_STYLE[ticket.priority].tint}
                label={TICKET_PRIORITY_LABELS[ticket.priority]}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {ticket.customer ? (
                <>
                  المشترك:{" "}
                  <Link
                    href={`/customers/${ticket.customer.id}`}
                    className="text-foreground hover:underline"
                  >
                    {ticket.customer.fullName}
                  </Link>{" "}
                  — {ticket.customer.customerNumber}
                </>
              ) : (
                "بلاغ شبكة عام"
              )}
            </p>
          </div>
          {ticket.customer && (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={`/customers/${ticket.customer.id}`} />}
            >
              <ArrowRight className="size-4" />
              الذهاب لصفحة المشترك
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="mb-3 font-heading text-base font-medium text-foreground">
              تفاصيل البلاغ
            </h2>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">التصنيف</dt>
              <dd className="text-end text-foreground">
                {TICKET_CATEGORY_LABELS[ticket.category]}
              </dd>
              <dt className="text-muted-foreground">تاريخ الإنشاء</dt>
              <dd className="text-end text-foreground">
                {formatRelativeArabic(ticket.createdAt)}
              </dd>
              <dt className="text-muted-foreground">أنشأه</dt>
              <dd className="text-end text-foreground">{ticket.createdBy.name}</dd>
              {ticket.resolvedAt && (
                <>
                  <dt className="text-muted-foreground">تاريخ الحل</dt>
                  <dd className="text-end text-foreground">
                    {formatRelativeArabic(ticket.resolvedAt)}
                  </dd>
                  <dt className="text-muted-foreground">حلّه</dt>
                  <dd className="text-end text-foreground">{ticket.resolvedBy?.name ?? "—"}</dd>
                </>
              )}
            </dl>
            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">الوصف</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {ticket.description}
              </p>
            </div>
            {ticket.notes && (
              <div className="mt-3 border-t pt-3">
                <p className="text-xs text-muted-foreground">ملاحظات</p>
                <p className="mt-1 text-sm text-foreground">{ticket.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4">
            <h2 className="font-heading text-base font-medium text-foreground">
              الحالة والإسناد
            </h2>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">الحالة</span>
              <TicketStatusSelect ticketId={ticket.id} status={ticket.status} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">الفني المسؤول</span>
              <TicketAssignSelect
                ticketId={ticket.id}
                assignedTechnicianId={ticket.assignedTechnicianId}
                technicians={technicians}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-3 font-heading text-base font-medium text-foreground">التعليقات</h2>
          <TicketComments ticketId={ticket.id} comments={ticket.comments} />
        </CardContent>
      </Card>
    </div>
  );
}
