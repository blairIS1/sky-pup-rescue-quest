"use client";
import { useState, useEffect } from "react";
import { TRAIN_ITEMS, TrainingData, CAT_LABELS } from "./data";
import SkylarBuddy from "./SkylarBuddy";
import { sfxCorrect, sfxWrong, sfxTap } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";
import { useSpeakLock } from "./useSpeakLock";

export default function LearnHabitats({ onComplete }: { onComplete: (data: TrainingData) => void }) {
  const [items] = useState(() => [...TRAIN_ITEMS].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [training, setTraining] = useState<TrainingData>({});
  const [feedback, setFeedback] = useState("");
  const [mood, setMood] = useState<"idle" | "happy" | "scared">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);
  const locked = useSpeakLock();

  useEffect(() => { speak(VOICE.q1Start); return () => { stopSpeaking(); }; }, []);

  const current = items[idx];
  const cats = Object.entries(CAT_LABELS);

  const advance = () => {
    setFeedback(""); setMood("idle"); setShowConfetti(false);
    if (idx + 1 < items.length) setIdx(idx + 1); else setDone(true);
  };

  const answer = (choice: string) => {
    const correct = choice === current.answer;
    if (correct) {
      sfxCorrect(); setMood("happy"); setShowConfetti(true);
      setTraining((t) => ({ ...t, [current.category]: (t[current.category] || 0) + 1 }));
      setFeedback("✅ Yes!");
      speak(current.voiceCorrect).then(advance);
    } else {
      sfxWrong(); setMood("scared");
      setFeedback("Oops! It's " + CAT_LABELS[current.answer].emoji + " " + CAT_LABELS[current.answer].label + "!");
      speak(current.voiceWrong).then(advance);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={true} />
        <SkylarBuddy mood="celebrate" size={140} />
        <h2 className="text-3xl font-bold text-center">🎉 Great job!</h2>
        <button className="btn btn-success text-xl px-8 py-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.q1Learned); onComplete(training); }}>
          Next →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-4 sm:p-8 fade-in">
      <Confetti active={showConfetti} />
      <h2 className="text-2xl sm:text-3xl font-bold text-center">✈️ Where does it live?</h2>
      <SkylarBuddy mood={mood} size={100} />
      <div className="text-sm opacity-70">{idx + 1} / {items.length}</div>
      <div className="progress-track w-48"><div className="progress-fill" style={{ width: `${((idx + 1) / items.length) * 100}%` }} /></div>
      <div style={{ fontSize: "5rem" }}>{current.emoji}</div>
      <div className="text-2xl font-bold">{current.label}</div>
      <div className="text-xl min-h-[2em] font-semibold text-center">{feedback}</div>
      {!feedback && (
        <div className="flex gap-4 justify-center fade-in">
          {cats.map(([key, { emoji, label }]) => (
            <button key={key} className="btn text-xl px-6 py-5" style={{ minWidth: 100, minHeight: 80 }}
              disabled={locked} onClick={() => { sfxTap(); answer(key); }}>
              <div className="text-3xl">{emoji}</div>
              <div className="text-sm mt-1">{label}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
