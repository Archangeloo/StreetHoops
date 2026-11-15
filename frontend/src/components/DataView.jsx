import { Link } from 'react-router-dom';
import { StatusMessage } from './FormField.jsx';

export function LoadingCards() {
  return <div className="loading-page" role="status" aria-label="Carregando"><span className="skeleton skeleton--text" /><span className="skeleton skeleton--card" /><span>Carregando dados...</span></div>;
}
export function ResourceState({ resource, children }) {
  if (resource.loading) return <LoadingCards />;
  return <><StatusMessage type="error">{resource.error}</StatusMessage>{resource.error && <button className="text-button" onClick={resource.reload}>Tentar novamente</button>}{resource.data && children}</>;
}
export function EmptyState({ title, children, to, action }) {
  return <div className="empty-court"><span aria-hidden="true">⌁</span><strong>{title}</strong><p>{children}</p>{to && <Link to={to}>{action}</Link>}</div>;
}
export function Avatar({ jogador, large = false }) {
  return <div className={`avatar ${large ? 'avatar--large' : ''}`}>{jogador?.foto ? <img src={jogador.foto} alt={`Foto de ${jogador.nome}`} /> : <span aria-hidden="true">{jogador?.nome?.charAt(0) || 'SH'}</span>}</div>;
}
export function PlayerCard({ jogador, children }) {
  return <article className="player-card"><Link className="player-card__identity" to={`/jogadores/${jogador.id}`}><Avatar jogador={jogador} /><div><strong>{jogador.nome}</strong><small>@{jogador.usuario} · Elo {jogador.estatistica?.elo ?? 1000}</small>{jogador.localizacao && <small>{jogador.localizacao}</small>}</div></Link>{children && <div className="card-actions">{children}</div>}</article>;
}
export function CourtCard({ quadra }) {
  return <Link className="court-card" to={`/quadras/${quadra.id}/checkin`}><div className="court-card__top"><span className={`court-status court-status--${quadra.situacao === 'Livre' ? 'free' : quadra.situacao === 'Lotada' ? 'full' : 'busy'}`}>{quadra.situacao}</span><span>{quadra.pessoas ?? 0} na quadra</span></div><h3>{quadra.nome}</h3><p>{quadra.regiao} · {quadra.tipo}</p><small>{quadra.endereco || 'Ver informações e fazer check-in'} →</small></Link>;
}
export const matchLabels = { BUSCANDO: 'Procurando jogadores', PRONTA: 'Pronta para começar', EM_ANDAMENTO: 'Em andamento', AGUARDANDO_CONFIRMACAO: 'Aguardando confirmação', CONCLUIDA: 'Finalizada', CANCELADA: 'Cancelada' };
export const modalityLabels = { UM_VS_UM: '1v1', TRES_VS_TRES: '3v3', CINCO_VS_CINCO: '5v5' };
