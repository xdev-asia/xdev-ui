import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioPreview } from "./AudioPreview";

// No clip is bundled: point src at an audio file that Storybook serves.
const meta = {
  title: "Actions/AudioPreview",
  component: AudioPreview,
  args: { src: "/sample.mp3" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] } },
} satisfies Meta<typeof AudioPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Medium: Story = { args: { size: "md" } };
export const WithLabel: Story = { args: { label: "Listen" } };
export const List: Story = {
  render: (args) => (
    <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0 }}>
      {["Intro", "Jingle", "Outro"].map((t) => (
        <li key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AudioPreview {...args} id={t} />
          {t}
        </li>
      ))}
    </ul>
  ),
};
export const Vietnamese: Story = { args: { labels: { play: "Nghe thử", stop: "Dừng nghe thử" } } };
export const Disabled: Story = { args: { disabled: true } };
