import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiFetch } from '../services/api.js';
import { phoneMask } from '../services/masks.js';
import { useResource } from '../hooks/useResource.js';
import { Avatar, EmptyState, ResourceState, matchLabels, modalityLabels } from '../components/DataView.jsx';
import { FormField, StatusMessage } from '../components/FormField.jsx';

export function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const own = !id || id === user.id;
  const resource = useResource(own ? '/perfil' : `/jogadores/${id}`, 2000);
  const player = resource.data?.jogador;
  const ranking = useResource(player ? `/ranking?regiao=${encodeURIComponent(player.localizacao || '')}` : null);
  const stats = player?.estatistica || {};
  return <section className="dashboard-page"><span className="eyebrow">CARTEIRINHA DO JOGADOR</span><h1>{own ? 'MEU' : 'NO'} <em>PERFIL.</em></h1><ResourceState resource={resource}>{player && <><div className="profile-card"><div className="profile-head"><Avatar jogador={player} large /><div><h2>{player.nome}</h2><p>@{player.usuario}</p><span className="level-tag">NÍVEL {player.nivel ?? 1 + Math.floor((stats.xp || 0) / 100)} · {player.classificacao}</span></div></div><div className="profile-stats">{[[stats.elo ?? 1000, 'ELO'], [stats.xp ?? 0, 'XP'], [stats.vitorias ?? 0, 'VITÓRIAS'], [stats.derrotas ?? 0, 'DERROTAS']].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="progress-bar" aria-label={`${(stats.xp || 0) % 100} de 100 XP para o próximo nível`}><span style={{ width: `${(stats.xp || 0) % 100}%` }} /></div><p className="field__hint">{(stats.xp || 0) % 100} / 100 XP para o próximo nível</p><div className="profile-foot"><span>{player.localizacao || 'Região ainda não informada'}</span>{player.bio && <p>{player.bio}</p>}<div className="skill-list">{(player.habilidades || []).map((skill) => <span className="level-tag" key={skill}>{skill}</span>)}</div><div className="profile-meta"><span>{player.amigos ?? 0} amigos</span><span>{player.quadras ?? 0} quadras visitadas</span><span>Ranking: {player.ranking ? `#${player.ranking}` : 'Sem posição'}</span></div>{player.equipe && <Link to="/social">Equipe: {player.equipe.nome || player.equipe}</Link>}</div></div>{own && <Link className="button button--secondary" to="/perfil/editar">EDITAR MEU PERFIL →</Link>}<div className="section-heading"><h2>ÚLTIMAS PARTIDAS</h2></div><div className="stack">{!(player.historico || []).length && <EmptyState title="História para começar" to={own ? '/quadras' : undefined} action="Encontrar uma quadra">As partidas confirmadas aparecerão aqui.</EmptyState>}{(player.historico || []).map((match) => <Link className="info-card match-list-card" key={match.id} to={`/partidas/${match.id}/resumo`}><strong>{modalityLabels[match.modalidade] || match.modalidade} · {match.quadra?.nome}</strong><small>{matchLabels[match.status] || match.status}</small>{match.placar && <h2>{match.placar.pontosA} × {match.placar.pontosB}</h2>}</Link>)}</div><div className="section-heading"><h2>RANKING {player.localizacao ? 'DA REGIÃO' : 'GERAL'}</h2></div><p className="field__hint">Ordem por Elo, vitórias e nome de usuário. A região usa a localização informada no perfil.</p><ResourceState resource={ranking}><ol className="ranking-list">{(ranking.data?.jogadores || []).map((ranked, index) => <li key={ranked.id}><span>#{ranked.posicao || index + 1}</span><Link to={`/jogadores/${ranked.id}`}>{ranked.nome}</Link><strong>{ranked.estatistica?.elo ?? 1000}</strong></li>)}</ol>{!ranking.data?.jogadores?.length && <EmptyState title="Ranking sem jogadores">Informe a região no perfil para participar.</EmptyState>}</ResourceState></>}</ResourceState></section>;
}

const skills = ['Arremesso', 'Passe', 'Defesa', 'Drible', 'Rebote', 'Velocidade', 'Liderança', 'Enterrada'];
export function EditProfilePage() {
  const resource = useResource('/perfil');
  const { refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => { if (resource.data?.jogador && !form) { const player = resource.data.jogador; setForm({ nome: player.nome, usuario: player.usuario, telefone: phoneMask(player.telefone || ''), bio: player.bio || '', localizacao: player.localizacao || '', habilidades: player.habilidades || [], senhaAtual: '', senha: '', altura: player.altura || '' }); } }, [resource.data, form]);
  const change = (key) => (e) => setForm((old) => ({ ...old, [key]: key === 'telefone' ? phoneMask(e.target.value) : e.target.value }));
  async function save(e) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setSuccess('');
    try { const result = await apiFetch('/perfil', { method: 'PATCH', body: { ...form, altura: form.altura ? Number(form.altura) : null, senhaAtual: form.senha ? form.senhaAtual : undefined, senha: form.senha || undefined } }); if (result.requiresLogin) { await logout(); navigate('/login', { replace: true, state: { notice: 'Senha alterada. Entre novamente com a nova senha.' } }); return; } await refresh(); setSuccess(result.message || 'Perfil atualizado.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 2 * 1024 * 1024 || !['image/jpeg', 'image/png'].includes(file.type)) { setError('Escolha uma foto JPG ou PNG de até 2 MB.'); return; }
    setPhotoBusy(true); setError(''); setSuccess('');
    try { const imagem = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Não foi possível ler a foto. Escolha o arquivo novamente.')); reader.readAsDataURL(file); }); await apiFetch('/perfil/foto', { method: 'POST', body: { imagem } }); await resource.reload(); await refresh(); setSuccess('Foto atualizada.'); }
    catch (e) { setError(e.message); } finally { setPhotoBusy(false); }
  }
  return <section className="dashboard-page"><Link className="back-link" to="/perfil">← Perfil</Link><span className="eyebrow">SUA IDENTIDADE NA QUADRA</span><h1>EDITAR <em>PERFIL.</em></h1><ResourceState resource={resource}>{form && <><div className="photo-editor"><Avatar jogador={resource.data.jogador} large /><div><label htmlFor="photo" className="field__label">{photoBusy ? 'Enviando foto...' : 'Atualizar foto'}</label><input id="photo" type="file" accept="image/jpeg,image/png" disabled={photoBusy || busy} onChange={upload} /><small className="field__hint">JPG ou PNG · até 2 MB</small></div></div><form className="auth-form" onSubmit={save}>{[['nome', 'Nome completo', 160], ['usuario', 'Nome de usuário', 40], ['telefone', 'Telefone com DDD', 16], ['localizacao', 'Bairro ou região', 120]].map(([key, label, max]) => <FormField key={key} id={key} label={label} required={key !== 'localizacao'}><input id={key} type={key === 'telefone' ? 'tel' : 'text'} value={form[key]} onChange={change(key)} maxLength={max} required={key !== 'localizacao'} /></FormField>)}<FormField id="altura" label="Altura em centímetros (opcional)"><input id="altura" type="number" min="100" max="250" value={form.altura} onChange={change('altura')} /></FormField><FormField id="bio" label="Sobre você"><textarea id="bio" value={form.bio} onChange={change('bio')} maxLength="500" rows="3" /></FormField><fieldset className="skills-fieldset"><legend>Habilidades · selecione até 4</legend><div className="skill-options">{[...new Set([...skills, ...form.habilidades])].map((skill) => <label key={skill}><input type="checkbox" checked={form.habilidades.includes(skill)} disabled={!form.habilidades.includes(skill) && form.habilidades.length >= 4} onChange={(e) => setForm((old) => ({ ...old, habilidades: e.target.checked ? [...old.habilidades, skill] : old.habilidades.filter((value) => value !== skill) }))} />{skill}</label>)}</div></fieldset><details className="password-details"><summary>Alterar senha</summary><div className="stack section-gap"><FormField id="senhaAtual" label="Senha atual"><input id="senhaAtual" type="password" value={form.senhaAtual} onChange={change('senhaAtual')} autoComplete="current-password" /></FormField><FormField id="nova-senha" label="Nova senha" hint="8 ou mais caracteres, com letra e número."><input id="nova-senha" type="password" value={form.senha} onChange={change('senha')} autoComplete="new-password" minLength="8" maxLength="128" /></FormField></div></details><StatusMessage type="error">{error}</StatusMessage><StatusMessage type="success">{success}</StatusMessage><button className="button button--primary" disabled={busy || photoBusy}>{busy ? 'SALVANDO...' : 'SALVAR PERFIL →'}</button></form></>}</ResourceState></section>;
}
