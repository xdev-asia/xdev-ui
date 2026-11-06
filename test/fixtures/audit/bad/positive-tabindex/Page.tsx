export function Page() {
  return (
    <div>
      <div tabIndex={2}>One</div>
      <div tabIndex={0}>Two</div>
      <div tabIndex={-1}>Three</div>
      <span tabindex="3">Four</span>
    </div>
  );
}
