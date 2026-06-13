import { TRACKING_TYPE, portLabel, formatDateTime } from "@/lib/erp-format";
import { cn } from "@/lib/utils";
import type { ShipmentDetail } from "@/lib/erp";

function SourceBadge({ source }: { source: string }) {
  if (source === "shipsgo") {
    return (
      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-px font-mono text-base font-medium text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        ShipsGo · real
      </span>
    );
  }
  if (source === "mock") {
    return (
      <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-px font-mono text-base text-muted-foreground">
        Simulación
      </span>
    );
  }
  return null;
}

export function TrackingTimeline({
  events,
}: {
  events: ShipmentDetail["trackingEvents"];
}) {
  if (!events.length) {
    return (
      <p className="text-base text-muted-foreground">
        Sin eventos de tracking todavía.
      </p>
    );
  }

  return (
    <ol>
      {events.map((e, i) => {
        const current = i === 0; // el más reciente (orden desc)
        const last = i === events.length - 1;
        return (
          <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "z-10 mt-1 rounded-full",
                  current
                    ? "size-2.5 bg-accent ring-4 ring-accent/20"
                    : "size-2 bg-muted-foreground/50",
                )}
              />
              {!last && (
                <span className="absolute top-3 h-full w-px bg-border" />
              )}
            </div>
            <div className="-mt-0.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p
                  className={cn(
                    "flex items-center text-base",
                    current
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {TRACKING_TYPE[e.type] ?? e.type}
                  <SourceBadge source={e.source} />
                </p>
                <p className="font-mono text-base text-muted-foreground">
                  {formatDateTime(e.occurredAt)}
                </p>
              </div>
              {(e.description || e.location) && (
                <p className="mt-0.5 text-base text-muted-foreground">
                  {e.description}
                  {e.location ? ` · ${portLabel(e.location)}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
