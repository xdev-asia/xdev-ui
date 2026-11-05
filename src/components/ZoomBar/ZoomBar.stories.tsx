import type { Meta, StoryObj } from "@storybook/react-vite";
import { ZoomBar } from "./ZoomBar";

const meta = {
  title: "Actions/ZoomBar",
  component: ZoomBar,
  args: { zoom: 100, onZoomOut() {}, onFit() {}, onZoomIn() {}, onActual() {} },
} satisfies Meta<typeof ZoomBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const BeforeLoad: Story = { args: { zoom: null } };
