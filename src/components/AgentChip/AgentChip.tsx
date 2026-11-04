import type { JSX } from "react";
import type { AgentProfile } from "../../types";

export interface AgentChipProps {
  profile?: AgentProfile;
  /** Letter for custom profiles. claude → C, codex → X. */
  letter?: string;
  /** Full profile name for hover and screen readers. */
  title?: string;
}

const PROFILE_LETTER: Partial<Record<AgentProfile, string>> = { claude: "C", codex: "X" };

export function AgentChip({ profile = "custom", letter, title }: AgentChipProps): JSX.Element {
  const name = title ?? profile;
  return (
    <span className="ws-chip" data-profile={profile === "custom" ? undefined : profile} title={name} aria-label={name} role="img">
      {letter ?? PROFILE_LETTER[profile] ?? "A"}
    </span>
  );
}
