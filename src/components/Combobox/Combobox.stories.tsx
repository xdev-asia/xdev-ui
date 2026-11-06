import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type JSX } from "react";
import { Combobox, type ComboboxOption, type ComboboxSingleProps } from "./Combobox";

/** Storybook cannot infer args from a generic union; the controls describe the single mode. */
const SingleCombobox = Combobox as (props: ComboboxSingleProps) => JSX.Element;

const CITIES: ComboboxOption[] = [
  { value: "hn", label: "Hà Nội", meta: "Capital" },
  { value: "hcm", label: "Hồ Chí Minh" },
  { value: "dn", label: "Đà Nẵng" },
  { value: "hp", label: "Hải Phòng", disabled: true },
  { value: "ct", label: "Cần Thơ" },
];

const meta = {
  title: "Inputs/Combobox",
  component: SingleCombobox,
  args: { label: "City", placeholder: "Type a city", options: CITIES, value: null, onChange: () => {} },
  decorators: [(Story) => <div style={{ width: 360, minHeight: 300 }}><Story /></div>],
} satisfies Meta<typeof SingleCombobox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Type "da nang" to find Đà Nẵng: matching ignores case and diacritics. */
export const Single: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>("dn");
    return <SingleCombobox {...args} value={value} onChange={setValue} />;
  },
};
export const Open: Story = { args: { defaultOpen: true } };
export const Invalid: Story = { args: { invalid: true, "aria-describedby": "city-error" } };
export const Disabled: Story = { args: { disabled: true, value: "hn" } };
/** Chips before the box; Backspace on an empty box removes the last one. */
export const Multiple: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(["hn", "ct"]);
    return <Combobox label={args.label} options={CITIES} multiple value={value} onChange={setValue} placeholder="Add cities" />;
  },
};
/** A "Create" row appears when the text matches no option exactly. */
export const Creatable: Story = {
  render: (args) => {
    const [options, setOptions] = useState(CITIES);
    const [value, setValue] = useState<string[]>([]);
    return (
      <Combobox
        label={args.label}
        options={options}
        multiple
        value={value}
        onChange={setValue}
        onCreate={(text) => {
          const v = text.toLowerCase();
          setOptions((o) => [...o, { value: v, label: text }]);
          setValue((cur) => [...cur, v]);
        }}
      />
    );
  },
};
