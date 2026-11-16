import type { JSX } from "react";
import { Tag } from "@xdev-asia/ui";
import type { GateBy } from "../config";
import { useI18n } from "../i18n";

/** Who decides at a gate, as a tag: a person, AI, or AI then a person. Nothing for a stage with no gate. */
export function GateTag({ by }: { by: GateBy }): JSX.Element | null {
  const { t } = useI18n();
  if (by === "none") return null;
  return <Tag tone={by === "ai" ? "default" : "warn"}>{t(by === "human" ? "cfg.tagPerson" : by === "ai" ? "cfg.tagAi" : "cfg.tagAiPerson")}</Tag>;
}
