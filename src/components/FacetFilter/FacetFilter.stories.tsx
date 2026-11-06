import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FacetFilter, type FacetFilterProps } from "./FacetFilter";

const statuses = [
  { value: "active", label: "Active", count: 40 },
  { value: "invited", label: "Invited", count: 9 },
  { value: "suspended", label: "Suspended", count: 8 },
];
const tags = ["Billing", "Design", "Docs", "Infra", "Mobile", "Payments", "Search", "Security", "Web"].map((t, i) => ({ value: t.toLowerCase(), label: t, count: (i * 7) % 13 }));

function Controlled(props: Omit<FacetFilterProps, "selected" | "onChange"> & { initial?: string[] }) {
  const { initial = [], ...rest } = props;
  const [selected, setSelected] = useState<string[]>(initial);
  return <FacetFilter {...rest} selected={selected} onChange={setSelected} />;
}

const meta = {
  title: "Data/FacetFilter",
  component: FacetFilter,
  args: { label: "Status", options: statuses, selected: [], onChange: () => {} },
} satisfies Meta<typeof FacetFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Controlled label={args.label} options={args.options} /> };
export const Picked: Story = { render: () => <Controlled label="Status" options={statuses} initial={["invited", "suspended"]} /> };
/** Past seven options the search field appears by itself. */
export const Searchable: Story = { render: () => <Controlled label="Tag" options={tags} defaultOpen /> };
export const Vietnamese: Story = {
  render: () => (
    <Controlled
      label="Trạng thái"
      options={[{ value: "active", label: "Đang hoạt động", count: 40 }, { value: "invited", label: "Đã mời", count: 9 }, { value: "suspended", label: "Đã tạm ngưng", count: 8 }]}
      searchable
      defaultOpen
      labels={{ search: "Tìm tùy chọn", clearSearch: "Xóa nội dung tìm", clear: "Bỏ chọn", noResults: "Không có tùy chọn khớp", selected: (n) => `đã chọn ${n}` }}
    />
  ),
};
