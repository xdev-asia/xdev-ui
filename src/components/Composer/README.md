# Composer

Message box under the terminal or chat: a text area, an optional attach button and model select, and the Send button.

## Anatomy
`div.x-composer` > `textarea.kit-textarea.x-composer-input` + `.x-composer-bar` (`IconButton` attach, `Select` model, `Button` Send).

## Props
`value`, `onChange(value)`, `onSend()`, `model?: { value, options }`, `onModel?(value)`, `onAttach?`, `disabled?`, `placeholder?`, `labels?` (`input`, `send`, `attach`, `model`).

## Rules
- Enter sends. Shift+Enter inserts a newline. Enter during IME composition does not send.
- Send is the one primary button. It is disabled while the text is blank or the composer is `disabled`; Enter follows the same rule.
- The text box has no visible label, so it takes `labels.input` as its aria-label. Give a `placeholder` that says what to type.
- The model select and the attach button render only when `model` / `onAttach` are given.
- The composer is controlled; the caller clears `value` in `onSend`.
- Translate with `labels`; the defaults are English.
