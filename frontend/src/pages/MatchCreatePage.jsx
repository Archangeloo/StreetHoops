import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FormField, StatusMessage } from '../components/FormField.jsx';
import '../styles/matches.css';

const modes = ['1v1', '3v3', '5v5'];
export function MatchCreatePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [courts, setCourts] = useState([]);
  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ quadraId: params.get('quadra') || '', modalidade: '1v1', pontuacao: 21, estilo: 'FIBA', apostaSimbolica: '' });
  const [symbolic, setSymbolic] = useState(false);
  const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
  useEffect(() => {
    const abort = new AbortController();
    Promise.all([apiFetch('/quadras', { signal: abort.signal }), apiFetch('/checkin', { signal: abort.signal }), apiFetch('/partidas', { signal: abort.signal })])
      .then(([a, b, c]) => {
        const active = c.partidas.find((match) => ['BUSCANDO', 'PRONTA', 'EM_ANDAMENTO', 'AGUARDANDO_CONFIRMACAO'].includes(match.status) && match.vagas.some((v) => v.jogadorId === user.id && v.status === 'PREENCHIDA'));
        if (active) { navigate(`/partidas/${active.id}`, { replace: true }); return; }
        setCourts(a.quadras); setCheckin(b.checkin); setForm((old) => ({ ...old, quadraId: old.quadraId || b.checkin?.quadraId || '' }));
      })
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [navigate, user.id]);
  const court = courts.find((q) => q.id === form.quadraId);
  const checked = checkin?.quadraId === form.quadraId;
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!checked) { setError('Faça check-in na quadra selecionada antes de continuar.'); return; }
    if (step < 4) { setStep((s) => s + 1); return; }
    setBusy(true);
    try {
      const result = await apiFetch('/partidas', { method: 'POST', body: { ...form, apostaSimbolica: symbolic ? form.apostaSimbolica : '', ...(params.get('amigo') ? { desafiadoId: params.get('amigo') } : {}) } });
      navigate(`/partidas/${result.partida.id}`, { replace: true });
    } catch (e) {
      if (e.status === 409 && e.fields?.partidaId) navigate(`/partidas/${e.fields.partidaId}`, { replace: true });
      else setError(e.message);
    } finally { setBusy(false); }
  }
  return <section className="dashboard-page match-page">
    <Link className="back-link" to="/inicio">← Início</Link><span className="eyebrow">DO CHECK-IN À BOLA AO ALTO</span><h1>CRIAR <em>PARTIDA.</em></h1>
    <ol className="match-steps" aria-label="Etapas da criação">{['Quadra', 'Jogo', 'Regras', 'Combinado', 'Resumo'].map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className={i <= step ? 'is-current' : ''}><span>{i + 1}</span>{label}</li>)}</ol>
    {loading ? <div className="loading-page" role="status"><span className="skeleton skeleton--card" />Carregando quadras e check-in…</div> : <form className="auth-form" onSubmit={submit}>
      <article className="info-card">
        {step === 0 && <><h2>ONDE VAI SER?</h2><FormField id="match-court" label="Quadra" required><select required id="match-court" value={form.quadraId} onChange={(e) => update('quadraId', e.target.value)}><option value="">Selecione uma quadra</option>{courts.filter((q) => q.status === 'APROVADA').map((q) => <option key={q.id} value={q.id}>{q.nome} · {q.regiao}</option>)}</select></FormField>{court && <p>{court.regiao} · {court.tipo}</p>}{!checked && <StatusMessage>O check-in é manual e obrigatório. {court ? <Link to={`/quadras/${court.id}/checkin`}>Fazer check-in nesta quadra →</Link> : <Link to="/quadras">Escolher quadra →</Link>}</StatusMessage>}</>}
        {step === 1 && <><h2>ESCOLHA O JOGO</h2><fieldset className="match-options"><legend>Modalidade</legend>{modes.map((mode) => <label key={mode}><input type="radio" name="mode" checked={form.modalidade === mode} onChange={() => update('modalidade', mode)} /><strong>{mode}</strong><small>{mode === '1v1' ? 'Duelo individual' : `${mode[0]} jogadores por equipe`}</small></label>)}</fieldset></>}
        {step === 2 && <><h2>AS REGRAS DA QUADRA</h2><FormField id="match-points" label="Pontuação para vencer" hint="11, 21 ou uma pontuação personalizada de 1 a 999." required><input id="match-points" type="number" min="1" max="999" step="1" required value={form.pontuacao} onChange={(e) => update('pontuacao', e.target.value === '' ? '' : Number(e.target.value))} /></FormField><div className="match-inline"><button type="button" className="button button--secondary" onClick={() => update('pontuacao', 11)}>11 PONTOS</button><button type="button" className="button button--secondary" onClick={() => update('pontuacao', 21)}>21 PONTOS</button></div><FormField id="match-style" label="Estilo"><select id="match-style" value={form.estilo} onChange={(e) => update('estilo', e.target.value)}><option value="FIBA">FIBA</option><option value="RACHAO">Rachão</option></select></FormField></>}
        {step === 3 && <><h2>COMBINADO ENTRE JOGADORES</h2><p>Apenas um combinado simbólico em texto, como quem escolhe a música do próximo jogo.</p><label className="terms-check"><input type="checkbox" checked={symbolic} onChange={(e) => setSymbolic(e.target.checked)} /><span>Quero registrar um combinado</span></label>{symbolic && <FormField id="match-bet" label="Combinado simbólico"><textarea id="match-bet" rows="3" maxLength="300" required value={form.apostaSimbolica} onChange={(e) => update('apostaSimbolica', e.target.value)} /></FormField>}</>}
        {step === 4 && <><h2>TUDO PRONTO?</h2><dl className="match-summary"><dt>Quadra</dt><dd>{court?.nome}</dd><dt>Modalidade</dt><dd>{form.modalidade}</dd><dt>Regras</dt><dd>{form.pontuacao} pontos · {form.estilo === 'FIBA' ? 'FIBA' : 'Rachão'}</dd><dt>Combinado</dt><dd>{symbolic ? form.apostaSimbolica : 'Sem combinado'}</dd></dl><p>Você entrará automaticamente na busca mais antiga desta quadra com a mesma modalidade, pontuação, estilo e combinado. Se não houver uma, uma nova busca será criada. Ao completar {form.modalidade === '1v1' ? 2 : form.modalidade === '3v3' ? 6 : 10} jogadores buscando, a partida começa automaticamente.</p>{params.get('amigo') && <StatusMessage>Seu amigo receberá o desafio se estiver disponível nesta quadra.</StatusMessage>}</>}
      </article>
      <StatusMessage type="error">{error}</StatusMessage>
      <button className="button button--primary" disabled={busy || !checked || !form.quadraId} type="submit">{busy ? 'CRIANDO…' : step === 4 ? 'CRIAR E PROCURAR JOGADORES →' : 'CONTINUAR →'}</button>
      {step > 0 && <button className="button button--secondary" type="button" disabled={busy} onClick={() => { setStep((s) => s - 1); setError(''); }}>← VOLTAR UMA ETAPA</button>}
    </form>}
    {loading && <StatusMessage type="error">{error}</StatusMessage>}
  </section>;
}
