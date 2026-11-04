import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES } from "../../icons";
import { Icon } from "./Icon";

const meta = {
  title: "Brand/Icon",
  component: Icon,
  args: { name: "terminal", size: 24 },
  argTypes: { name: { control: "select", options: ICON_NAMES } },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Set: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 16 }}>
      {ICON_NAMES.map((n) => (
        <figure key={n} style={{ margin: 0, display: "grid", justifyItems: "center", gap: 8, color: "var(--text-2)" }}>
          <Icon name={n} size={24} />
          <figcaption style={{ fontSize: 13 }}>{n}</figcaption>
        </figure>
      ))}
    </div>
  ),
};
