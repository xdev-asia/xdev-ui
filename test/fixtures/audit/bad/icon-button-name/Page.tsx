import { Button, Icon, IconButton } from "@xdev-asia/ui";

export function Page({ close }: { close: () => void }) {
  return (
    <div>
      <button type="button" onClick={close}>
        <Icon name="close" />
      </button>
      <button type="button" aria-label="Close" onClick={close}><Icon name="close" /></button>
      <button type="button" onClick={close}><Icon name="close" />Close</button>
      <button type="button" onClick={close}><Icon name="close" label="Close" /></button>
      <Button icon="close" onClick={close} />
      <IconButton icon="close" label="Close" onClick={close} />
    </div>
  );
}
