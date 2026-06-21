"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { addComment } from "@/lib/erp-actions";
import { type ShipmentComment } from "@/lib/erp";
import { Icon } from "@/components/icon";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CommentsPanelProps {
  shipmentId: string;
  comments: ShipmentComment[];
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatRelative(date: Date | string) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function renderBody(body: string) {
  return body.split(/(@\w+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-medium text-primary/80">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function CommentsPanel({ shipmentId, comments }: CommentsPanelProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  function handleSubmit() {
    if (!text.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await addComment(shipmentId, text.trim());
        setText("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al añadir comentario");
      }
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={MessageSquare} size={16} className="text-muted-foreground" />
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          Comentarios
        </h2>
        {comments.length > 0 && (
          <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 font-mono text-base text-muted-foreground">
            {comments.length}
          </span>
        )}
      </div>

      {/* Lista */}
      {comments.length > 0 ? (
        <div className="mb-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-base font-semibold text-primary/80">
                {initials(c.authorName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-medium text-foreground">{c.authorName ?? "Usuario"}</span>
                  <span className="font-mono text-base text-muted-foreground/65">
                    {formatRelative(c.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-base leading-relaxed text-muted-foreground">
                  {renderBody(c.body)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-base text-muted-foreground/60">
          Sin comentarios todavía. Usa @nombre para mencionar a alguien.
        </p>
      )}

      {/* Input */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          rows={2}
          placeholder="Escribe un comentario… @menciona a alguien (⌘↵ para enviar)"
          aria-label="Escribe un comentario"
          aria-invalid={!!error}
          aria-describedby={error ? "comment-error" : undefined}
          className={cn(
            "w-full resize-none rounded-lg border bg-surface-2/30 px-3 py-2.5 pr-10 text-base text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors",
            error ? "border-destructive" : "border-border",
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={pending || !text.trim()}
          className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
          aria-label="Enviar comentario"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </div>
      {error && <p id="comment-error" role="alert" className="mt-1 text-base text-destructive">{error}</p>}
    </section>
  );
}
