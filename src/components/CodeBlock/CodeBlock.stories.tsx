import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "./CodeBlock";

const meta = {
  title: "Display/CodeBlock",
  component: CodeBlock,
  args: { language: "bash", code: "claude mcp add xdev-ui -- npx -y -p @xdev-asia/ui xdev-ui-mcp" },
  decorators: [(Story) => <div style={{ width: 520 }}><Story /></div>],
} satisfies Meta<typeof CodeBlock>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Command: Story = {};
export const McpConfig: Story = {
  args: {
    language: "json",
    code: JSON.stringify({ mcpServers: { "xdev-ui": { command: "npx", args: ["-y", "-p", "@xdev-asia/ui", "xdev-ui-mcp"] } } }, null, 2),
  },
};
export const Vietnamese: Story = { args: { labels: { copy: "Sao chép", copied: "Đã chép" } } };
