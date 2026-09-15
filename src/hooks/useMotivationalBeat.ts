"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Musique de fond : extraite de la vidéo de l'athlète (piste audio d'origine),
// jouée en boucle, coupable via le bouton son (voir SoundToggle).
export function useMotivationalBeat() {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = document.createElement("audio");
      audio.loop = true;
      audio.volume = 0.5;
      audio.preload = "auto";

      const m4aSource = document.createElement("source");
      m4aSource.src = "/audio/theme.m4a";
      m4aSource.type = "audio/mp4";
      const mp3Source = document.createElement("source");
      mp3Source.src = "/audio/theme.mp3";
      mp3Source.type = "audio/mpeg";
      audio.appendChild(m4aSource);
      audio.appendChild(mp3Source);

      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      const audio = ensureAudio();
      if (next) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
      return next;
    });
  }, [ensureAudio]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return { enabled, toggle };
}
