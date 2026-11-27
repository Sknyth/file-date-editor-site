"use client";

import { LazyMotion, domAnimation, m, MotionConfig } from "framer-motion";
import { useState, type ReactNode } from "react";

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const [entered, setEntered] = useState(false);
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <m.div
          className={className}
          initial={false}
          onViewportEnter={() => setEntered(true)}
          viewport={{ once: true, amount: "some" }}
          animate={entered ? { opacity: [0.75, 1], y: [8, 0] } : undefined}
          transition={{ duration: 0.38, ease: "easeOut" }}
        >
          {children}
        </m.div>
      </LazyMotion>
    </MotionConfig>
  );
}
