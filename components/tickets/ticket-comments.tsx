"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeArabic } from "@/lib/format";
import { addTicketCommentAction, type CommentFormState } from "@/lib/tickets/actions";

export interface CommentRow {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string };
}

const INITIAL_STATE: CommentFormState = {};

export function TicketComments({
  ticketId,
  comments,
}: {
  ticketId: string;
  comments: CommentRow[];
}) {
  const boundAction = addTicketCommentAction.bind(null, ticketId);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);
  const errors = state.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">لا توجد تعليقات بعد.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {comment.author.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeArabic(comment.createdAt)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {comment.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} action={formAction} className="flex flex-col gap-2 border-t pt-4">
        {errors._form && (
          <p role="alert" className="text-sm text-destructive">
            {errors._form[0]}
          </p>
        )}
        <Textarea name="body" rows={3} placeholder="أضف تعليقاً..." required />
        {errors.body && <p className="text-xs text-destructive">{errors.body[0]}</p>}
        <Button type="submit" disabled={isPending} size="sm" className="self-end">
          {isPending ? "جارٍ الإضافة..." : "إضافة تعليق"}
        </Button>
      </form>
    </div>
  );
}
