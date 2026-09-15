"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Petit morceau 100% généré en code (aucun fichier audio, aucune question de
// droits) : rythmique énergique en mi mineur, ~126 BPM, boucle de 16 pas.
const BPM = 126;
const STEPS = 16;
const KICK_STEPS = new Set([0, 4, 8, 12]);
const BASS_PATTERN: Array<number | null> = [
  82.41, null, null, 82.41, null, null, 98.0, null, 82.41, null, 73.42, null, 98.0, null, null, null,
]; // E2, G2, E2, D2, G2
const LEAD_PATTERN: Array<number | null> = [
  329.63, null, null, 392.0, null, null, null, 493.88, null, null, 659.25, null, null, 493.88, null, null,
]; // E4, G4, B4, E5, B4

function stepDurationSeconds() {
  return 60 / BPM / 4; // croches en doubles-croches (16e de temps)
}

export function useMotivationalBeat() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextStepTimeRef = useRef(0);
  const currentStepRef = useRef(0);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterGainRef.current = master;
    }
    return ctxRef.current;
  }, []);

  const playKick = useCallback((ctx: AudioContext, time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(masterGainRef.current!);
    osc.start(time);
    osc.stop(time + 0.16);
  }, []);

  const playHat = useCallback((ctx: AudioContext, time: number, accent: boolean) => {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(accent ? 0.18 : 0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGainRef.current!);
    noise.start(time);
    noise.stop(time + 0.05);
  }, []);

  const playTone = useCallback(
    (ctx: AudioContext, time: number, freq: number, duration: number, type: OscillatorType, peak: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(peak, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain);
      gain.connect(masterGainRef.current!);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    },
    [],
  );

  const scheduleStep = useCallback(
    (step: number, time: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (KICK_STEPS.has(step)) playKick(ctx, time);
      playHat(ctx, time, step % 4 === 2);
      const bassFreq = BASS_PATTERN[step];
      if (bassFreq) playTone(ctx, time, bassFreq, 0.22, "sawtooth", 0.5);
      const leadFreq = LEAD_PATTERN[step];
      if (leadFreq) playTone(ctx, time, leadFreq, 0.3, "triangle", 0.28);
    },
    [playKick, playHat, playTone],
  );

  const scheduler = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    while (nextStepTimeRef.current < ctx.currentTime + 0.1) {
      scheduleStep(currentStepRef.current, nextStepTimeRef.current);
      nextStepTimeRef.current += stepDurationSeconds();
      currentStepRef.current = (currentStepRef.current + 1) % STEPS;
    }
    timerRef.current = window.setTimeout(scheduler, 25);
  }, [scheduleStep]);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      const ctx = ensureContext();
      if (next) {
        if (ctx.state === "suspended") ctx.resume();
        currentStepRef.current = 0;
        nextStepTimeRef.current = ctx.currentTime + 0.05;
        scheduler();
      } else {
        stop();
      }
      return next;
    });
  }, [ensureContext, scheduler, stop]);

  useEffect(() => {
    return () => {
      stop();
      ctxRef.current?.close().catch(() => {});
    };
  }, [stop]);

  return { enabled, toggle };
}
