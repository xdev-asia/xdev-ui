import type { Meta, StoryObj } from "@storybook/react-vite";
import { Meter } from "../Meter/Meter";
import { StatTile } from "./StatTile";

const meta = {
  title: "Data/StatTile",
  component: StatTile,
  args: { label: "Active users", value: "1,284" },
  decorators: [(Story) => <div style={{ width: 240 }}><Story /></div>],
} satisfies Meta<typeof StatTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDelta: Story = { args: { delta: "+12%", deltaTrend: "up", deltaTone: "good", hint: "vs last 7 days" } };
export const BadDelta: Story = { args: { label: "Failed sign-ins", value: "37", delta: "+8%", deltaTrend: "up", deltaTone: "bad" } };
export const Loading: Story = { args: { loading: true } };
export const WithMeter: Story = { args: { label: "Storage", value: "82 GB", children: <Meter value={82} warnAt={80} label="Used" /> } };
