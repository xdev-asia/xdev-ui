import type { Meta, StoryObj } from "@storybook/react-vite";
import { Emblem } from "./Emblem";

const meta = {
  title: "Display/Emblem",
  component: Emblem,
  args: { name: "OpenAI", text: "OA", color: "seagreen" },
} satisfies Meta<typeof Emblem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Initials: Story = { args: { name: "Google Gemini", text: undefined, color: "royalblue" } };
export const NoColour: Story = { args: { color: undefined } };
export const WithIcon: Story = { args: { name: "Usage", icon: "activity", text: undefined, color: undefined } };
/** The three sizes, and colours close to the surface. */
export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--x-space-3)", alignItems: "center" }}>
      <Emblem name="Anthropic" text="AN" color="coral" size="sm" />
      <Emblem name="Groq" text="GQ" color="tomato" />
      <Emblem name="Mistral" text="MI" color="darkorange" size="lg" />
      <Emblem name="Chutes" text="CH" color="white" />
      <Emblem name="Vercel" text="VG" color="black" />
    </div>
  ),
};
