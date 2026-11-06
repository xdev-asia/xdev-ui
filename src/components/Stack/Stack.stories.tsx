import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { Stack } from "./Stack";

const meta = {
  title: "Layout/Stack",
  component: Stack,
  args: { gap: 4 },
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
  render: (args) => (
    <Stack {...args}>
      <Field label="Name" />
      <Field label="Email" type="email" />
      <Stack direction="row" gap={2} justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </Stack>
    </Stack>
  ),
};
