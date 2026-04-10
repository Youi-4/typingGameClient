const PRACTICE_TEXTS = [
  "The quick brown fox jumps over the lazy dog while the sun sets slowly behind the distant mountains.",
  "Programming is the art of telling another human what one wants the computer to do, clearly and without ambiguity.",
  "To understand recursion you must first understand recursion, and then suddenly everything clicks into place.",
  "A good programmer looks both ways before crossing a one-way street and always writes tests before going to bed.",
  "The best code is no code at all, but when you must write it, make sure it reads like a well-crafted sentence.",
  "Debugging is twice as hard as writing code in the first place, so write it as simply as you possibly can.",
  "Every great developer you know got there by solving problems they were unqualified to solve until they did it.",
  "Software is like entropy: it is difficult to grasp, weighs nothing, and obeys the second law of thermodynamics.",
  "Walking on water and developing software from a specification are easy if both are frozen solid.",
  "The function of good software is to make the complex appear to be simple, and that takes real craft and patience.",
  "First, solve the problem. Then, write the code. Then read it again and ask yourself if it still makes sense.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand too.",
  "Code never lies but comments sometimes do, so trust the code and verify the logic before changing anything.",
  "Simplicity is the soul of efficiency, and the best solutions are often the ones that feel almost too obvious.",
  "The most dangerous phrase in any language is we have always done it this way, especially in software development.",
];

export function getRandomPracticeText(exclude?: string): string {
  const pool = exclude
    ? PRACTICE_TEXTS.filter((t) => t !== exclude)
    : PRACTICE_TEXTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
