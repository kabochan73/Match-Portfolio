import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../page";

// Vitest/Testing Libraryの導入確認用の暫定テスト。実際のトップページ実装後に置き換える
test("Home", () => {
  render(<Home />);
  expect(
    screen.getByText("To get started, edit the", { exact: false }),
  ).toBeInTheDocument();
});
