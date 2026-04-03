"use client";
import { useEffect } from "react";
import { CATEGORIES, TrainingData, getConfidence, CAT_LABELS } from "./data";
import SkylarBuddy from "./SkylarBuddy";
import { sfxTap } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import { useSpeakLock } from "./useSpeakLock";

export default function TrainingSummary({ training, onComplete }: { training: TrainingData; onComplete: () => void }) {
  const total = Object.values(training).reduce((a, b) => a + b, 0);
  const missing = CATEGORIES.filter((c) => !training[c]);
  const maxCat = CATEGORIES.reduce((a, b) => ((training[a] || 0) > (training[b] || 0) ? a : b));
  const maxCount = training[maxCat] || 0;
  const isBiased = total > 0 && maxCount / total > 0.5;
  const locked = useSpeakLock();

  useEffect(() => { speak(VOICE.summary).then(() => { if (isBiased) speak(VOICE.summaryBias); }); return () => { stopSpeaking(); }; }, [isBiased]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-8 fade-in">
      <SkylarBuddy mood="thinking" size={120} />
      <h2 className="text-3xl font-bold text-center">🧠 Skylar&apos;s Brain!</h2>
      <p className="text-lg opacity-80 text-center">You taught me <b>{total}</b> things!</p>
      <div className="flex flex-col gap-4 w-64">
        {CATEGORIES.map((cat) => {
          const count = training[cat] || 0;
          const conf = getConfidence(training, cat);
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const info = CAT_LABELS[cat];
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-3xl">{info.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{info.label}</span>
                  <span>{count === 0 ? "⚠️" : `${count} — ${conf}%`}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: count === 0 ? "#ef4444" : undefined }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isBiased && (
        <div className="rounded-xl p-4 max-w-sm text-center" style={{ background: "rgba(251,191,36,0.15)", border: "2px solid #fbbf24" }}>
          <p className="text-base font-bold" style={{ color: "#fbbf24" }}>⚠️ Oops!</p>
          <p className="text-sm opacity-80 mt-1">I know a lot about <b>{CAT_LABELS[maxCat].label}</b> but not the others!</p>
        </div>
      )}
      <button className="btn btn-success text-xl px-8 py-4 mt-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.summaryLearned); onComplete(); }}>
        Test Me! →
      </button>
    </div>
  );
}
