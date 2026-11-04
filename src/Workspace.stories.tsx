import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityBar } from "./components/ActivityBar/ActivityBar";
import { AgentChip } from "./components/AgentChip/AgentChip";
import { Banner } from "./components/Banner/Banner";
import { Button } from "./components/Button/Button";
import { DiffStat } from "./components/DiffStat/DiffStat";
import { StatusBar } from "./components/StatusBar/StatusBar";
import { StatusDot } from "./components/StatusDot/StatusDot";
import { TabStrip } from "./components/TabStrip/TabStrip";

function Workspace() {
  return (
    <div className="sb-ws">
      <style>{`
        .sb-ws { display: grid; grid-template-columns: auto 1fr; grid-template-rows: 1fr auto; height: 100vh; min-height: 480px; background: var(--bg-0); color: var(--text-1); }
        .sb-ws-main { display: grid; grid-template-rows: auto 1fr; min-width: 0; }
        .sb-ws-panes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1px; background: var(--line); min-height: 0; }
        .sb-ws-pane { background: var(--bg-1); padding: 16px; overflow: auto; font-family: "JetBrains Mono", monospace; font-size: 13px; line-height: 1.6; color: var(--text-2); }
        .sb-ws-pane p { margin: 0 0 4px; }
        .sb-ws-pane strong { color: var(--text-1); font-weight: 500; }
        .sb-ws-foot { grid-column: 1 / -1; }
        @media (max-width: 767px) {
          .sb-ws { grid-template-columns: 1fr; grid-template-rows: 1fr auto auto; }
          .sb-ws > nav { order: 2; flex-direction: row; overflow-x: auto; }
          .sb-ws-panes { grid-template-columns: 1fr; }
          .sb-ws-pane + .sb-ws-pane { display: none; }
        }
      `}</style>
      <ActivityBar active="terminal" changeCount={3} />
      <div className="sb-ws-main">
        <TabStrip
          label="Agent tabs"
          defaultSelected="a"
          tabs={[
            { id: "a", name: "login-retry", state: "working", profile: "claude", color: 1 },
            { id: "b", name: "fix-ci-cache", state: "waiting", profile: "codex", color: 4, unread: true },
            { id: "c", name: "docs-sync", state: "done", profile: "claude", color: 6 },
          ]}
        />
        <div className="sb-ws-panes">
          <section className="sb-ws-pane" aria-label="Agent output">
            <p><strong>claude</strong> reading src/auth/retry.ts</p>
            <p>Added exponential backoff, capped at 3 attempts.</p>
            <p>Running pnpm test auth …</p>
            <p><strong>✓</strong> 14 passed</p>
          </section>
          <section className="sb-ws-pane" aria-label="Review">
            <Banner title="Waiting for review" action={<Button variant="secondary">Open diff</Button>}>
              fix-ci-cache wants to edit .github/workflows/ci.yml.
            </Banner>
          </section>
        </div>
      </div>
      <div className="sb-ws-foot">
        <StatusBar
          items={[
            <span key="b">feat/login-retry</span>,
            <DiffStat key="d" added={128} removed={14} />,
            "spacer",
            <span key="s" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
              <StatusDot state="working" /> 1 working
            </span>,
            <AgentChip key="a" profile="claude" title="Claude Code" />,
          ]}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Patterns/Workspace",
  component: Workspace,
  parameters: { layout: "fullscreen" },
  tags: ["!autodocs"],
} satisfies Meta<typeof Workspace>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Tablet: Story = { globals: { viewport: { value: "tablet" } } };
export const Phone: Story = { globals: { viewport: { value: "phone" } } };
