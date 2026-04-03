"use client";
import { useState, useEffect } from "react";
import { TrainingData, generateTestRounds, CAT_LABELS } from "./data";
import SkylarBuddy from "./SkylarBuddy";
import { sfxCorrect, sfxWrong, sfxTap } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";

export default function TestKnowledge({ training, onComplete }: { training: TrainingData; onComplete: (needsRetrain: boolean) => void }) {
  const [rounds] = useState(() => generateTestRounds(training));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [mood, setMood] = useState<"thinking" | "happy" | "scared">("thinking");
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { speak(VOICE.q3Start); return () => { stopSpeaking(); }; }, []);
  const scene = rounds[idx];

  const advance = () => { setPicked(null); setMood("thinking"); setShowConfetti(false); if (idx + 1 < rounds.length) setIdx(idx + 1); else setDone(true); };

  const choose = (c: string) => {
    setPicked(c);
    if (c === scene.correct) { sfxCorrect(); setMood("happy"); setShowConfetti(true); setTimeout(advance, 1200); }
    else { sfxWrong(); setMood("scared"); setMistakes((m) => m + 1); setTimeout(advance, 1200); }
  };

  if (done) {
    const needsRetrain = mistakes >= 3;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={!needsRetrain} />
        <SkylarBuddy mood={needsRetrain ? "scared" : "celebrate"} size={140} />
        <h2 className="text-3xl font-bold text-center">{needsRetrain ? "Let's practice more!" : "🎉 Great job!"}</h2>
        {needsRetrain ? (
          <div className="flex gap-3 mt-4">
            <button className="btn text-lg px-6 py-4" style={{ background: "var(--accent)", color: "#1a0f2e" }} onClick={() => { stopSpeaking(); sfxTap(); speak(VOICE.q3Retrain); onComplete(true); }}>🔄 Learn Again</button>
            <button className="btn text-lg px-6 py-4" onClick={() => { stopSpeaking(); sfxTap(); onComplete(false); }}>Continue →</button>
          </div>
        ) : <button className="btn btn-success text-xl px-8 py-4 mt-4" onClick={() => { stopSpeaking(); sfxTap(); speak(VOICE.q3Learned); onComplete(false); }}>Rescue Time! →</button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-4 sm:p-8 fade-in">
      <Confetti active={showConfetti} />
      <h2 className="text-2xl sm:text-3xl font-bold text-center">🧪 Is Skylar right?</h2>
      <SkylarBuddy mood={mood} size={100} />
      <div className="text-sm opacity-70">{idx + 1} / {rounds.length}</div>
      <div style={{ fontSize: "5rem" }}>{scene.emoji}</div>
      <div className="text-xl font-semibold text-center">{scene.label}</div>
      <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.05)" }}>
        <span className="text-sm opacity-60">Skylar says: </span>
        <span className="text-lg font-bold">{CAT_LABELS[scene.aiChoice]?.emoji} {CAT_LABELS[scene.aiChoice]?.label}</span>
      </div>
      {picked ? (
        <div className="text-xl text-center fade-in" style={{ color: picked === scene.correct ? "var(--success)" : "var(--warn)" }}>
          {picked === scene.correct ? "✅ Yes!" : `Oops! It's ${CAT_LABELS[scene.correct]?.emoji} ${CAT_LABELS[scene.correct]?.label}!`}
        </div>
      ) : (
        <div className="flex gap-4 justify-center fade-in">
          {Object.entries(CAT_LABELS).map(([key, { emoji, label }]) => (
            <button key={key} className="btn text-xl px-6 py-5" style={{ minWidth: 100, minHeight: 80 }}
              onClick={() => { stopSpeaking(); sfxTap(); choose(key); }}>
              <div className="text-3xl">{emoji}</div>
              <div className="text-sm mt-1">{label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
