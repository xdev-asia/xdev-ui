import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatTile } from "../StatTile/StatTile";
import { Grid, GridItem } from "./Grid";

const meta = {
  title: "Layout/Grid",
  component: Grid,
  args: { columns: { base: 1, md: 2, xl: 4 }, gap: 4 },
} satisfies Meta<typeof Grid>;
export default meta;
type Story = StoryObj<typeof meta>;

const tiles = ["Users", "Orders", "Revenue", "Refunds"].map((l, i) => <StatTile key={l} label={l} value={String((i + 1) * 128)} />);

export const Responsive: Story = { render: (args) => <Grid {...args}>{tiles}</Grid> };
export const AutoFill: Story = { args: { minItemWidth: "14rem" }, render: (args) => <Grid {...args}>{tiles}</Grid> };
export const Container: Story = {
  args: { responsive: "container", columns: { base: 1, sm: 2 } },
  render: (args) => (
    <div style={{ width: 420, resize: "horizontal", overflow: "auto" }}>
      <Grid {...args}>
        {tiles}
        <GridItem span="full">Full row</GridItem>
      </Grid>
    </div>
  ),
};
