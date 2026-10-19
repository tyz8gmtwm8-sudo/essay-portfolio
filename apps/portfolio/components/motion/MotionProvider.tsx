"use client";

// 演出の設定を、ページ内のすべての動く部品に配る仕組み。
// - preset：テーマごとの動きの強さ（引き寄せる割合・バネの硬さなど）
// - reduced：OS の「視差効果を減らす」がオンなら true（動きを控えめにする）
// - finePointer：マウスなど細かく指せる端末なら true（スマホなどタッチ端末は false）

import { MotionConfig, useReducedMotion } from "framer-motion";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { THEME_PRESETS, type ThemePreset, type ThemePresetId } from "@portfolio/shared";

interface MotionSettings {
  preset: ThemePreset["motion"];
  reduced: boolean;
  finePointer: boolean;
}

const MotionContext = createContext<MotionSettings>({
  preset: THEME_PRESETS.natural.motion,
  reduced: false,
  finePointer: false,
});

export function MotionProvider({ presetId, children }: { presetId: ThemePresetId; children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    // reducedMotion="user"：OS の設定に合わせて、移動・拡大などの動きを自動でオフにする
    <MotionConfig reducedMotion="user">
      <MotionContext.Provider value={{ preset: THEME_PRESETS[presetId].motion, reduced, finePointer }}>
        {children}
      </MotionContext.Provider>
    </MotionConfig>
  );
}

export function useMotionSettings() {
  return useContext(MotionContext);
}

/** CSS のメディアクエリ（画面や端末の条件）に当てはまるかを返す */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
