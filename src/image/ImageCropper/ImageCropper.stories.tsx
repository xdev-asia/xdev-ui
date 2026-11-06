import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ImageCropper } from "./ImageCropper";

const meta = {
  title: "Image/ImageCropper",
  component: ImageCropper,
  args: { src: "/brand/xdev-icon-512.png", aspect: 16 / 9, modal: false, onCancel: fn(), onConfirm: fn() },
} satisfies Meta<typeof ImageCropper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Wide: Story = {};
export const Square: Story = { args: { aspect: 1, title: "Crop avatar" } };
export const Busy: Story = { args: { busy: true } };
