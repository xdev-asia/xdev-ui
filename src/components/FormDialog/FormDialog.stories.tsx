import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Field } from "../Field/Field";
import { FormDialog } from "./FormDialog";

const meta = {
  title: "Overlays/FormDialog",
  component: FormDialog,
  args: {
    title: "New user",
    description: "They receive an email to set a password.",
    submitLabel: "Create user",
    modal: false,
    onSubmit: fn(),
    onCancel: fn(),
    children: <Field label="Email" type="email" />,
  },
} satisfies Meta<typeof FormDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Busy: Story = { args: { busy: true } };
export const ServerError: Story = { args: { error: "This email is already used by another account." } };
/** The form is owned outside (a form library); the submit button targets it with `form`. */
export const ExternalForm: Story = {
  render: () => (
    <FormDialog title="Rename banner" submitLabel="Rename" modal={false} formId="rename-banner" onCancel={() => {}}>
      <form id="rename-banner" onSubmit={(e) => e.preventDefault()}>
        <Field label="Name" defaultValue="Spring sale" />
      </form>
    </FormDialog>
  ),
};
