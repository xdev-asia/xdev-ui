import type { Meta, StoryObj } from "@storybook/react-vite";
import { AttentionInbox, type AttentionItem } from "./AttentionInbox";

const NOW = Date.UTC(2026, 10, 7, 9, 0, 0);
const items: AttentionItem[] = [
  { id: "a", agent: "claude", worktree: "feat/login-retry", text: "Run npm test -- --watch=false?", since: NOW - 12 * 60_000, kind: "approval" },
  { id: "b", agent: "codex", worktree: "fix/cache-key", text: "Which migration should I keep?", since: NOW - 3 * 60_000, kind: "question" },
  { id: "c", agent: "claude", worktree: "chore/deps", text: "cargo build exited with code 101.", since: NOW - 45 * 60_000, kind: "failed" },
];

const meta = {
  title: "Overlays/AttentionInbox",
  component: AttentionInbox,
  args: { items, now: NOW, onOpen: () => {} },
} satisfies Meta<typeof AttentionInbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { open: true } };
export const Empty: Story = { args: { items: [], open: true } };
