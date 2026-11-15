import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useResource } from '../hooks/useResource.js';
import { apiFetch } from '../services/api.js';
import { StatusMessage } from './FormField.jsx';
import { modalityLabels } from './DataView.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Notifications() {
  const { user } = useAuth();
  const matches = useResource('/convites', 2000);
  const games = useResource('/partidas', 2000);
  const friends = useResource('/amigos', 2000);
  const teams = useResource('/equipes', 2000);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();
  const invitations = matches.data?.convites || [];
  const friendCount = friends.data?.recebidas?.length || 0;
  const teamCount = teams.data?.convites?.length || 0;
  const pendingScores = (games.data?.partidas || []).filter((match) => {
    if (!match.placar) return false;
    if (match.placar.status === 'CONTESTADO') return match.placar.registradoPorId === user.id;
    const ownTeam = match.vagas?.find((slot) => slot.jogadorId === user.id)?.equipe;
    const authorTeam = match.vagas?.find((slot) => slot.jogadorId === match.placar.registradoPorId)?.equipe;
    return match.placar.status === 'PENDENTE' && ownTeam && authorTeam && ownTeam !== authorTeam;
  });
  const count = invitations.length + friendCount + teamCount + pendingScores.length;
  async function respond(id, aceitar) {
    if (busy) return; setBusy(true); setError(''); setNotice('');
    try { const result = await apiFetch(`/convites/${id}/responder`, { method: 'POST', body: { aceitar } }); await matches.reload(); if (aceitar) { setOpen(false); navigate(`/partidas/${result.partida.id}`); } else setNotice('Convite recusado.'); }
    catch (e) { setError(e.message); await matches.reload(); } finally { setBusy(false); }
  }
  return <div className="notifications"><button className="notifications__toggle" aria-expanded={open} aria-controls="notifications-panel" onClick={() => setOpen((value) => !value)} aria-label={`Notificações: ${count} pendentes`}><span aria-hidden="true">♧</span> {count > 0 && <span className="notification-count">{count}</span>}</button>{open && <section id="notifications-panel" className="notifications__panel" aria-label="Notificações"><div className="section-heading"><h2>CONVITES</h2><button className="text-button" onClick={() => setOpen(false)}>Fechar</button></div><StatusMessage type="error">{error || matches.error || friends.error || teams.error || games.error}</StatusMessage><StatusMessage type="success">{notice}</StatusMessage>{!count && <p className="field__hint">{matches.loading ? 'Carregando...' : 'Nenhum convite pendente.'}</p>}{friendCount > 0 && <Link className="notification-link" to="/amigos" onClick={() => setOpen(false)}>{friendCount} solicitação(ões) de amizade →</Link>}{teamCount > 0 && <Link className="notification-link" to="/social" onClick={() => setOpen(false)}>{teamCount} convite(s) para equipe →</Link>}{pendingScores.map((match) => <Link key={match.id} className="notification-link" to={`/partidas/${match.id}/resumo`} onClick={() => setOpen(false)}>{match.placar.status === 'CONTESTADO' ? 'Corrigir placar contestado' : 'Confirmar placar'} · {match.quadra?.nome} →</Link>)}{invitations.map((invite) => { const match = invite.vaga?.partida; return <article className="invite-card" key={invite.id}><span className="eyebrow">DESAFIO NA QUADRA</span><h3>{modalityLabels[match?.modalidade] || match?.modalidade} · {match?.quadra?.nome}</h3><p>{match?.criador?.nome} está procurando jogadores.</p><Link className="text-button" to={`/partidas/${match?.id}`} onClick={() => setOpen(false)}>Ver regras e jogadores →</Link><div className="card-actions"><button className="button button--primary" disabled={busy} onClick={() => respond(invite.id, true)}>ACEITAR</button><button className="button button--secondary" disabled={busy} onClick={() => respond(invite.id, false)}>RECUSAR</button></div></article>; })}</section>}</div>;
}
