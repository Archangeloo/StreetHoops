import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import { StatusMessage } from '../components/FormField.jsx';
import '../styles/matches.css';

export const matchLabels = { BUSCANDO: 'Procurando jogadores', PRONTA: 'Pronta para começar', EM_ANDAMENTO: 'Em andamento', AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação', CONCLUIDA: 'Finalizada', CANCELADA: 'Cancelada' };
export const modeLabels = { UM_VS_UM: '1v1', TRES_VS_TRES: '3v3', CINCO_VS_CINCO: '5v5' };
export function useMatch(id) {
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setMatch(null); setError(''); setLoading(true);
    const abort = new AbortController();
    let timer;
    async function load() {
      try { const r = await apiFetch(`/partidas/${id}`, { signal: abort.signal }); if (active) { setMatch(r.partida); setError(''); } }
      catch (e) { if (active && e.name !== 'AbortError') setError(e.message); }
      finally { if (active) { setLoading(false); timer = setTimeout(load, 2000); } }
    }
    load();
    return () => { active = false; abort.abort(); clearTimeout(timer); };
  }, [id]);
  return { match, setMatch, error, loading };
}
export function MatchTeams({ match }) {
  return <div className="match-teams">{['A', 'B'].map((team) => <article className="info-card" key={team}><h2>EQUIPE {team}</h2>{match.vagas.filter((v) => v.equipe === team).map((v) => <Link className="match-player" key={v.id} to={`/jogadores/${v.jogadorId}`}><span className="avatar">{v.jogador.foto ? <img src={v.jogador.foto} alt="" /> : v.jogador.nome.charAt(0)}</span><span>{v.jogador.nome}<small>Nível {1 + Math.floor((v.jogador.estatistica?.xp || 0) / 100)}{v.jogador.altura ? ` · ${v.jogador.altura} cm` : ''}</small></span></Link>)}</article>)}</div>;
}
export function MatchPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { match, setMatch, error, loading } = useMatch(id);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const participant = Boolean(match?.vagas.some((v) => v.jogadorId === user.id && v.status === 'PREENCHIDA'));
  useEffect(() => {
    if (match?.id !== id || match.status !== 'BUSCANDO' || participant) return;
    let active = true;
    const abort = new AbortController();
    apiFetch(`/partidas/${id}/entrar`, { method: 'POST', body: {}, signal: abort.signal })
      .then((r) => { if (active) { setMatch(r.partida); setActionError(''); } })
      .catch((e) => { if (active && e.name !== 'AbortError') setActionError(e.message); });
    return () => { active = false; abort.abort(); };
  }, [id, match?.id, match?.status, participant]);
  useEffect(() => {
    let active = true; let timer; const abort = new AbortController();
    async function poll() {
      try { const r = await apiFetch('/convites', { signal: abort.signal }); if (active) setInvitations(r.convites); }
      catch (e) { if (active && e.name !== 'AbortError') setActionError(e.message); }
      finally { if (active) timer = setTimeout(poll, 2000); }
    }
    poll(); return () => { active = false; abort.abort(); clearTimeout(timer); };
  }, [id]);
  async function action(path, body = {}) {
    if (busy) return; setBusy(true); setActionError('');
    try { const r = await apiFetch(path, { method: 'POST', body }); if (r.partida.id === id) setMatch(r.partida); setConfirmCancel(false); if (path.startsWith('/convites/')) { setInvitations([]); if (body.aceitar) navigate(`/partidas/${r.partida.id}`); } }
    catch (e) { setActionError(e.message); } finally { setBusy(false); }
  }
  const owner = match?.criadorId === user.id;
  const filled = match?.vagas.filter((v) => v.status === 'PREENCHIDA') || [];
  return <section className="dashboard-page match-page"><Link className="back-link" to="/inicio">← Início</Link><span className="eyebrow">A QUADRA ESTÁ CHAMANDO</span><h1>SUA <em>PARTIDA.</em></h1>
    <StatusMessage type="error">{error || actionError}</StatusMessage>
    {loading && <div role="status"><span className="skeleton skeleton--card" />Carregando partida…</div>}
    {match && <><article className="info-card"><span className="level-tag">{matchLabels[match.status]}</span><h2>{match.quadra.nome}</h2><p>{modeLabels[match.modalidade]} · {match.pontuacao} pontos · {match.estilo === 'FIBA' ? 'FIBA' : 'Rachão'}</p>{match.apostaSimbolica && <p>Combinado: {match.apostaSimbolica}</p>}<p>{filled.length} de {match.vagas.length} jogadores</p></article>
      {match.status === 'BUSCANDO' && <><div className="match-radar" role="img" aria-label="Busca de jogadores em andamento"><span>🏀</span></div><h2 className="match-center">PROCURANDO NA QUADRA</h2><p className="auth-intro">Sem limite de tempo. A busca continua enquanto você aguarda novos jogadores com check-in.</p><div className="info-card"><h2>JOGADORES CONFIRMADOS</h2>{filled.map((v) => <div className="match-player" key={v.id}><span className="avatar">{v.jogador.nome.charAt(0)}</span><span>{v.jogador.nome}<small>Nível {1 + Math.floor((v.jogador.estatistica?.xp || 0) / 100)}{v.jogador.altura ? ` · ${v.jogador.altura} cm` : ''}</small></span></div>)}</div></>}
      {invitations.filter((c) => c.vaga.partidaId === id || (owner && match.status === 'BUSCANDO' && filled.length === 1)).map((c) => <article className="info-card" key={c.id}><h2>VOCÊ FOI CONVIDADO!</h2><p>{c.vaga.partida.criador.nome} quer jogar com você. {modeLabels[c.vaga.partida.modalidade]} · {c.vaga.partida.pontuacao} pontos · {c.vaga.partida.estilo === 'FIBA' ? 'FIBA' : 'Rachão'}.</p>{c.vaga.partidaId !== id && <p>Ao aceitar, sua busca atual será cancelada e você entrará nesta partida.</p>}<div className="match-inline"><button className="button button--primary" disabled={busy} onClick={() => action(`/convites/${c.id}/responder`, { aceitar: true })}>ACEITAR</button><button className="button button--secondary" disabled={busy} onClick={() => action(`/convites/${c.id}/responder`, { aceitar: false })}>RECUSAR</button></div></article>)}
      {!['BUSCANDO', 'CANCELADA'].includes(match.status) && <MatchTeams match={match} />}
      {match.status === 'PRONTA' && (owner ? <button className="button button--primary" disabled={busy} onClick={() => action(`/partidas/${id}/iniciar`)}>COMEÇAR PARTIDA →</button> : <StatusMessage>Aguardando {match.criador.nome} começar a partida.</StatusMessage>)}
      {['EM_ANDAMENTO', 'AGUARDANDO_CONFIRMACAO', 'CONCLUIDA'].includes(match.status) && <Link className="button button--primary" to={`/partidas/${id}/resumo`}>{match.status === 'EM_ANDAMENTO' ? 'REGISTRAR PLACAR →' : 'VER RESUMO E PLACAR →'}</Link>}
      {owner && ['BUSCANDO', 'PRONTA'].includes(match.status) && (confirmCancel ? <div className="info-card" role="alertdialog" aria-labelledby="cancel-title" aria-describedby="cancel-description"><h2 id="cancel-title">CANCELAR PARTIDA?</h2><p id="cancel-description">Os convites pendentes serão cancelados e todos os jogadores serão liberados.</p><button className="button button--secondary" disabled={busy} onClick={() => action(`/partidas/${id}/cancelar`)}>SIM, CANCELAR</button><button className="button button--primary" disabled={busy} onClick={() => setConfirmCancel(false)}>CONTINUAR BUSCA</button></div> : <button className="button button--secondary" disabled={busy} onClick={() => setConfirmCancel(true)}>CANCELAR BUSCA</button>)}
      {match.status === 'CANCELADA' && <><StatusMessage>Esta partida foi cancelada.</StatusMessage><Link className="button button--primary" to="/partidas/nova">CRIAR OUTRA PARTIDA →</Link></>}
    </>}
  </section>;
}
