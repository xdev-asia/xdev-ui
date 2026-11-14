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
export const Routed: Story = {
  args: {
    hub: { name: "LLM gateway", detail: "212 requests, 480 ms" },
    sources: [
      { id: "ci", name: "CI bot", text: "CI", color: "slateblue", detail: "160 requests", active: true, weight: 1 },
      { id: "ide", name: "IDE agent", text: "ID", color: "teal", detail: "52 requests", active: true, weight: 0.33 },
      { id: "cron", name: "Nightly report", text: "NR", color: "gray" },
    ],
    nodes: [
      { id: "openai", name: "OpenAI", text: "OA", color: "seagreen", detail: "128 requests", active: true, weight: 1 },
      { id: "anthropic", name: "Anthropic", text: "AN", color: "coral", detail: "78 requests, 5 failed", active: true, weight: 0.6, tone: "warn" },
      { id: "groq", name: "Groq", text: "GQ", color: "tomato", detail: "6 requests, 6 failed", active: true, weight: 0.05, tone: "danger" },
      { id: "mistral", name: "Mistral", text: "MI", color: "darkorange" },
    ],
  },
};
export const Empty: Story = { args: { nodes: [] } };
