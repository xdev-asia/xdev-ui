import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Toaster } from "./Toaster";
import { toast } from "./toast-store";

const meta = {
  title: "Status/Toaster",
  component: Toaster,
  args: { position: "bottom-end", max: 3 },
  render: (args) => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button onClick={() => toast("Settings saved.", { tone: "ok" })}>Success</Button>
      <Button onClick={() => toast("Push failed.", { tone: "danger", description: "The remote rejected the push.", action: { label: "Retry", onClick: () => {} } })}>
        Error
      </Button>
      <Button onClick={() => toast("Worktree archived.", { action: { label: "Undo", onClick: () => {} } })}>With action</Button>
      <Button variant="secondary" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
      <Toaster {...args} />
    </div>
  ),
} satisfies Meta<typeof Toaster>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TopCenter: Story = { args: { position: "top-center" } };
export const Vietnamese: Story = { args: { labels: { region: "Thông báo", dismiss: "Đóng" } } };
