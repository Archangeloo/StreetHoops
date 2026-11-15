import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField, PasswordInput, StatusMessage } from '../components/FormField.jsx';
import { apiFetch } from '../services/api.js';
import { cpfMask, dateMask, phoneMask } from '../services/masks.js';

const initial = { nome: '', dataNascimento: '', cpf: '', telefone: '', email: '', senha: '', aceitarTermos: false };
export function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setErrors({}); setServerError('');
    try {
      const result = await apiFetch('/auth/cadastro', { method: 'POST', body: values });
      navigate('/login', { replace: true, state: { notice: result.message } });
    } catch (error) {
      setErrors(error.fields || {});
      setServerError(error.message);
    } finally { setSaving(false); }
  };
  return (
    <section className="auth-page" aria-labelledby="register-title">
      <div className="auth-back"><Link to="/">← Voltar</Link><span>01 / 03</span></div>
      <div className="eyebrow">ENTRE PARA O JOGO</div>
      <h1 id="register-title">CRIE SUA <em>CONTA.</em></h1>
      <p className="auth-intro">Seu próximo jogo começa com seu cadastro.</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        <FormField id="nome" label="Nome completo" required error={errors.nome}>
          <input id="nome" name="nome" type="text" value={values.nome} onChange={(e) => setField('nome', e.target.value)} placeholder="Nome e sobrenome" autoComplete="name" maxLength="160" required aria-invalid={Boolean(errors.nome)} aria-describedby={errors.nome ? 'nome-error' : undefined} />
        </FormField>
        <div className="form-grid">
          <FormField id="dataNascimento" label="Nascimento" required error={errors.dataNascimento}>
            <input id="dataNascimento" name="dataNascimento" type="text" inputMode="numeric" value={values.dataNascimento} onChange={(e) => setField('dataNascimento', dateMask(e.target.value))} placeholder="dd/mm/aaaa" autoComplete="bday" maxLength="10" required aria-invalid={Boolean(errors.dataNascimento)} aria-describedby={errors.dataNascimento ? 'dataNascimento-error' : undefined} />
          </FormField>
          <FormField id="cpf" label="CPF" required error={errors.cpf}>
            <input id="cpf" name="cpf" type="text" inputMode="numeric" value={values.cpf} onChange={(e) => setField('cpf', cpfMask(e.target.value))} placeholder="000.000.000-00" maxLength="14" required autoComplete="off" aria-invalid={Boolean(errors.cpf)} aria-describedby={errors.cpf ? 'cpf-error' : undefined} />
          </FormField>
        </div>
        <FormField id="telefone" label="Telefone com DDD" required error={errors.telefone}>
          <input id="telefone" name="telefone" type="tel" value={values.telefone} onChange={(e) => setField('telefone', phoneMask(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" required aria-invalid={Boolean(errors.telefone)} aria-describedby={errors.telefone ? 'telefone-error' : undefined} />
        </FormField>
        <FormField id="email" label="E-mail" required error={errors.email}>
          <input id="email" name="email" type="email" value={values.email} onChange={(e) => setField('email', e.target.value)} placeholder="voce@exemplo.com" autoComplete="email" maxLength="255" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
        </FormField>
        <FormField id="senha" label="Senha" required error={errors.senha} hint="No mínimo 8 caracteres, incluindo letra e número.">
          <PasswordInput id="senha" value={values.senha} onChange={(e) => setField('senha', e.target.value)} error={errors.senha} placeholder="Crie uma senha forte" autoComplete="new-password" />
        </FormField>
        <div className="terms-wrap">
          <label className="terms-check"><input type="checkbox" checked={values.aceitarTermos} onChange={(e) => setField('aceitarTermos', e.target.checked)} aria-invalid={Boolean(errors.aceitarTermos)} aria-describedby={errors.aceitarTermos ? 'aceitarTermos-error' : undefined} /> <span>Li e aceito os <Link to="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</Link>.</span></label>
          {errors.aceitarTermos && <small className="field__error" id="aceitarTermos-error" role="alert">{errors.aceitarTermos}</small>}
        </div>
        <StatusMessage type="error">{serverError}</StatusMessage>
        <button className="button button--primary button--pulse" type="submit" disabled={saving}>{saving ? 'CRIANDO CONTA...' : 'CRIAR MINHA CONTA →'}</button>
      </form>
      <p className="auth-switch">Já tem uma conta? <Link to="/login">Fazer login</Link></p>
    </section>
  );
}
