import { Button, Dialog } from "@xdev-asia/ui";

export function Page() {
  return (
    <section style={{ padding: "var(--x-space-4)", font: "var(--type-body)" }}>
      <p>Create a session</p>
      <a href="#main">Skip</a>
      <Button>Create session</Button>
      <Button variant="secondary">Cancel</Button>
      <Button
        variant="secondary"
        onClick={() => 1 > 0}
      >
        Close
      </Button>
    </section>
  );
}
