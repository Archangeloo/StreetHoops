import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FormField, PasswordInput, StatusMessage } from '../components/FormField.jsx';

export function LoginPage() {
  const { login, serviceError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const afterLogin = location.state?.from?.pathname?.startsWith('/') ? location.state.from.pathname : '/inicio';
  const submit = async (event) => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setErrors({});
    try { await login({ email, senha }); navigate(afterLogin, { replace: true }); }
    catch (error) { setError(error.message); setErrors(error.fields || {}); }
    finally { setBusy(false); }
  };
  return (
    <section className="auth-page login-page" aria-labelledby="login-title">
      <div className="auth-back"><Link to="/">← Voltar</Link><span>02 / 03</span></div>
      <div className="login-art" aria-hidden="true"><span className="login-art__ball">◉</span><div className="login-art__ring" /></div>
      <div className="eyebrow">BEM-VINDO DE VOLTA</div>
      <h1 id="login-title">A QUADRA <em>TE ESPERA.</em></h1>
      <p className="auth-intro">Entre na sua conta e encontre sua próxima partida.</p>
      {location.state?.notice && <StatusMessage type="success">{location.state.notice}</StatusMessage>}
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormField id="email" label="E-mail" required error={errors.email}>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
        </FormField>
        <FormField id="senha" label="Senha" required error={errors.senha}>
          <PasswordInput id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} error={errors.senha} autoComplete="current-password" />
        </FormField>
        <Link className="forgot-link" to="/recuperar-senha">Esqueceu a senha?</Link>
        <StatusMessage type="error">{error || serviceError}</StatusMessage>
        <button className="button button--primary button--pulse" type="submit" disabled={busy}>{busy ? 'ENTRANDO...' : 'ENTRAR NA QUADRA →'}</button>
      </form>
      <p className="auth-switch">Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
    </section>
  );
}
