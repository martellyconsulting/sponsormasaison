"use client";

import { useEffect, useState } from "react";

function splitTime(msRemaining: number) {
  const clamped = Math.max(msRemaining, 0);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative overflow-hidden rounded-md bg-arena-panel border border-arena-line px-2 py-1 min-w-[2.4rem] text-center">
        <span key={padded} className="block font-display text-lg sm:text-xl tabular-nums animate-flip-in">
          {padded}
        </span>
      </div>
      <span className="text-[0.6rem] uppercase tracking-widest text-arena-steel">{label}</span>
    </div>
  );
}

export function Countdown({
  deadline,
  serverTimeOffsetMs = 0,
  compact = false,
}: {
  deadline: string;
  serverTimeOffsetMs?: number;
  compact?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now() + serverTimeOffsetMs);
    const id = setInterval(() => setNow(Date.now() + serverTimeOffsetMs), 1000);
    return () => clearInterval(id);
  }, [serverTimeOffsetMs]);

  if (now === null) {
    // Évite un mismatch d'hydratation : rien n'est calculé côté serveur.
    return <div className="h-[3.4rem]" aria-hidden />;
  }

  const remaining = new Date(deadline).getTime() - now;
  const { days, hours, minutes, seconds } = splitTime(remaining);
  const closed = remaining <= 0;

  if (closed) {
    return (
      <span className="inline-flex items-center gap-2 text-arena-ember font-display text-sm uppercase tracking-wide">
        Enchères closes
      </span>
    );
  }

  if (compact) {
    return (
      <span className="tabular-nums font-display text-sm text-arena-volt">
        {days > 0 ? `${days}j ` : ""}
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <Digit value={days} label="jours" />
      <span className="pb-4 text-arena-line font-display">:</span>
      <Digit value={hours} label="heures" />
      <span className="pb-4 text-arena-line font-display">:</span>
      <Digit value={minutes} label="min" />
      <span className="pb-4 text-arena-line font-display">:</span>
      <Digit value={seconds} label="sec" />
    </div>
  );
}
