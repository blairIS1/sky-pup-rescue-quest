"use client";

// 3 categories only — Eva mode (age 3-4)
export const CATEGORIES = ["sky", "land", "water"] as const;
export type Category = typeof CATEGORIES[number];
export type TrainingData = Record<string, number>;

export function getConfidence(training: TrainingData, cat: string): number {
  const count = training[cat] || 0;
  return count === 0 ? 25 : count === 1 ? 55 : 90;
}

export const CAT_LABELS: Record<string, { emoji: string; label: string }> = {
  sky:   { emoji: "🌤️", label: "Sky" },
  land:  { emoji: "🌳", label: "Land" },
  water: { emoji: "🌊", label: "Water" },
};

export const TRAIN_ITEMS = [
  { emoji: "🦅", label: "Eagle",   answer: "sky"   as const, category: "sky",   voiceCorrect: "t_sky_eagle_y.mp3",   voiceWrong: "t_sky_eagle_n.mp3" },
  { emoji: "🐕", label: "Puppy",   answer: "land"  as const, category: "land",  voiceCorrect: "t_land_puppy_y.mp3",  voiceWrong: "t_land_puppy_n.mp3" },
  { emoji: "🐬", label: "Dolphin", answer: "water" as const, category: "water", voiceCorrect: "t_water_dolphin_y.mp3", voiceWrong: "t_water_dolphin_n.mp3" },
  { emoji: "🦜", label: "Parrot",  answer: "sky"   as const, category: "sky",   voiceCorrect: "t_sky_parrot_y.mp3",  voiceWrong: "t_sky_parrot_n.mp3" },
  { emoji: "🐰", label: "Bunny",   answer: "land"  as const, category: "land",  voiceCorrect: "t_land_bunny_y.mp3",  voiceWrong: "t_land_bunny_n.mp3" },
  { emoji: "🐟", label: "Fish",    answer: "water" as const, category: "water", voiceCorrect: "t_water_fish_y.mp3",  voiceWrong: "t_water_fish_n.mp3" },
  { emoji: "🦉", label: "Owl",     answer: "sky"   as const, category: "sky",   voiceCorrect: "t_sky_owl_y.mp3",     voiceWrong: "t_sky_owl_n.mp3" },
  { emoji: "🐱", label: "Cat",     answer: "land"  as const, category: "land",  voiceCorrect: "t_land_cat_y.mp3",    voiceWrong: "t_land_cat_n.mp3" },
  { emoji: "🐢", label: "Turtle",  answer: "water" as const, category: "water", voiceCorrect: "t_water_turtle_y.mp3", voiceWrong: "t_water_turtle_n.mp3" },
];

export type TestRound = {
  emoji: string; label: string; correct: string; category: string;
  aiChoice: string; confidence: number;
};

export function generateTestRounds(training: TrainingData): TestRound[] {
  const scenarios = [
    { emoji: "🦅", label: "A bird is flying!", correct: "sky", category: "sky" },
    { emoji: "🐕", label: "Something is barking!", correct: "land", category: "land" },
    { emoji: "🐬", label: "A splash in the water!", correct: "water", category: "water" },
    { emoji: "🦜", label: "Colorful wings!", correct: "sky", category: "sky" },
    { emoji: "🐰", label: "Hop hop hop!", correct: "land", category: "land" },
    { emoji: "🐟", label: "Bubbles underwater!", correct: "water", category: "water" },
  ].sort(() => Math.random() - 0.5);

  return scenarios.map((s) => {
    const conf = getConfidence(training, s.category);
    const correct = Math.random() < conf / 100;
    const cats = Object.keys(CAT_LABELS);
    const aiChoice = correct ? s.correct : cats.filter((c) => c !== s.correct)[Math.floor(Math.random() * 2)];
    return { ...s, aiChoice, confidence: conf };
  });
}

export const RESCUE_EVENTS = [
  { emoji: "🦅", label: "Eagle lost in the rain!", correct: "rescue", habitat: "sky", delay: 3000 },
  { emoji: "☀️", label: "Sunny skies!", correct: "sail", habitat: "sky", delay: 800 },
  { emoji: "🐰", label: "Bunny stuck on a rock!", correct: "rescue", habitat: "land", delay: 3000 },
  { emoji: "🌈", label: "Rainbow ahead!", correct: "sail", habitat: "land", delay: 600 },
  { emoji: "🐟", label: "Fish caught in a net!", correct: "rescue", habitat: "water", delay: 3000 },
  { emoji: "🌤️", label: "All clear!", correct: "sail", habitat: "sky", delay: 500 },
];
