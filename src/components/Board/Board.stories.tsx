import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { BoardCard } from "../BoardCard/BoardCard";
import { BoardColumn } from "../BoardColumn/BoardColumn";
import { Tag } from "../Tag/Tag";
import { Board } from "./Board";

const columns = [
  { title: "Backlog", cards: [{ title: "Retry on 429" }] },
  { title: "To do", cards: [{ title: "Rotate API keys", meta: "Due Friday" }, { title: "Add dark icons" }] },
  { title: "In progress", cards: [{ title: "Login retry", meta: "Claude", status: "running" as const, tags: <Tag>feat/login-retry</Tag> }] },
  { title: "In review", cards: [{ title: "Fix CI cache", meta: "Codex", status: "waiting" as const }] },
  { title: "Done", cards: [{ title: "Split settings page", status: "idle" as const }, { title: "Broken build", status: "error" as const }] },
];

const meta = {
  title: "Layout/Board",
  component: Board,
  args: { "aria-label": "Tasks", children: null },
  decorators: [(Story) => <div style={{ height: 420 }}><Story /></div>],
} satisfies Meta<typeof Board>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FiveColumns: Story = {
  render: (args) => (
    <Board {...args}>
      {columns.map((c, i) => (
        <BoardColumn key={c.title} title={c.title} count={c.cards.length} dropTarget={i === 2} actions={i === 1 ? <Button variant="secondary">New task</Button> : undefined}>
          {c.cards.map((card, j) => (
            <BoardCard key={card.title} {...card} selected={i === 1 && j === 0} dragging={i === 3} />
          ))}
        </BoardColumn>
      ))}
    </Board>
  ),
};
