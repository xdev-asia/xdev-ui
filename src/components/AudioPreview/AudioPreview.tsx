import { useSyncExternalStore, type JSX, type ReactNode } from "react";
import { cx } from "../../internal/cx";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { audioPreviewStore, playAudioPreview, stopAudioPreview } from "./audio-preview-store";

export interface AudioPreviewLabels {
  /** Name of the button while idle (aria-label and title). */
  play: string;
  /** Name of the button while its clip plays. */
  stop: string;
}

export const AUDIO_PREVIEW_LABELS: AudioPreviewLabels = { play: "Play preview", stop: "Stop preview" };

export interface AudioPreviewProps {
  /** Audio URL. */
  src: string;
  /** Identity of the clip for the playing state. Default `src`. */
  id?: string;
  /** Visible text after the icon; the button then renders as a secondary `Button` with the icon. */
  label?: ReactNode;
  /** Default "sm". */
  size?: "sm" | "md";
  disabled?: boolean;
  /** The clip failed to load or play; the button is back to "play". */
  onError?: () => void;
  labels?: Partial<AudioPreviewLabels>;
  className?: string;
}

export interface AudioPreviewControls {
  /** Id of the clip playing on the page, or null. */
  playingId: string | null;
  /** Plays `src` as clip `id`, stopping whatever played. */
  play(id: string, src: string, onError?: () => void): void;
  stop(): void;
}

/** The page-wide preview player: which clip plays, and play and stop. Server render: nothing plays. */
export function useAudioPreview(): AudioPreviewControls {
  const playingId = useSyncExternalStore(audioPreviewStore.subscribe, audioPreviewStore.getSnapshot, audioPreviewStore.getServerSnapshot);
  return { playingId, play: playAudioPreview, stop: stopAudioPreview };
}

export function AudioPreview({ src, id, label, size = "sm", disabled, onError, labels, className }: AudioPreviewProps): JSX.Element {
  const l = { ...AUDIO_PREVIEW_LABELS, ...labels };
  const { playingId, play, stop } = useAudioPreview();
  const key = id ?? src;
  const playing = playingId === key;
  const name = playing ? l.stop : l.play;
  const icon = playing ? "stop" : "play";
  const onClick = (): void => (playing ? stop() : play(key, src, onError));
  const cls = cx("x-audio-preview", className);
  if (label != null && label !== false && label !== "")
    return (
      <Button variant="secondary" size={size} icon={icon} title={name} aria-pressed={playing} data-playing={playing || undefined} disabled={disabled} className={cls} onClick={onClick}>
        {label}
      </Button>
    );
  return <IconButton icon={icon} label={name} size={size} data-playing={playing || undefined} disabled={disabled} className={cls} onClick={onClick} />;
}
