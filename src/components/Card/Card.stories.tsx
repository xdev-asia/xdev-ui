import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Card } from "./Card";

const meta = {
  title: "Display/Card",
  component: Card,
  args: {
    title: "Agent context",
    subtitle: "CLAUDE.md · 3 rules",
    children: <p style={{ margin: 0 }}>Run pnpm through corepack. Keep specs in the internal docs repo; ADRs stay with the code.</p>,
  },
  decorators: [(Story) => <div style={{ width: 380 }}><Story /></div>],
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button variant="secondary">Edit</Button>
        <IconButton icon="close" label="Remove context" />
      </>
    ),
  },
};
export const DiffFile: Story = {
  args: {
    title: "src/components/Tabs/Tabs.tsx",
    subtitle: "+212 -18",
    monoSubtitle: true,
    flush: true,
    children: (
      <pre style={{ margin: 0, padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {"+ export function Tabs({ items, value }: TabsProps): JSX.Element {\n+   const current = value ?? inner;"}
      </pre>
    ),
  },
};
export const Bare: Story = { args: { title: undefined, subtitle: undefined } };
