"use client";

// カスタムカーソル：テーマ色の丸がマウスを追いかけ、リンクやボタンの上では大きくなる。
// マウスがない端末・「視差効果を減らす」設定のときは表示しません（普通のカーソルのまま）。

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useMotionSettings } from "./MotionProvider";

export function CustomCursor() {
  const { preset, reduced, finePointer } = useMotionSettings();
  const enabled = finePointer && !reduced;

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // 外側の輪は少し遅れてついてくる
  const ringX = useSpring(x, { stiffness: preset.stiffness * 1.4, damping: preset.damping + 6, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: preset.stiffness * 1.4, damping: preset.damping + 6, mass: 0.4 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    // 普通のカーソルを隠す（CSS の .has-custom-cursor で指定）
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      setHovering(Boolean(target?.closest("a, button, [data-cursor='hover']")));
    };
    const onLeaveWindow = () => setVisible(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* 外側の輪 */}
      <motion.div
        className={`absolute left-0 top-0 rounded-full border-2 border-theme-accent transition-colors duration-300 ${
          hovering ? "bg-theme-accent/20" : "bg-transparent"
        }`}
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 64 : 36,
          height: hovering ? 64 : 36,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      {/* 中心の点（遅れずについてくる） */}
      <motion.div
        className="absolute left-0 top-0 size-2 rounded-full bg-theme-accent"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0.5 : 1 }}
      />
    </div>
  );
}
