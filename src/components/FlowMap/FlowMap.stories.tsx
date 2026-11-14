import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlowMap } from "./FlowMap";

const meta = {
  title: "Display/FlowMap",
  component: FlowMap,
  args: {
    label: "Traffic",
    hub: { name: "LLM gateway" },
    nodes: [{ id: "opencode", name: "OpenCode Free", text: "OC", color: "black" }],
  },
} satisfies Meta<typeof FlowMap>;
export default meta;
type Story = StoryObj<typeof meta>;

export const One: Story = {};
export const Several: Story = {
  args: {
    nodes: [
      { id: "openai", name: "OpenAI", text: "OA", color: "seagreen", detail: "128 requests", active: true },
      { id: "anthropic", name: "Anthropic", text: "AN", color: "coral", detail: "42 requests", active: true },
      { id: "groq", name: "Groq", text: "GQ", color: "tomato" },
      { id: "gemini", name: "Google Gemini", color: "royalblue" },
      { id: "mistral", name: "Mistral", text: "MI", color: "darkorange" },
    ],
  },
};
export const Empty: Story = { args: { nodes: [] } };
