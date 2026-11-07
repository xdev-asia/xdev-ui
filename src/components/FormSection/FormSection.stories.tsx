import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { FormSection } from "./FormSection";

const meta = {
  title: "Layout/FormSection",
  component: FormSection,
  args: {
    title: "Profile",
    description: "Shown to teammates.",
    children: (
      <>
        <Field label="Full name" defaultValue="Ada Lovelace" />
        <Field label="Email" type="email" defaultValue="ada@example.com" />
      </>
    ),
    actions: (
      <>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save changes</Button>
      </>
    ),
  },
} satisfies Meta<typeof FormSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OneColumn: Story = {};
export const TwoColumns: Story = { args: { columns: 2 } };
