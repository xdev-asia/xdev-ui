import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "../IconButton/IconButton";
import { Stack } from "../Stack/Stack";
import { ModelChip, ModelChipAdd } from "./ModelChip";

const actions = (
  <>
    <IconButton size="sm" icon="eye" label="Hide" />
    <IconButton size="sm" icon="play" label="Test" />
  </>
);
const meta = {
  title: "Display/ModelChip",
  component: ModelChip,
  args: { code: "openai/gpt-5.5", name: "GPT-5.5", codeAction: <IconButton size="sm" icon="copy" label="Copy" />, actions },
} satisfies Meta<typeof ModelChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const TurnedOff: Story = { args: { dimmed: true } };
/** A provider's model list, ending with the add chip. */
export const List: Story = {
  render: (args) => (
    <Stack direction="row" wrap gap={2}>
      <ModelChip {...args} />
      <ModelChip {...args} code="openai/gpt-5-mini" name="GPT-5 mini" />
      <ModelChipAdd label="Add model" onClick={() => {}} />
    </Stack>
  ),
};
