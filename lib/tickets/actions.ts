"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import {
  addTicketCommentSchema,
  assignTicketSchema,
  createTicketSchema,
  updateTicketStatusSchema,
} from "./schema";
import {
  addTicketComment,
  assignTicketTechnician,
  createTicket,
  updateTicketStatus,
} from "./service";

export interface TicketFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

export interface CommentFormState {
  errors?: Record<string, string[]>;
  ok?: boolean;
}

const UNAUTHENTICATED_FORM_STATE: TicketFormState = {
  errors: { _form: ["يجب تسجيل الدخول للقيام بهذا الإجراء."] },
};
const UNAUTHENTICATED_MESSAGE = "يجب تسجيل الدخول للقيام بهذا الإجراء.";

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export async function createTicketAction(
  _prevState: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_FORM_STATE;
  }

  const parsed = createTicketSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createTicket({
      customerId: parsed.data.customerId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority,
      assignedTechnicianId: parsed.data.assignedTechnicianId,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء فتح البلاغ. حاول مرة أخرى."] } };
  }

  revalidatePath("/tickets");
  if (parsed.data.customerId) {
    revalidatePath(`/customers/${parsed.data.customerId}`);
  }
  return { ok: true };
}

// Bound to a fixed customer from the customer detail page — same rationale
// as createCustomerPaymentAction in lib/payments/actions.ts: the customerId
// comes from the caller, not the submitted FormData, so it cannot be
// tampered with via a modified form post.
export async function createCustomerTicketAction(
  customerId: string,
  _prevState: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const session = await auth();
  if (!session) {
    return UNAUTHENTICATED_FORM_STATE;
  }

  const parsed = createTicketSchema
    .omit({ customerId: true })
    .safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await createTicket({
      customerId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority,
      assignedTechnicianId: parsed.data.assignedTechnicianId,
      notes: parsed.data.notes,
      actorId: session.user.id,
    });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء فتح البلاغ. حاول مرة أخرى."] } };
  }

  revalidatePath("/tickets");
  revalidatePath(`/customers/${customerId}`);
  return { ok: true };
}

// Not FormData-based: these two are driven by an inline <Select> that fires
// on change (see components/tickets/ticket-status-select.tsx and
// ticket-assign-select.tsx), so they're called directly with plain
// arguments rather than through a <form action>.
export async function updateTicketStatusAction(ticketId: string, status: string) {
  const session = await auth();
  if (!session) {
    return { ok: false as const, error: UNAUTHENTICATED_MESSAGE };
  }

  const parsed = updateTicketStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { ok: false as const, error: "حالة غير صالحة." };
  }

  try {
    const ticket = await updateTicketStatus({
      ticketId,
      status: parsed.data.status,
      actorId: session.user.id,
    });
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);
    if (ticket.customerId) {
      revalidatePath(`/customers/${ticket.customerId}`);
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "حدث خطأ أثناء تحديث حالة البلاغ." };
  }
}

export async function assignTicketAction(ticketId: string, assignedTechnicianId: string) {
  const session = await auth();
  if (!session) {
    return { ok: false as const, error: UNAUTHENTICATED_MESSAGE };
  }

  const parsed = assignTicketSchema.safeParse({ assignedTechnicianId });
  if (!parsed.success) {
    return { ok: false as const, error: "اختيار غير صالح." };
  }

  try {
    const ticket = await assignTicketTechnician({
      ticketId,
      assignedTechnicianId: parsed.data.assignedTechnicianId,
      actorId: session.user.id,
    });
    revalidatePath("/tickets");
    revalidatePath(`/tickets/${ticketId}`);
    if (ticket.customerId) {
      revalidatePath(`/customers/${ticket.customerId}`);
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "حدث خطأ أثناء إسناد البلاغ." };
  }
}

export async function addTicketCommentAction(
  ticketId: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const session = await auth();
  if (!session) {
    return { errors: { _form: [UNAUTHENTICATED_MESSAGE] } };
  }

  const parsed = addTicketCommentSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await addTicketComment({ ticketId, body: parsed.data.body, actorId: session.user.id });
  } catch {
    return { errors: { _form: ["حدث خطأ أثناء إضافة التعليق."] } };
  }

  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true };
}
