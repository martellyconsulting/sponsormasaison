"use client";

import { useEffect, useState } from "react";

const GLB_PATH = "/models/athlete.glb";

/**
 * Vérifie si le scan corporel réel a été déposé dans public/models/athlete.glb
 * avant de tenter de le charger — évite de déclencher une erreur Suspense/404
 * bruyante et permet de retomber proprement sur l'avatar procédural.
 */
export function useGlbAvailability(): { checked: boolean; available: boolean; path: string } {
  const [available, setAvailable] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(GLB_PATH, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { checked, available, path: GLB_PATH };
}
