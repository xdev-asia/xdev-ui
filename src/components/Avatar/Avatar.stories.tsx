import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const SIZES = ["sm", "md", "lg"] as const;
const PIXEL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='%23888'/></svg>";
const meta = {
  title: "Display/Avatar",
  component: Avatar,
  args: { name: "Trần Đức Duy", size: "md" },
  argTypes: { size: { control: "inline-radio", options: SIZES } },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithImage: Story = { args: { src: PIXEL } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {SIZES.map((s) => (
        <Avatar key={s} name="Duy Tran" size={s} />
      ))}
    </div>
  ),
};
