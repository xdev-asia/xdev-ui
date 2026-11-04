import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Avatar } from "../Avatar/Avatar";
import { EmptyState } from "../EmptyState/EmptyState";
import { StatusDot } from "../StatusDot/StatusDot";
import { DataTable, type DataTableColumn, type TableSort } from "./DataTable";
import { sortRows } from "./table-helpers";

interface Row { id: string; name: string; email: string; status: "ok" | "warn" }
const data: Row[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", status: "ok" },
  { id: "2", name: "Grace Hopper", email: "grace@example.com", status: "warn" },
  { id: "3", name: "Linus T", email: "linus@example.com", status: "ok" },
];
const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", sortable: true, cell: (r) => <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Avatar name={r.name} size="sm" />{r.name}</span> },
  { key: "email", header: "Email", mono: true, hideNarrow: true, cell: (r) => r.email },
  { key: "status", header: "Status", cell: (r) => <StatusDot tone={r.status} label={r.status === "ok" ? "Active" : "Invited"} /> },
];

const meta = {
  title: "Data/DataTable",
  component: DataTable<Row>,
  args: { columns, rows: data, rowKey: (r: Row) => r.id, caption: "Users" },
} satisfies Meta<typeof DataTable<Row>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Interactive: Story = {
  render: (args) => {
    const [sort, setSort] = useState<TableSort | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const rows = sortRows(data, sort, (r, k) => (k === "name" ? r.name : r.email));
    return <DataTable {...args} rows={rows} sort={sort} onSortChange={setSort} selected={selected} onSelectedChange={setSelected} rowLabel={(r) => r.name} />;
  },
};
export const Loading: Story = { args: { rows: [], loading: true } };
export const Empty: Story = { args: { rows: [], empty: <EmptyState icon="accounts" title="No users yet" hint="Create the first user to get started." /> } };
