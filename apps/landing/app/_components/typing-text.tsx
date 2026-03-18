"use client";

import { useEffect, useState } from "react";

interface TypingTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function TypingText({
  words,
  className = "",
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2500,
}: TypingTextProps) {
  const firstWord = words[0] ?? "";
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(firstWord);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(firstWord.length);

  useEffect(() => {
    const currentWord = words[currentWordIndex] ?? "";

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing forward
          if (charIndex < currentWord.length) {
            setDisplayText(currentWord.slice(0, charIndex + 1));
            setCharIndex(charIndex + 1);
          } else {
            // Word complete, wait then start deleting
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        } else {
          // Deleting
          if (charIndex > 1) {
            setDisplayText(currentWord.slice(0, charIndex - 1));
            setCharIndex(charIndex - 1);
          } else {
            // At last character - transition directly to next word (skip empty state)
            setIsDeleting(false);
            const nextIndex = (currentWordIndex + 1) % words.length;
            const nextWord = words[nextIndex] ?? "";
            setCurrentWordIndex(nextIndex);
            setDisplayText(nextWord.slice(0, 1));
            setCharIndex(1);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  // Find the longest word for spacing
  const longestWord = words.reduce((a, b) => (a.length >= b.length ? a : b), "");

  return (
    <span className={`inline-grid whitespace-nowrap ${className}`}>
      {/* Reserve space with longest word (invisible) */}
      <span className="invisible col-start-1 row-start-1">{longestWord}</span>
      {/* Visible animated text */}
      <span className="col-start-1 row-start-1">
        {displayText}
        <span className="animate-blink font-normal">|</span>
      </span>
    </span>
  );
}
