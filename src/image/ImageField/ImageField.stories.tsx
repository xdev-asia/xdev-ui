import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { Button } from "../../components/Button/Button";
import { ImageField, type ImageFieldProps } from "./ImageField";

/** Stands in for a server: waits a moment and serves the cropped image from an object URL. */
const fakeUpload = async (blob: Blob): Promise<string> => {
  await new Promise((r) => setTimeout(r, 900));
  return URL.createObjectURL(blob);
};

function Controlled(props: ImageFieldProps) {
  const [value, setValue] = useState(props.value);
  return <ImageField {...props} value={value} onChange={(v) => { setValue(v); props.onChange(v); }} />;
}

const meta = {
  title: "Image/ImageField",
  component: ImageField,
  render: (args) => <Controlled {...args} />,
  args: {
    label: "Cover image",
    aspect: { ratio: 16 / 9, width: 1600, height: 900 },
    value: null,
    onChange: fn(),
    onUpload: fakeUpload,
    onBusyChange: fn(),
  },
} satisfies Meta<typeof ImageField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { required: true, hint: "Shown at the top of the article." } };
export const WithImage: Story = { args: { value: "/brand/xdev-icon-512.png", aspect: { ratio: 1, width: 512, height: 512 }, label: "Avatar" } };
export const WithLibrary: Story = { args: { actions: <Button variant="secondary" icon="image">Choose from library</Button> } };
export const Invalid: Story = { args: { error: "Add a cover image." } };
export const UploadFails: Story = { args: { onUpload: async () => Promise.reject(new Error("The server refused the image.")) } };
export const Disabled: Story = { args: { disabled: true, value: "/brand/xdev-icon-512.png", aspect: { ratio: 1, width: 512, height: 512 } } };
