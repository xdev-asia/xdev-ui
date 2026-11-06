import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LABELS, type RichTextEditorLabels } from "./labels";

const fake = {
  isDestroyed: false,
  isEditable: true,
  options: { editorProps: {} },
  state: { selection: {} },
  isActive: () => false,
  can: () => ({ undo: () => true, redo: () => true }),
};
vi.mock("@tiptap/react", () => ({
  useEditor: () => fake,
  useEditorState: ({ editor, selector }: { editor: unknown; selector: (s: { editor: unknown }) => unknown }) => selector({ editor }),
  EditorContent: () => null,
}));
const { RichTextEditor } = await import("./RichTextEditor");

// Every label replaced: no English default may reach the toolbar.
const vi_: RichTextEditorLabels = {
  toolbar: "Định dạng",
  heading2: "Tiêu đề 2",
  heading3: "Tiêu đề 3",
  bold: "Đậm",
  italic: "Nghiêng",
  bulletList: "Danh sách chấm",
  orderedList: "Danh sách số",
  quote: "Trích dẫn",
  link: "Liên kết",
  image: "Chèn ảnh",
  undo: "Hoàn tác",
  redo: "Làm lại",
  linkDialog: "Sửa liên kết",
  linkUrl: "Địa chỉ liên kết",
  linkInvalid: "Dùng địa chỉ bắt đầu bằng http:// hoặc https://.",
  linkApply: "Áp dụng",
  linkRemove: "Bỏ liên kết",
  imageAlt: "Mô tả ảnh",
  imageAltPlaceholder: "Ảnh này cho thấy gì?",
  imageRemove: "Xoá ảnh",
  uploading: "Đang tải ảnh lên",
  imageInvalid: (max) => `Dùng ảnh JPG, PNG hoặc WebP tối đa ${max}.`,
  uploadFailed: "Không tải được ảnh. Thử lại.",
};

describe("RichTextEditor labels", () => {
  it("covers every default key", () => {
    expect(Object.keys(vi_).sort()).toEqual(Object.keys(DEFAULT_LABELS).sort());
  });

  it("uses the overrides in the toolbar instead of the English defaults", () => {
    const html = renderToStaticMarkup(
      <RichTextEditor aria-label="Nội dung" value="" onChange={() => {}} labels={vi_} onUploadImage={async () => ""} />,
    );
    for (const key of ["toolbar", "heading2", "heading3", "bold", "italic", "bulletList", "orderedList", "quote", "link", "image", "undo", "redo"] as const) {
      expect(html).toContain(`aria-label="${vi_[key]}"`);
      expect(html).not.toContain(`"${DEFAULT_LABELS[key]}"`);
    }
    expect(html).toContain('title="Liên kết (Ctrl+K)"');
  });
});
