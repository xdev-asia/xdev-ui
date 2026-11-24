import type { Meta, StoryObj } from "@storybook/react-vite";
import { ICON_NAMES } from "../../icons";
import { Button } from "./Button";

const meta = {
  title: "Actions/Button",
  component: Button,
  args: { children: "Create worktree", variant: "primary" },
  argTypes: {
    icon: { control: "select", options: [undefined, ...ICON_NAMES] },
    iconEnd: { control: "select", options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Open in editor" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete user" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Show more" } };
export const Link: Story = { args: { variant: "link", children: "Read the docs" } };
export const Small: Story = { args: { size: "sm", variant: "secondary", children: "Edit" } };
export const AsAnchor: Story = { args: { href: "#docs", variant: "secondary", children: "Open docs" } };
export const WithIcon: Story = { args: { icon: "plus", children: "New session" } };
export const Disabled: Story = { args: { disabled: true } };
/** Async submit: the spinner takes the icon's place, the label and width stay. */
export const Busy: Story = { args: { icon: "save", busy: true, children: "Save" } };
export const BusyLink: Story = { args: { href: "#export", variant: "secondary", icon: "download", busy: true, children: "Export" } };
/** `iconEnd` is a navigation or disclosure cue, never a second action. */
export const TrailingIcon: Story = { args: { variant: "secondary", iconEnd: "chevron", children: "More filters" } };
export const ExternalLink: Story = { args: { href: "https://example.org", target: "_blank", variant: "link", iconEnd: "external", children: "Status page" } };
/** `renderLink` hands the link to a router link (here a plain anchor marked data-router). */
export const RouterLink: Story = {
  args: { href: "#settings", variant: "secondary", icon: "settings", children: "Settings", renderLink: (p) => <a data-router="" {...p} /> },
};
/** One primary per surface; the rest are secondary. */
export const Pair: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button variant="primary">Commit and push</Button>
      <Button variant="secondary">Discard</Button>
    </div>
  ),
};
