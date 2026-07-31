"use client";

import { useEffect, useState } from "react";

interface ScrollState {
  scrolled: boolean;
  scrollingUp: boolean;
}

export function useScrollState(
  threshold = 24
): ScrollState {
  const [scrolled, setScrolled] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(true);

  useEffect(() => {
    let previousY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > threshold);

      if (Math.abs(currentY - previousY) > 4) {
        setScrollingUp(currentY < previousY);
        previousY = currentY;
      }
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return {
    scrolled,
    scrollingUp,
  };
}