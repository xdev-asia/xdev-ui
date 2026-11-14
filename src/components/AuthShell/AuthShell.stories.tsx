import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandMark } from "../BrandMark/BrandMark";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { Stack } from "../Stack/Stack";
import { AuthShell } from "./AuthShell";

const meta = {
  title: "Layout/AuthShell",
  component: AuthShell,
  parameters: { layout: "fullscreen" },
  args: {
    brand: (
      <>
        <BrandMark variant="tile" size={32} />
        <span>xDev account</span>
      </>
    ),
    headline: "One account for every xDev tool",
    tagline: "Sign in once; the desktop app, the console and the CLI follow.",
    footer: "© 2026 xDev",
    children: (
      <Stack gap={4}>
        <h1>Welcome back</h1>
        <Field label="Email" type="email" />
        <Field label="Password" type="password" />
        <Button variant="primary">Sign in</Button>
      </Stack>
    ),
  },
} satisfies Meta<typeof AuthShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoPitch: Story = { args: { headline: undefined, tagline: undefined } };
