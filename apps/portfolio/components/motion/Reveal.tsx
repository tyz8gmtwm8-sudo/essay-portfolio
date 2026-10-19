"use client";

// スクロールして画面に入ったときに、ふわっと浮かび上がる（フェードイン＋スライドイン）

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionSettings } from "./MotionProvider";

interface RevealProps {
  children: ReactNode;
  /** 同時に画面に入ったものを少しずつずらして出すための順番 */
  order?: number;
  /** どちらから入ってくるか */
  from?: "below" | "left" | "right";
  as?: "div" | "li";
  className?: string;
}

export function Reveal({ children, order = 0, from = "below", as = "div", className }: RevealProps) {
  const { preset, reduced } = useMotionSettings();
  const distance = reduced ? 0 : preset.distance;
  const offset =
    from === "left" ? { x: -distance } : from === "right" ? { x: distance } : { y: distance };
  const Component = as === "li" ? motion.li : motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      // once: 一度表示したら、上に戻ってももう一度は動かさない
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: reduced ? 0.2 : preset.duration,
        ease: preset.ease,
        delay: reduced ? 0 : (order % 4) * 0.08,
      }}
    >
      {children}
    </Component>
  );
}
