"use client";

// マグネティック効果：カーソルが近づくと、中身がカーソルの方向へ少し引き寄せられ、離れると戻る。
// 周りに見えない「反応する範囲」（padding）を作って、近づいただけで反応するようにしています。
// スマホ・「視差効果を減らす」設定の人には、引き寄せの代わりにタップ時に少し縮む反応だけを付けます。

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { useMotionSettings } from "./MotionProvider";

interface MagneticProps {
  children: ReactNode;
  /** 反応する範囲の広さ（px） */
  reach?: number;
  /** テーマの強さに掛ける倍率 */
  strength?: number;
  className?: string;
}

export function Magnetic({ children, reach = 24, strength = 1, className }: MagneticProps) {
  const { preset, reduced, finePointer } = useMotionSettings();
  const spring = { stiffness: preset.stiffness, damping: preset.damping, mass: 0.6 };
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);
  const active = finePointer && !reduced;

  function handleMove(event: PointerEvent<HTMLSpanElement>) {
    if (!active || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    // 要素の中心からカーソルまでの距離 × 引き寄せの割合
    x.set((event.clientX - (rect.left + rect.width / 2)) * preset.magnet * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * preset.magnet * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <span
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={className}
      style={{ display: "block", padding: reach, margin: -reach }}
    >
      <motion.span style={{ x, y, display: "block" }} whileTap={{ scale: 0.97 }}>
        {children}
      </motion.span>
    </span>
  );
}
