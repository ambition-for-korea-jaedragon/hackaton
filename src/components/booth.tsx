"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// Booth frame: shows countdown while developing, one white flash when the result lands.
export function Booth({ src, backdrop, developing, alt }: { src?: string; backdrop?: string; developing: boolean; alt: string }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!developing) return;
    const t = setInterval(() => setCount((c) => (c <= 1 ? 3 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [developing]);
  useEffect(() => {
    if (developing || reduce) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(t);
  }, [developing, reduce]);

  const shown = developing ? backdrop : src;
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-paper">
      <div className="relative aspect-[4/5]">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt={alt}
            className={`size-full object-cover transition-[filter] duration-700 ${developing ? "blur-[6px] saturate-50 brightness-95" : ""}`}
          />
        ) : (
          <div className="size-full bg-[#ede8f7]" />
        )}
        {developing ? (
          <AnimatePresence mode="popLayout">
            <motion.span
              key={count}
              initial={reduce ? false : { scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              className="absolute right-4 top-3.5 font-display text-[56px] text-paper [text-shadow:0_2px_0_rgba(42,22,48,.25)]"
              aria-hidden
            >
              {count}
            </motion.span>
          </AnimatePresence>
        ) : null}
        <AnimatePresence>
          {flash ? (
            <motion.div
              key="flash"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,.95),rgba(255,255,255,0)_60%)]"
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
