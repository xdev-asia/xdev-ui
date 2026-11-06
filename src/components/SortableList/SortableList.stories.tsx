import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { moveItem } from "../DataTable/table-reorder";
import { SortableList, type SortableListProps } from "./SortableList";

interface Step {
  id: string;
  title: string;
}
const STEPS: Step[] = [
  { id: "install", title: "Install the app" },
  { id: "account", title: "Create an account" },
  { id: "plan", title: "Pick a plan" },
  { id: "team", title: "Invite the team" },
];

function Demo(props: Partial<SortableListProps<Step>>) {
  const [items, setItems] = useState(STEPS);
  return (
    <div style={{ width: 360 }}>
      <SortableList<Step>
        items={items}
        getKey={(s) => s.id}
        getLabel={(s) => s.title}
        label="Onboarding steps"
        onReorder={(from, to) => setItems(moveItem(items, from, to))}
        renderItem={(s, i, handle) => (
          <>
            {handle}
            <span>
              {i + 1}. {s.title}
            </span>
          </>
        )}
        {...props}
      />
    </div>
  );
}

const meta = {
  title: "Data/SortableList",
  component: Demo,
} satisfies Meta<typeof Demo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Vietnamese: Story = {
  args: {
    label: "Các bước",
    labels: {
      handle: (n) => `Kéo để sắp xếp: ${n}`,
      lifted: (n) => `Đã nhấc ${n}. Dùng phím mũi tên lên xuống để di chuyển, Space để thả, Escape để huỷ.`,
      moved: (p, t) => `Đã chuyển tới vị trí ${p}/${t}.`,
      dropped: (p, t) => `Đã thả tại vị trí ${p}/${t}.`,
      cancelled: "Đã huỷ sắp xếp.",
    },
  },
};
