import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useResource } from '../hooks/useResource.js';
import { apiFetch } from '../services/api.js';
import { EmptyState, PlayerCard, ResourceState } from '../components/DataView.jsx';
import { FormField, StatusMessage } from '../components/FormField.jsx';

export function FriendsPage() {
  const { user } = useAuth();
  const resource = useResource('/amigos', 2000);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const results = useResource(search ? `/jogadores?q=${encodeURIComponent(search)}` : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function act(path, method = 'POST', body) {
    if (busy) return; setBusy(true); setError(''); setSuccess('');
    try { const result = await apiFetch(path, { method, body }); setSuccess(result.message || 'Solicitação atualizada.'); await resource.reload(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const friends = resource.data?.amigos || [];
  const incoming = resource.data?.recebidas || [];
  const outgoing = resource.data?.enviadas || [];
  const relationship = (id) => friends.some((friend) => friend.id === id) ? 'Amigo' : outgoing.some((request) => request.amigo.id === id) ? 'Solicitação enviada' : incoming.some((request) => request.jogador.id === id) ? 'Solicitação recebida' : '';
  return <section className="dashboard-page"><span className="eyebrow">SEU JOGO TEM COMPANHIA</span><h1>MINHA <em>GALERA.</em></h1><form className="search-form" onSubmit={(e) => { e.preventDefault(); setSearch(query.trim()); }}><FormField id="friend-search" label="Buscar jogadores por nome ou usuário"><input id="friend-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} minLength="2" maxLength="100" required placeholder="Quem joga com você?" /></FormField><button className="button button--secondary" disabled={!query.trim()}>BUSCAR</button></form><div className="stack section-gap"><StatusMessage type="error">{error}</StatusMessage><StatusMessage type="success">{success}</StatusMessage></div>{search && <><div className="section-heading"><h2>RESULTADO DA BUSCA</h2></div><ResourceState resource={results}><div className="stack">{!(results.data?.jogadores || []).filter((player) => player.id !== user.id).length && <EmptyState title="Nenhum jogador encontrado">Confira o nome ou busque pelo usuário.</EmptyState>}{(results.data?.jogadores || []).filter((player) => player.id !== user.id).map((player) => <PlayerCard key={player.id} jogador={player}>{relationship(player.id) ? <span className="field__hint">{relationship(player.id)}</span> : <button className="button button--primary" disabled={busy} onClick={() => act('/amigos', 'POST', { jogadorId: player.id })}>ADICIONAR</button>}</PlayerCard>)}</div></ResourceState></>}<ResourceState resource={resource}>{!!incoming.length && <><div className="section-heading"><h2>SOLICITAÇÕES · {incoming.length}</h2></div><div className="stack">{incoming.map((request) => <PlayerCard key={request.id} jogador={request.jogador}><button className="button button--primary" disabled={busy} onClick={() => act(`/amigos/${request.id}/responder`, 'POST', { aceitar: true })}>ACEITAR</button><button className="button button--secondary" disabled={busy} onClick={() => act(`/amigos/${request.id}/responder`, 'POST', { aceitar: false })}>RECUSAR</button></PlayerCard>)}</div></>}<div className="section-heading"><h2>AMIGOS · {friends.length}</h2></div><div className="stack">{!friends.length && <EmptyState title="Monte sua galera">Busque jogadores acima e envie uma solicitação de amizade.</EmptyState>}{friends.map((player) => <PlayerCard key={player.id} jogador={player}><Link className="button button--primary" to={`/partidas/nova?amigo=${player.id}`}>DESAFIAR</Link><button className="button button--secondary" disabled={busy} onClick={() => act(`/amigos/${player.id}`, 'DELETE')}>REMOVER</button></PlayerCard>)}</div>{!!outgoing.length && <><div className="section-heading"><h2>AGUARDANDO RESPOSTA</h2></div><div className="stack">{outgoing.map((request) => <PlayerCard key={request.id} jogador={request.amigo}><span className="field__hint">Solicitação enviada</span><button className="button button--secondary" disabled={busy} onClick={() => act(`/amigos/${request.id}`, 'DELETE')}>CANCELAR</button></PlayerCard>)}</div></>}</ResourceState></section>;
}
