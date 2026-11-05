import type { Meta, StoryObj } from "@storybook/react-vite";
import { Coachmark } from "./Coachmark";

const meta = {
  title: "Overlays/Coachmark",
  component: Coachmark,
  args: {
    anchor: { top: 40, left: 40, width: 120, height: 28 },
    title: "Start an agent",
    children: "Each agent works in its own worktree, so tasks never collide.",
    step: 1,
    total: 3,
    onBack: () => {},
    onNext: () => {},
    onSkip: () => {},
  },
} satisfies Meta<typeof Coachmark>;
export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {};
export const Middle: Story = { args: { step: 2 } };
export const Last: Story = { args: { step: 3 } };
export const FlipsToTop: Story = { args: { anchor: { top: 720, left: 200, width: 120, height: 28 } } };
