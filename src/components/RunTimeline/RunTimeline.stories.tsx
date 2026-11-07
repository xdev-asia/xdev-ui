import type { Meta, StoryObj } from "@storybook/react-vite";
import { RunTimeline } from "./RunTimeline";

const meta = {
  title: "Status/RunTimeline",
  component: RunTimeline,
  args: {
    steps: [
      { id: "1", label: "Check out branch", status: "done", at: "14:02", durationMs: 1200 },
      { id: "2", label: "Run agent", status: "done", at: "14:02", durationMs: 184000 },
      { id: "3", label: "Run tests", status: "failed", at: "14:05", durationMs: 42000 },
      { id: "4", label: "Open pull request", status: "skipped" },
    ],
  },
} satisfies Meta<typeof RunTimeline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Running: Story = {
  args: {
    steps: [
      { id: "1", label: "Check out branch", status: "done", at: "14:02", durationMs: 1200 },
      { id: "2", label: "Run agent", status: "running", at: "14:02" },
      { id: "3", label: "Open pull request", status: "pending" },
    ],
  },
};
