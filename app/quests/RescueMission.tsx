"use client";
import { useState, useEffect, useCallback } from "react";
import { RESCUE_EVENTS } from "./data";
import SkylarBuddy from "./SkylarBuddy";
import { sfxCorrect, sfxWrong, sfxTap, sfxCelebrate } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";
import { useSpeakLock } from "./useSpeakLock";

export default function RescueMission({ onComplete }: { onComplete: () => void }) {
  const [events] = useState(() => [...RESCUE_EVENTS]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"flying" | "event" | "result">("flying");
  const [rescued, setRescued] = useState(false);
  const [aiActed, setAiActed] = useState(false);
  const [saves, setSaves] = useState(0);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => { speak(VOICE.q4Start); return () => { stopSpeaking(); }; }, []);

  const event = events[idx];
  const needsRescue = event.correct === "rescue";
  const locked = useSpeakLock();

  useEffect(() => {
    if (phase !== "flying") return;
    const t = setTimeout(() => { setPhase("event"); setTimer(0); }, 1200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "event") return;
    const t = setInterval(() => setTimer((v) => v + 100), 100);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "event" || rescued || aiActed) return;
    if (timer >= event.delay) setAiActed(true);
  }, [phase, timer, event.delay, rescued, aiActed]);

  useEffect(() => {
    if (!aiActed || phase !== "event") return;
    if (!needsRescue) { sfxCorrect(); speak(VOICE.q4AiRight); }
    else { sfxWrong(); speak(VOICE.q4Crash); }
    setPhase("result");
  }, [aiActed, phase, needsRescue]);

  const rescue = useCallback(() => {
    if (phase !== "event" || aiActed) return;
    setRescued(true); setPhase("result");
    if (needsRescue) { setSaves((s) => s + 1); sfxCorrect(); speak(VOICE.q4Save); }
    else { speak(VOICE.q4FalseAlarm); }
  }, [phase, aiActed, needsRescue]);

  const advance = () => {
    if (idx + 1 >= events.length) { setDone(true); return; }
    setIdx(idx + 1); setPhase("flying"); setRescued(false); setAiActed(false); setTimer(0);
  };

  if (done) {
    const totalRescue = events.filter((e) => e.correct === "rescue").length;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={true} />
        <SkylarBuddy mood="celebrate" size={160} />
        <h2 className="text-3xl font-bold text-center">🎉 Rescue Done!</h2>
        <div className="text-2xl">🦸 Saved: {saves}/{totalRescue}</div>
        <button className="btn btn-success text-xl px-8 py-4 mt-4" disabled={locked} onClick={() => { sfxTap(); sfxCelebrate(); speak(VOICE.q4Learned); onComplete(); }}>
          Final Mission! →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-4 sm:p-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">🚁 Rescue Mission!</h2>
      <SkylarBuddy mood={phase === "event" && needsRescue ? "scared" : "idle"} size={100} />
      <div className="text-sm opacity-70">{idx + 1} / {events.length}</div>
      <div className="w-full max-w-sm h-28 rounded-2xl relative overflow-hidden" style={{ background: "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 50%, #86efac 100%)" }}>
        <div className="text-4xl absolute" style={{ left: "20%", top: "20%", animation: "float 2s ease-in-out infinite alternate" }}>🚁</div>
        {phase !== "flying" && <div className="text-5xl absolute top-1/2 right-8" style={{ transform: "translateY(-50%)" }}>{event.emoji}</div>}
        {[15, 45, 75].map((x) => <div key={x} className="absolute text-lg opacity-30" style={{ left: `${x}%`, top: "10%" }}>☁️</div>)}
      </div>
      {phase === "event" && <div className="text-xl font-semibold text-center">{event.label}</div>}
      {phase === "event" && needsRescue && !rescued && !aiActed && (
        <button className="btn text-2xl px-10 py-6" style={{ background: "#ef4444", color: "white", minWidth: 160, minHeight: 80, animation: "pulse 0.6s infinite alternate" }}
          onClick={() => { sfxTap(); rescue(); }}>
          🛟 RESCUE!
        </button>
      )}
      {phase === "event" && !needsRescue && !aiActed && (
        <div className="text-lg opacity-60">✈️ Skylar is flying...</div>
      )}
      {phase === "result" && (
        <div className="flex flex-col items-center gap-3 fade-in">
          <div className="text-xl text-center" style={{ color: (rescued && needsRescue) || (!needsRescue) ? "var(--success)" : "var(--warn)" }}>
            {rescued && needsRescue ? "🦸 You saved them!" : rescued && !needsRescue ? "😅 They were already safe!" : !needsRescue ? "✈️ All clear!" : "😅 Oops, missed that one!"}
          </div>
          <button className="btn btn-primary text-lg px-6 py-4" onClick={advance}>Continue →</button>
        </div>
      )}
      <div className="text-lg opacity-70">🦸 Saved: {saves}</div>
    </div>
  );
}
