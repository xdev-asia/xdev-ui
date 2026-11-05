import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Pagination } from "./Pagination";

const meta = {
  title: "Data/Pagination",
  component: Pagination,
  args: { page: 1, pageSize: 20, total: 57, onPageChange: () => {} },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPageSize: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(20);
    return <Pagination {...args} page={page} pageSize={size} onPageChange={setPage} pageSizeOptions={[10, 20, 50]} onPageSizeChange={(n) => { setSize(n); setPage(1); }} />;
  },
};
