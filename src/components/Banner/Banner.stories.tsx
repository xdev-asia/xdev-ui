import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Banner } from "./Banner";

const meta = {
  title: "Status/Banner",
  component: Banner,
  args: { title: "Terminal service stopped", children: "Agent tabs are paused until it restarts." },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = { args: { action: <Button variant="secondary">Restart</Button> } };
