import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Emulator を共有するので、テストファイルを順番に実行する
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
