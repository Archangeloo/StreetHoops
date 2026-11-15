import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import { FormField, StatusMessage } from '../components/FormField.jsx';
import { MatchTeams, matchLabels, useMatch } from './MatchPage.jsx';

export function ScorePage() {
  const { id } = useParams();
  const { user, refresh } = useAuth();
  const { match, setMatch, loading, error } = useMatch(id);
  const [points, setPoints] = useState({ pontosA: '', pontosB: '' });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { if (match?.placar) setPoints({ pontosA: match.placar.pontosA, pontosB: match.placar.pontosB }); }, [match?.placar?.registradoEm]);
  useEffect(() => { if (match?.status === 'CONCLUIDA') refresh().catch(() => {}); }, [match?.status, refresh]);
  const mine = match?.vagas.find((v) => v.jogadorId === user.id);
  const score = match?.placar;
  const author = match?.vagas.find((v) => v.jogadorId === score?.registradoPorId);
  const canSubmit = mine && (match.status === 'EM_ANDAMENTO' || (score?.status === 'CONTESTADO' && score.registradoPorId === user.id));
  const canRespond = mine && score?.status === 'PENDENTE' && mine.equipe !== author?.equipe;
  async function action(path, body) {
    if (busy) return; setBusy(true); setActionError(''); setNotice('');
    try { const r = await apiFetch(path, { method: 'POST', body }); setMatch(r.partida); setNotice(r.partida.status === 'CONCLUIDA' ? 'Resultado confirmado. XP e Elo atualizados!' : r.partida.placar.status === 'CONTESTADO' ? 'Resultado contestado. Aguardando correção.' : 'Placar enviado para confirmação.'); }
    catch (e) { setActionError(e.message); } finally { setBusy(false); }
  }
  const won = match?.status === 'CONCLUIDA' && mine?.equipe === (score.pontosA > score.pontosB ? 'A' : 'B');
  return <section className="dashboard-page match-page"><Link className="back-link" to={`/partidas/${id}`}>← Partida</Link><span className="eyebrow">O JOGO SÓ FECHA COM OS DOIS LADOS</span><h1>RESUMO <em>E PLACAR.</em></h1><StatusMessage type="error">{error || actionError}</StatusMessage><StatusMessage type="success">{notice}</StatusMessage>
    {loading && <div role="status"><span className="skeleton skeleton--card" />Carregando placar…</div>}
    {match && <><p className="auth-intro">{match.quadra.nome} · {matchLabels[match.status]}</p>
      {score && <article className="score-card match-score"><span>EQUIPE A</span><strong>{score.pontosA} <em>×</em> {score.pontosB}</strong><span>EQUIPE B</span></article>}
      {canSubmit && <form className="auth-form info-card" onSubmit={(e) => { e.preventDefault(); action(`/partidas/${id}/placar`, { pontosA: Number(points.pontosA), pontosB: Number(points.pontosB) }); }}><h2>{score ? 'CORRIGIR RESULTADO' : 'COMO FOI O JOGO?'}</h2><div className="match-inline">{['A', 'B'].map((team) => <FormField key={team} id={`score-${team}`} label={`Equipe ${team}`} required><input id={`score-${team}`} required min="0" max="999" type="number" step="1" value={points[`pontos${team}`]} onChange={(e) => setPoints((old) => ({ ...old, [`pontos${team}`]: e.target.value }))} /></FormField>)}</div><p>Sem empate. As estatísticas mudam apenas após confirmação da outra equipe.</p><button className="button button--primary" disabled={busy}>{busy ? 'ENVIANDO…' : score ? 'CORRIGIR E REENVIAR →' : 'ENVIAR PLACAR →'}</button></form>}
      {score?.status === 'PENDENTE' && <><StatusMessage>{canRespond ? 'Confira o placar informado pela outra equipe.' : `Aguardando confirmação de ${match.vagas.filter((v) => v.equipe !== author?.equipe).map((v) => v.jogador.nome.split(' ')[0]).join(' ou ')}…`}</StatusMessage>{canRespond && <div className="auth-form"><button className="button button--primary" disabled={busy} onClick={() => action(`/partidas/${id}/placar/responder`, { aceitar: true })}>CONFIRMAR RESULTADO</button><button className="button button--secondary" disabled={busy} onClick={() => action(`/partidas/${id}/placar/responder`, { aceitar: false })}>DISCORDO DO PLACAR</button></div>}</>}
      {score?.status === 'CONTESTADO' && <StatusMessage>Placar contestado. {score.registradoPorId === user.id ? 'Corrija os pontos e envie novamente.' : `Aguardando ${author?.jogador.nome} corrigir e reenviar.`} Nenhum XP ou Elo foi alterado.</StatusMessage>}
      {score?.status === 'CONFIRMADO' && <article className="info-card match-reward"><h2>CONFIRMADO POR AMBOS</h2>{mine ? <><p>{won ? 'Vitória na conta!' : 'Cada jogo conta para a evolução.'}</p><strong>+{won ? 80 : 30} XP</strong><span>{won ? '+25' : '−15'} ELO</span><Link className="button button--secondary" to="/perfil">VER MEU PERFIL →</Link></> : <p>Resultado finalizado e estatísticas dos participantes atualizadas.</p>}</article>}
      {!score && !canSubmit && <StatusMessage>O placar poderá ser registrado pelos participantes depois do início da partida.</StatusMessage>}
      {!['BUSCANDO', 'CANCELADA'].includes(match.status) && <MatchTeams match={match} />}
    </>}
  </section>;
}
