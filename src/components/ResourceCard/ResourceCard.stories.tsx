import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "../Avatar/Avatar";
import { Grid } from "../Grid/Grid";
import { StatusDot } from "../StatusDot/StatusDot";
import { Switch } from "../Switch/Switch";
import { ResourceCard } from "./ResourceCard";

const meta = {
  title: "Display/ResourceCard",
  component: ResourceCard,
  args: { title: "OpenAI", status: "No connections", leading: <Avatar name="OpenAI" />, href: "#" },
} satisfies Meta<typeof ResourceCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Connected: Story = { args: { status: <StatusDot tone="ok" label="2 connected" />, trailing: <Switch aria-label="Use OpenAI" defaultChecked /> } };
export const SwitchedOff: Story = { args: { dimmed: true, status: <StatusDot tone="neutral" label="Off" />, trailing: <Switch aria-label="Use OpenAI" /> } };
/** A grid of providers; the switch shows on hover or focus. */
export const InGrid: Story = {
  render: () => (
    <Grid minItemWidth="14rem" gap={3}>
      <ResourceCard href="#" title="Anthropic" leading={<Avatar name="Anthropic" />} status={<StatusDot tone="ok" label="1 connected" />} trailing={<Switch aria-label="Use Anthropic" defaultChecked />} revealTrailing="hover" />
      <ResourceCard href="#" title="OpenAI" leading={<Avatar name="OpenAI" />} status={<StatusDot tone="warn" label="1 set aside" />} trailing={<Switch aria-label="Use OpenAI" defaultChecked />} revealTrailing="hover" />
      <ResourceCard href="#" title="Groq" leading={<Avatar name="Groq" />} status="No connections" />
    </Grid>
  ),
};
