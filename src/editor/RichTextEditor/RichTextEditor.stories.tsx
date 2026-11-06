import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type JSX } from "react";
import { RichTextEditor, type RichTextEditorProps } from "./RichTextEditor";

const sample = `## Tết in the old town

Lanterns go up a week **before** the new year, and the *streets* fill after dark.

- Buy flowers early
- Keep the first visit for family

> A good start makes a good year.

Read more on [the city site](https://example.com).`;

// Stories have no server: an upload turns the file into a local URL after a short wait.
const fakeUpload = (file: File): Promise<string> =>
  new Promise((resolve) => setTimeout(() => resolve(URL.createObjectURL(file)), 800));

function Controlled(props: Omit<RichTextEditorProps, "value" | "onChange"> & { initial?: string }): JSX.Element {
  const { initial = "", ...rest } = props;
  const [value, setValue] = useState(initial);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <RichTextEditor {...rest} value={value} onChange={setValue} />
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)" }}>{value}</pre>
    </div>
  );
}

const meta = {
  title: "Editor/RichTextEditor",
  component: Controlled,
  args: { label: "Body", placeholder: "Write the article…" },
  decorators: [(Story) => <div style={{ padding: 16 }}><Story /></div>],
} satisfies Meta<typeof Controlled>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Markdown: Story = { args: { initial: sample } };
export const Empty: Story = {};
export const WithImages: Story = { args: { initial: sample, onUploadImage: fakeUpload } };
export const Html: Story = { args: { format: "html", initial: "<h2>Title</h2><p>Some <strong>bold</strong> text.</p>" } };
export const Invalid: Story = { args: { initial: "Too short.", invalid: true } };
export const Disabled: Story = { args: { initial: sample, disabled: true } };
export const Vietnamese: Story = {
  args: {
    label: "Nội dung",
    placeholder: "Viết bài…",
    labels: { toolbar: "Định dạng", bold: "Đậm", italic: "Nghiêng", link: "Liên kết", heading2: "Tiêu đề 2", heading3: "Tiêu đề 3", quote: "Trích dẫn", bulletList: "Danh sách chấm", orderedList: "Danh sách số", undo: "Hoàn tác", redo: "Làm lại" },
  },
};
