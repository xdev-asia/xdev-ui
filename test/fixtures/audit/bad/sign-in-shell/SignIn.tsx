import { AuthShell, BrandMark, Select } from "@xdev-asia/ui";
export const SignIn = () => (
  <AuthShell brand={<BrandMark />} actions={<Select aria-label="Language" options={[]} />}>
    <h1>Sign in</h1>
    <h1>Use your account</h1>
  </AuthShell>
);
