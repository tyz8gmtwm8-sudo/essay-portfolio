// Tiptap の拡張機能：文字サイズ（小・大・特大）。「標準」はこの指定を外した状態。
// 決められた値（FONT_SIZES）以外は保存されないようにしています。

import { Mark, mergeAttributes } from "@tiptap/core";
import { FONT_SIZES, type FontSize } from "@portfolio/shared";

// Tiptap に「setFontSize / unsetFontSize という命令が増えた」ことを TypeScript に教える
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: FontSize) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const isFontSize = (value: unknown): value is FontSize =>
  typeof value === "string" && (FONT_SIZES as readonly string[]).includes(value);

export const FontSizeMark = Mark.create({
  name: "fontSize",

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => {
          const size = element.getAttribute("data-size");
          return isFontSize(size) ? size : null;
        },
        renderHTML: (attributes) =>
          isFontSize(attributes.size)
            ? { "data-size": attributes.size, class: `essay-size-${attributes.size}` }
            : {},
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-size]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ commands }) =>
          commands.setMark(this.name, { size }),
      unsetFontSize:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
