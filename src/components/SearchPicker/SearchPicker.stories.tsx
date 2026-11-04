import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../Badge/Badge";
import { SearchPicker, type SearchPickerItem } from "./SearchPicker";

const ALL: SearchPickerItem[] = [
  { id: "12", title: "Footer meter overflows", meta: "#12 · open", leading: <Badge>issue</Badge> },
  { id: "15", title: "Add a dark theme", meta: "#15 · draft", leading: <Badge>pr</Badge> },
  { id: "18", title: "Bump the build tools", meta: "#18 · closed", leading: <Badge>issue</Badge>, disabled: true },
];

const meta = {
  title: "Inputs/SearchPicker",
  component: SearchPicker,
  args: { label: "Find an issue or pull request", placeholder: "Search issues and pull requests", value: "", items: ALL, onValueChange: () => {}, onPick: () => {} },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
} satisfies Meta<typeof SearchPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { items: [], status: "Searching" } };
export const Empty: Story = { args: { value: "zzz", items: [], status: "No matches" } };
/** Arrow keys move, Enter picks, Escape clears the query. */
export const Interactive: Story = {
  render: (args) => {
    const [q, setQ] = useState("");
    const [picked, setPicked] = useState<string | null>(null);
    const hits = ALL.filter((i) => String(i.title).toLowerCase().includes(q.toLowerCase()));
    return <SearchPicker {...args} value={q} onValueChange={setQ} items={hits} onPick={setPicked} status={picked ? `Picked #${picked}` : undefined} />;
  },
};
