import type { JSX } from "react";
import { Badge, Card, FieldMessage, Stack } from "@xdev-asia/ui";
import { useI18n } from "../i18n";
import { useStore } from "../store";
import type { Run } from "../workspace";

/** The grade an agent gave at the gate that waits, and what a person still has to do. Nothing when the gate is a person's alone. */
export function AiReview({ run }: { run: Run }): JSX.Element | null {
  const s = useStore();
  const { t } = useI18n();
  const gate = s.pipelines.find((p) => p.id === run.pipeline)?.stages.find((st) => st.id === run.stage)?.gate;
  const review = run.aiReview;
  if (!gate || (gate.by !== "ai" && gate.by !== "ai+human") || !review) return null;
  return (
    <Card title={t("aigate.graded", { agent: review.agent })} subtitle={`${gate.skill ?? ""} · ${review.at}`} monoSubtitle titleAside={<Badge status={review.verdict === "pass" ? "new" : "changed"}>{t(review.verdict === "pass" ? "aigate.pass" : "aigate.changes")}</Badge>}>
      <Stack gap={2}>
        <ul className="app-notes">
          {review.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <FieldMessage tone="info">{gate.by === "ai+human" ? `${t("aigate.confirm")} ${t("aigate.overrule")}` : t("aigate.byAi", { agent: review.agent })}</FieldMessage>
      </Stack>
    </Card>
  );
}
