import React from 'react';
export function FormField({ id, label, hint, error, required, children }) {
  return (
    <div className={`field ${error ? 'field--invalid' : ''}`}>
      <label className="field__label" htmlFor={id}>{label} {required && <span aria-hidden="true" className="required-mark">*</span>}</label>
      {children}
      {hint && !error && <small className="field__hint" id={`${id}-hint`}>{hint}</small>}
      {error && <small className="field__error" id={`${id}-error`} role="alert">{error}</small>}
    </div>
  );
}
export function StatusMessage({ type = 'info', children }) {
  if (!children) return null;
  return <div className={`form-message form-message--${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div>;
}
export function PasswordInput({ id, value, onChange, error, placeholder = 'Sua senha', autoComplete = 'current-password', name }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="password-wrap">
      <input id={id} name={name || id} type={visible ? 'text' : 'password'} value={value} onChange={onChange}
        placeholder={placeholder} required minLength={8} maxLength={128} autoComplete={autoComplete}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      <button type="button" className="password-toggle" onClick={() => setVisible((was) => !was)} aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}>{visible ? 'Ocultar' : 'Mostrar'}</button>
    </div>
  );
}
