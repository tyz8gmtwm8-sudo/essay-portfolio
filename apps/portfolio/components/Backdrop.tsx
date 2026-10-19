"use client";

// 背景の装飾（プリセットごとの図形）。
// スクロールに合わせて図形がゆっくり動き（パララックス）、さらに常にふわふわと漂います。
// 「視差効果を減らす」設定のときは動きません。

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { BackgroundPattern } from "@portfolio/shared";
import { useMotionSettings } from "./motion/MotionProvider";

export function Backdrop({ pattern }: { pattern: BackgroundPattern }) {
  const { reduced } = useMotionSettings();
  // scrollYProgress：ページの一番上が 0、一番下が 1
  const { scrollYProgress } = useScroll();
  const amount = reduced ? 0 : 1;
  const slow = useTransform(scrollYProgress, [0, 1], [0, -160 * amount]);
  const fast = useTransform(scrollYProgress, [0, 1], [0, -360 * amount]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 40 * amount]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      {pattern === "blobs" && <Blobs slow={slow} fast={fast} rotate={rotate} />}
      {pattern === "brush" && <Brush slow={slow} fast={fast} />}
      {pattern === "lines" && <Lines slow={slow} fast={fast} />}
      {pattern === "glow" && <Glow slow={slow} fast={fast} />}
    </div>
  );
}

type Values = { slow: MotionValue<number>; fast: MotionValue<number>; rotate?: MotionValue<number> };

/** ポップ：丸い図形が弾むように漂う */
function Blobs({ slow, fast, rotate }: Values) {
  return (
    <>
      <motion.div style={{ y: slow }} className="absolute -left-24 -top-24">
        <div className="backdrop-float size-80 rounded-full bg-theme-accent opacity-25 blur-xl" />
      </motion.div>
      <motion.div style={{ y: fast, rotate }} className="absolute -right-16 top-[30%]">
        <div className="backdrop-float-alt size-56 rounded-[40%] bg-[#ffc94a] opacity-35" />
      </motion.div>
      <motion.div style={{ y: slow }} className="absolute bottom-[8%] left-[18%]">
        <div className="backdrop-float size-24 rounded-full bg-[#7bd3f7] opacity-40" />
      </motion.div>
      <motion.div style={{ y: fast }} className="absolute left-[60%] top-[75%]">
        <div className="backdrop-float-alt size-10 rounded-full border-4 border-theme-accent opacity-50" />
      </motion.div>
    </>
  );
}

/** ナチュラル：手書き風の線がゆっくり流れる */
function Brush({ slow, fast }: Values) {
  return (
    <>
      <motion.svg
        style={{ y: slow }}
        className="absolute inset-x-0 top-[12vh] h-[40vh] w-full opacity-35"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        <path
          className="brush-draw"
          d="M-20 300 C 200 120, 380 360, 600 200 S 980 80, 1220 240"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M-20 340 C 240 200, 420 380, 640 260 S 1000 160, 1220 300"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </motion.svg>
      <motion.svg
        style={{ y: fast }}
        className="absolute bottom-[-10vh] right-[-5vw] h-[45vh] w-[60vw] opacity-25"
        viewBox="0 0 600 300"
      >
        <path
          d="M20 250 C 120 60, 260 280, 380 120 S 560 40, 590 160"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="2 10"
        />
      </motion.svg>
    </>
  );
}

/** モノトーン：細い罫線と、ゆっくり動く差し色の線 */
function Lines({ slow, fast }: Values) {
  return (
    <>
      <div className="absolute inset-0 mx-auto max-w-5xl border-x border-theme-border" />
      <motion.div style={{ y: slow }} className="absolute left-0 top-[35%] h-px w-[30vw] bg-theme-accent opacity-70" />
      <motion.div style={{ y: fast }} className="absolute right-0 top-[70%] h-px w-[18vw] bg-theme-fg opacity-20" />
    </>
  );
}

/** ナイト：光がぼんやりと揺れ、小さな星がまたたく */
function Glow({ slow, fast }: Values) {
  const stars = [
    [12, 18],
    [80, 12],
    [65, 40],
    [25, 62],
    [88, 75],
    [45, 88],
  ];
  return (
    <>
      <motion.div style={{ y: slow }} className="absolute left-1/2 top-[-20vh] -translate-x-1/2">
        <div className="backdrop-pulse size-[70vh] rounded-full bg-theme-accent opacity-20 blur-3xl" />
      </motion.div>
      <motion.div style={{ y: fast }} className="absolute bottom-[-30vh] right-[-10vh]">
        <div className="backdrop-float size-[50vh] rounded-full bg-[#7a5cff] opacity-15 blur-3xl" />
      </motion.div>
      {stars.map(([left, top], index) => (
        <span
          key={index}
          className="backdrop-twinkle absolute size-1 rounded-full bg-theme-fg"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${index * 0.7}s` }}
        />
      ))}
    </>
  );
}
