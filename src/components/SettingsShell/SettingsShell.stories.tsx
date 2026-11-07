import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaveBar } from "../SaveBar/SaveBar";
import { SettingRow } from "../SettingRow/SettingRow";
import { Switch } from "../Switch/Switch";
import { SettingsShell, type SettingsShellGroup } from "./SettingsShell";

const groups: SettingsShellGroup[] = [
  {
    id: "general",
    label: "General",
    items: [
      { id: "appearance", label: "Appearance", keywords: ["theme", "dark", "light"] },
      { id: "language", label: "Language", keywords: ["vi", "en"] },
    ],
  },
  { id: "terminal", label: "Terminal and editor", items: [{ id: "font", label: "Font", keywords: ["size", "mono"] }] },
];

const meta = { title: "Layout/SettingsShell", component: SettingsShell } satisfies Meta<typeof SettingsShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { groups, value: "appearance", onChange() {}, query: "", onQuery() {}, children: null },
  render: () => {
    const [value, setValue] = useState("appearance");
    const [query, setQuery] = useState("");
    const [dirty, setDirty] = useState(false);
    return (
      <div style={{ height: 420 }}>
        <SettingsShell
          groups={groups}
          value={value}
          onChange={setValue}
          query={query}
          onQuery={setQuery}
          saveBar={<SaveBar dirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />}
        >
          {(s) => (
            <>
              {s.visible("appearance") ? <SettingRow id="appearance" label="Appearance" description="Dark or light" control={<Switch checked={dirty} onChange={() => setDirty(true)} label="Dark" />} /> : null}
              {s.visible("language") ? <SettingRow id="language" label="Language" /> : null}
              {s.visible("font") ? <SettingRow id="font" label="Font" /> : null}
            </>
          )}
        </SettingsShell>
      </div>
    );
  },
};
