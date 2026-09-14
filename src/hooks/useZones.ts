"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ZoneDTO, ZonesResponse } from "@/types/zone";

const POLL_INTERVAL_MS = 7000;

export type ZonesState = {
  zones: ZoneDTO[];
  serverTimeOffsetMs: number; // à ajouter à Date.now() côté client pour recaler les décomptes
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Sonde /api/zones à intervalle régulier pour que tous les visiteurs voient
 * les prix, sponsors et logos se mettre à jour automatiquement, sans
 * recharger la page (temps réel léger — pas besoin de WebSocket pour un
 * état qui change au rythme d'enchères humaines).
 */
export function useZones(): ZonesState {
  const [zones, setZones] = useState<ZoneDTO[]>([]);
  const [serverTimeOffsetMs, setServerTimeOffsetMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const fetchZones = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch("/api/zones", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ZonesResponse = await res.json();
      setZones(data.zones);
      setServerTimeOffsetMs(new Date(data.serverTime).getTime() - Date.now());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    fetchZones();
    const interval = setInterval(fetchZones, POLL_INTERVAL_MS);

    // Rafraîchit aussi dès que l'onglet redevient visible (retour du sponsor
    // après paiement, par exemple) pour une sensation plus instantanée.
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchZones();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchZones]);

  return { zones, serverTimeOffsetMs, loading, error, refetch: fetchZones };
}
