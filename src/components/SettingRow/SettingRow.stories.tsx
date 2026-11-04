import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Segmented } from "../Segmented/Segmented";
import { Select } from "../Select/Select";
import { Switch } from "../Switch/Switch";
import { SettingRow } from "./SettingRow";

const meta = {
  title: "Display/SettingRow",
  component: SettingRow,
  args: {
    label: "Restore sessions on launch",
    description: "Reopen the agent sessions and terminals that were running when xDev closed.",
    controlId: "set-restore",
    control: <Switch id="set-restore" aria-describedby="set-restore-hint" defaultChecked />,
  },
  decorators: [(Story) => <div style={{ width: 560 }}><Story /></div>],
} satisfies Meta<typeof SettingRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithSwitch: Story = {};
export const Flash: Story = { args: { flash: true } };

export const Section: Story = {
  render: () => {
    const [theme, setTheme] = useState("system");
    return (
      <div>
        <SettingRow
          id="theme"
          label="Theme"
          description="Follow the system, or pin light or dark."
          control={
            <Segmented
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: "system", label: "System" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          }
        />
        <SettingRow
          id="agent"
          controlId="set-agent"
          label="Default agent"
          description="Used for new sessions when a task does not name one."
          control={
            <Select
              id="set-agent"
              aria-describedby="set-agent-hint"
              options={[
                { value: "claude", label: "Claude Code" },
                { value: "codex", label: "Codex" },
                { value: "gemini", label: "Gemini CLI" },
              ]}
            />
          }
        />
        <SettingRow
          id="worktree"
          controlId="set-worktree"
          label="One worktree per task"
          description="Create a fresh git worktree when a task starts."
          control={<Switch id="set-worktree" aria-describedby="set-worktree-hint" />}
        />
      </div>
    );
  },
};
