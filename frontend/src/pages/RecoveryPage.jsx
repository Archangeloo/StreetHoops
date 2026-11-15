import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormField, PasswordInput, StatusMessage } from '../components/FormField.jsx';
import { apiFetch } from '../services/api.js';

export function RecoveryPage() {
  const [params, setParams] = useSearchParams();
  const token = params.get('token');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setFields({}); setSuccess('');
    try {
      const result = await apiFetch(token ? '/auth/redefinir-senha' : '/auth/recuperar-senha', {
        method: 'POST', body: token ? { token, senha, confirmarSenha } : { email },
      });
      setSuccess(result.message);
      if (token) { setSenha(''); setConfirmarSenha(''); setParams({}, { replace: true }); }
    } catch (e) { setError(e.message); setFields(e.fields || {}); }
    finally { setBusy(false); }
  };
  return (
    <section className="auth-page recovery-page" aria-labelledby="recovery-title">
      <div className="auth-back"><Link to="/login">← Voltar ao login</Link><span>03 / 03</span></div>
      <div className="recovery-symbol" aria-hidden="true">↺</div>
      <div className="eyebrow">VOLTE PARA O JOGO</div>
      <h1 id="recovery-title">{token ? <>NOVA <em>SENHA.</em></> : <>RECUPERAR <em>ACESSO.</em></>}</h1>
      <p className="auth-intro">{token ? 'Escolha uma nova senha para sua conta.' : 'Informe seu e-mail para receber um link de recuperação, válido por 15 minutos.'}</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        {token ? <>
          <FormField id="senha" label="Nova senha" required error={fields.senha} hint="8 ou mais caracteres, incluindo letra e número.">
            <PasswordInput id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} error={fields.senha} autoComplete="new-password" placeholder="Digite a nova senha" />
          </FormField>
          <FormField id="confirmarSenha" label="Confirme a senha" required error={fields.confirmarSenha}>
            <PasswordInput id="confirmarSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} error={fields.confirmarSenha} autoComplete="new-password" placeholder="Repita a nova senha" />
          </FormField>
        </> : <FormField id="email" label="E-mail cadastrado" required error={fields.email}>
          <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" required aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? 'email-error' : undefined} />
        </FormField>}
        <StatusMessage type="error">{error}</StatusMessage>
        <StatusMessage type="success">{success}</StatusMessage>
        {!success && <button className="button button--primary" type="submit" disabled={busy}>{busy ? 'ENVIANDO...' : token ? 'SALVAR NOVA SENHA →' : 'ENVIAR LINK →'}</button>}
      </form>
      {success && <Link className="button button--secondary recovery-login" to="/login">VOLTAR PARA LOGIN</Link>}
      {!token && <p className="small-note">Se o e-mail existir, você receberá as instruções. Confira sua caixa de entrada e spam. Em desenvolvimento local, o link aparece no terminal da API.</p>}
    </section>
  );
}
