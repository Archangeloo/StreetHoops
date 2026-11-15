export function Logo({ large = false }) {
  return (
    <span className={`sh-logo ${large ? 'sh-logo--large' : ''}`} role="img" aria-label="Street Hoops">
      <span>SH</span><span className="sh-logo__ball" aria-hidden="true" />
    </span>
  );
}
