"use client";
import { useState, useEffect } from "react";
import { TrainingData, getConfidence, CATEGORIES } from "./data";
import SkylarBuddy from "./SkylarBuddy";
import { sfxCorrect, sfxTap, sfxCelebrate } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";
import { useSpeakLock } from "./useSpeakLock";

const STEPS = [
  { label: "🚁 Taking off!", desc: "Up, up, and away!", voice: VOICE.q5Step1 },
  { label: "🌤️ Checking the sky", desc: "Are the birds safe?", voice: VOICE.q5Step2 },
  { label: "🌳 Flying over land", desc: "Checking on the animals!", voice: VOICE.q5Step3 },
  { label: "🌊 Swooping over water", desc: "Looking for sea friends!", voice: VOICE.q5Step4 },
  { label: "🏆 All safe!", desc: "Every animal is home!", voice: VOICE.q5Step5 },
];

export default function FinalFlight({ training, onComplete }: { training: TrainingData; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [auto, setAuto] = useState(false);
  const locked = useSpeakLock();

  useEffect(() => { speak(VOICE.q5Start); return () => { stopSpeaking(); }; }, []);

  useEffect(() => {
    if (!auto || done) return;
    const next = step + 1;
    const t = setTimeout(() => {
      sfxCorrect();
      if (next >= STEPS.length) { setDone(true); sfxCelebrate(); speak(VOICE.q5Done); }
      else { setStep(next); speak(STEPS[next].voice); }
    }, 2500);
    return () => clearTimeout(t);
  }, [auto, step, done]);

  const avgConf = Math.round(CATEGORIES.reduce((sum, c) => sum + getConfidence(training, c), 0) / CATEGORIES.length);

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={true} />
        <SkylarBuddy mood="celebrate" size={180} />
        <h2 className="text-3xl font-bold text-center">🎉 All Animals Saved!</h2>
        <p className="text-xl opacity-80 text-center">You&apos;re Skylar&apos;s best friend!</p>
        <button className="btn btn-success text-xl px-8 py-4 mt-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.q5Learned); onComplete(); }}>
          🏠 Done!
        </button>
      </div>
    );
  }

  const current = STEPS[step];
  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-4 sm:p-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">✈️ Final Flight!</h2>
      <SkylarBuddy mood={auto ? "happy" : "idle"} size={120} />
      <div className="w-48">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <div className="text-center text-sm mt-1 opacity-70">{step + 1} / {STEPS.length}</div>
      </div>
      <div className="text-4xl my-2">{current.label}</div>
      <div className="text-xl font-semibold text-center">{current.desc}</div>
      <div className="flex flex-col gap-1 w-64 text-sm opacity-60">
        {STEPS.slice(0, step + 1).map((s, i) => <div key={i}>✅ {s.label}</div>)}
      </div>
      {!auto ? (
        <button className="btn btn-primary text-2xl px-10 py-5 mt-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.q5Launch).then(() => { speak(STEPS[0].voice); setAuto(true); }); }}>
          🚁 Let&apos;s Fly!
        </button>
      ) : (
        <div className="text-lg opacity-50 mt-4">✈️ Skylar is flying...</div>
      )}
    </div>
  );
}
