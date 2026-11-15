import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../services/api.js';
import { useResource } from '../hooks/useResource.js';
import { CourtCard, EmptyState, ResourceState } from '../components/DataView.jsx';
import { FormField, StatusMessage } from '../components/FormField.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const hasCoordinates = (court) => Number.isFinite(court?.latitude) && Number.isFinite(court?.longitude);
function distance(position, court) {
  if (!position || !hasCoordinates(court)) return Infinity;
  const rad = Math.PI / 180;
  const lat = (court.latitude - position.latitude) * rad;
  const lon = (court.longitude - position.longitude) * rad;
  const a = Math.sin(lat / 2) ** 2 + Math.cos(position.latitude * rad) * Math.cos(court.latitude * rad) * Math.sin(lon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function CourtsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState('lista');
  const [position, setPosition] = useState(null);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const resource = useResource('/quadras', 2000);
  const moderator = ['MODERADOR', 'ADMINISTRADOR'].includes(user.papel);
  const moderation = useResource(moderator ? '/quadras/pendentes' : null, 2000);
  const [moderationBusy, setModerationBusy] = useState(false);
  const [moderationError, setModerationError] = useState('');
  const [moderationNotice, setModerationNotice] = useState('');
  async function moderate(id, status) {
    if (moderationBusy) return;
    setModerationBusy(true); setModerationError(''); setModerationNotice('');
    try { const result = await apiFetch(`/quadras/${id}/moderacao`, { method: 'PATCH', body: { status } }); setModerationNotice(result.message); await moderation.reload(); await resource.reload(); }
    catch (e) { setModerationError(e.message); } finally { setModerationBusy(false); }
  }
  const courts = resource.data?.quadras || [];
  const regions = [...new Set(courts.map((court) => court.regiao))].sort();
  const filtered = useMemo(() => courts.filter((court) => (!query || `${court.nome} ${court.regiao}`.toLowerCase().includes(query.toLowerCase())) && (!region || court.regiao === region) && (!status || court.situacao === status)).sort((a, b) => position ? distance(position, a) - distance(position, b) : a.nome.localeCompare(b.nome)), [courts, query, region, status, position]);
  const mapped = filtered.filter(hasCoordinates);
  const selected = mapped.find((court) => court.id === selectedId) || mapped[0];
  const locate = () => {
    setGpsError('');
    if (!window.isSecureContext) { setGpsError('Para usar a localização, abra o app em localhost ou em um endereço HTTPS. Você pode continuar usando os filtros.'); return; }
    if (!navigator.geolocation) { setGpsError('Este navegador não oferece localização. Use os filtros por região.'); return; }
    setGpsBusy(true);
    navigator.geolocation.getCurrentPosition(({ coords }) => { setPosition({ latitude: coords.latitude, longitude: coords.longitude }); setGpsBusy(false); }, (error) => { setGpsError(error.code === 1 ? 'Acesso à localização negado. Permita o acesso nas configurações do navegador ou use os filtros.' : error.code === 3 ? 'A localização demorou para responder. Tente novamente ou use os filtros.' : 'Localização indisponível. Confira se o serviço de localização do dispositivo está ativo ou use os filtros.'); setGpsBusy(false); }, { timeout: 10000, maximumAge: 60000 });
  };
  return <section className="dashboard-page"><span className="eyebrow">SEU PONTO DE ENCONTRO</span><h1>ENCONTRE SUA <em>QUADRA.</em></h1><div className="stack"><Link to="/quadras/nova" className="button button--secondary">+ CADASTRAR QUADRA</Link><FormField id="court-search" label="Buscar por nome ou região"><input id="court-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Onde vamos jogar?" type="search" /></FormField><div className="form-grid"><FormField id="court-region" label="Região"><select id="court-region" value={region} onChange={(e) => setRegion(e.target.value)}><option value="">Todas</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></FormField><FormField id="court-status" label="Situação"><select id="court-status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todas</option>{['Livre', 'Ocupada', 'Lotada'].map((value) => <option key={value}>{value}</option>)}</select></FormField></div><div className="segmented" role="group" aria-label="Visualização de quadras">{['lista', 'mapa'].map((value) => <button key={value} aria-pressed={mode === value} className={mode === value ? 'is-selected' : ''} onClick={() => setMode(value)}>{value.toUpperCase()}</button>)}</div><button className="button button--secondary" disabled={gpsBusy} onClick={locate}>{gpsBusy ? 'LOCALIZANDO...' : position ? 'ATUALIZAR MINHA LOCALIZAÇÃO' : 'QUADRAS PERTO DE MIM'}</button><p className="field__hint">Localização opcional, consultada apenas ao tocar no botão. O check-in continua manual.</p><StatusMessage type="error">{gpsError}</StatusMessage>{position && <StatusMessage type="success">Quadras com coordenadas ordenadas pela distância aproximada.</StatusMessage>}</div><ResourceState resource={resource}>{!!resource.data?.minhas?.length && <div className="stack section-gap"><h2>MINHAS INDICAÇÕES</h2>{resource.data.minhas.map((court) => <article className="info-card" key={court.id}><h3>{court.nome}</h3><span className="field__hint">{court.status === 'PENDENTE' ? 'Aguardando análise da moderação' : 'Indicação não aprovada'}</span></article>)}</div>}{moderator && <div className="stack section-gap"><h2>MODERAÇÃO DE QUADRAS</h2><StatusMessage type="error">{moderationError}</StatusMessage><StatusMessage type="success">{moderationNotice}</StatusMessage><ResourceState resource={moderation}>{!moderation.data?.quadras?.length && <p className="field__hint">Nenhuma quadra pendente.</p>}{(moderation.data?.quadras || []).map((court) => <article className="info-card" key={court.id}><h3>{court.nome}</h3><p>{court.regiao} · {court.endereco}</p><div className="card-actions"><button className="button button--primary" disabled={moderationBusy} onClick={() => moderate(court.id, 'APROVADA')}>APROVAR</button><button className="button button--secondary" disabled={moderationBusy} onClick={() => moderate(court.id, 'REJEITADA')}>REJEITAR</button></div></article>)}</ResourceState></div>}<div className="stack section-gap">{resource.data?.checkin && <StatusMessage>Você está em {resource.data.checkin.quadra?.nome}. <Link to={`/quadras/${resource.data.checkin.quadraId}/checkin`}>Gerenciar check-in →</Link></StatusMessage>}{!filtered.length && <EmptyState title="Nenhuma quadra encontrada" to="/quadras/nova" action="Cadastrar uma quadra">Altere os filtros ou indique uma quadra para análise.</EmptyState>}{mode === 'mapa' && (selected ? <div className="stack"><FormField id="map-court" label="Quadra no mapa"><select id="map-court" value={selected.id} onChange={(e) => setSelectedId(e.target.value)}>{mapped.map((court) => <option key={court.id} value={court.id}>{court.nome}</option>)}</select></FormField><iframe className="court-map" title={`Localização de ${selected.nome}`} loading="lazy" referrerPolicy="no-referrer" src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.longitude - .008}%2C${selected.latitude - .008}%2C${selected.longitude + .008}%2C${selected.latitude + .008}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`} /><a className="text-button" href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=17/${selected.latitude}/${selected.longitude}`} target="_blank" rel="noreferrer">Abrir mapa ampliado ↗</a><p className="field__hint">Somente quadras com coordenadas cadastradas aparecem no mapa. Todas permanecem na lista.</p></div> : <EmptyState title="Sem coordenadas disponíveis">As quadras encontradas podem ser acessadas na lista abaixo.</EmptyState>)}{filtered.map((court) => <div key={court.id}><CourtCard quadra={court} />{position && hasCoordinates(court) && <small className="distance-label">Aproximadamente {distance(position, court).toFixed(1)} km em linha reta</small>}</div>)}</div></ResourceState></section>;
}

export function NewCourtPage() {
  const [form, setForm] = useState({ nome: '', regiao: '', endereco: '', tipo: 'Pública', piso: 'Bom', condicaoTabela: 'Boa', capacidade: '', latitude: '', longitude: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const change = (key) => (e) => setForm((old) => ({ ...old, [key]: e.target.value }));
  async function submit(e) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try { const result = await apiFetch('/quadras', { method: 'POST', body: { ...form, capacidade: form.capacidade ? Number(form.capacidade) : undefined, latitude: form.latitude ? Number(form.latitude) : undefined, longitude: form.longitude ? Number(form.longitude) : undefined } }); setSuccess(result.message || 'Quadra enviada para análise da moderação.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="dashboard-page"><Link className="back-link" to="/quadras">← Quadras</Link><span className="eyebrow">FORTALEÇA A COMUNIDADE</span><h1>NOVA <em>QUADRA.</em></h1>{success ? <div className="stack"><StatusMessage type="success">{success}</StatusMessage><Link className="button button--primary" to="/quadras">VOLTAR ÀS QUADRAS</Link></div> : <form className="auth-form" onSubmit={submit}><p className="field__hint">A quadra ficará pendente até a aprovação de um moderador.</p>{[['nome', 'Nome da quadra', 160], ['regiao', 'Bairro ou região', 120], ['endereco', 'Endereço', 300]].map(([id, label, max]) => <FormField key={id} id={id} label={label} required={id !== 'endereco'}><input id={id} value={form[id]} onChange={change(id)} maxLength={max} required={id !== 'endereco'} /></FormField>)}{[['tipo', 'Tipo', ['Pública', 'Privada', 'Coberta', 'Aberta']], ['piso', 'Condição do piso', ['Bom', 'Regular', 'Ruim']], ['condicaoTabela', 'Condição da tabela', ['Boa', 'Regular', 'Ruim']]].map(([id, label, options]) => <FormField key={id} id={id} label={label}><select id={id} value={form[id]} onChange={change(id)}>{options.map((value) => <option key={value}>{value}</option>)}</select></FormField>)}<FormField id="capacidade" label="Capacidade de pessoas (opcional)"><input id="capacidade" type="number" min="1" max="500" value={form.capacidade} onChange={change('capacidade')} /></FormField><p className="field__hint">Coordenadas opcionais permitem mostrar a quadra no mapa. Informe as duas ou deixe ambas vazias.</p><div className="form-grid">{[['latitude', 'Latitude', -90, 90], ['longitude', 'Longitude', -180, 180]].map(([id, label, min, max]) => <FormField key={id} id={id} label={label}><input id={id} type="number" step="any" min={min} max={max} value={form[id]} onChange={change(id)} /></FormField>)}</div><StatusMessage type="error">{error}</StatusMessage><button className="button button--primary" disabled={busy}>{busy ? 'ENVIANDO...' : 'ENVIAR PARA ANÁLISE →'}</button></form>}</section>;
}

export function CheckinPage() {
  const { id } = useParams();
  const resource = useResource(`/quadras/${id}`, 2000);
  const navigate = useNavigate();
  const [people, setPeople] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const court = resource.data?.quadra;
  const current = resource.data?.checkin;
  const checked = current?.quadraId === id;
  useEffect(() => { setPeople(current?.quadraId === id ? current.pessoas : 1); }, [current?.id, id]);
  async function act(checkout) {
    if (busy) return; setBusy(true); setError(''); setSuccess('');
    try { const result = await apiFetch(checkout ? '/checkin' : `/quadras/${id}/checkin`, { method: checkout ? 'DELETE' : 'POST', body: checkout ? undefined : { pessoas: people } }); setSuccess(result.message || (checkout ? 'Você saiu da quadra.' : 'Check-in realizado.')); await resource.reload(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="dashboard-page"><Link className="back-link" to="/quadras">← Quadras</Link><span className="eyebrow">PRESENÇA NA QUADRA</span><h1>FAÇA <em>CHECK-IN.</em></h1><ResourceState resource={resource}>{court && <div className="stack"><CourtCard quadra={court} /><div className="info-card"><h2>CONDIÇÕES DA QUADRA</h2><p>Piso: {court.piso} · Tabela: {court.condicaoTabela}</p><p>{court.endereco || court.regiao}</p></div><StatusMessage type="error">{error}</StatusMessage><StatusMessage type="success">{success}</StatusMessage>{checked ? <><StatusMessage type="success">Você está nesta quadra com {current.pessoas} pessoa(s).</StatusMessage><label className="field__label" htmlFor="current-people">Atualizar pessoas com você</label><div className="counter"><button aria-label="Diminuir pessoas" disabled={people <= 1 || busy} onClick={() => setPeople((p) => p - 1)}>−</button><input id="current-people" type="number" min="1" max="500" value={people} onChange={(e) => setPeople(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} /><button aria-label="Aumentar pessoas" disabled={people >= 500 || busy} onClick={() => setPeople((p) => p + 1)}>+</button></div><button className="button button--secondary" disabled={busy || people === current.pessoas} onClick={() => act(false)}>ATUALIZAR QUANTIDADE</button><button className="button button--primary button--pulse" onClick={() => navigate('/partidas/nova')}>ENCONTRAR PARTIDA →</button><button className="button button--secondary" disabled={busy} onClick={() => act(true)}>{busy ? 'SAINDO...' : 'SAIR DA QUADRA'}</button></> : <>{current && <StatusMessage>Você está em outra quadra. Este check-in encerrará o anterior.</StatusMessage>}<label className="field__label" htmlFor="people-count">Quantas pessoas estão com você, contando você?</label><div className="counter"><button aria-label="Diminuir pessoas" disabled={people <= 1 || busy} onClick={() => setPeople((p) => p - 1)}>−</button><input id="people-count" type="number" min="1" max="500" value={people} onChange={(e) => setPeople(Math.max(1, Math.min(500, Number(e.target.value) || 1)))} /><button aria-label="Aumentar pessoas" disabled={people >= 500 || busy} onClick={() => setPeople((p) => p + 1)}>+</button></div><p className="field__hint">Confirme somente quando estiver na quadra. Nenhuma localização é exigida.</p><button className="button button--primary" disabled={busy} onClick={() => act(false)}>{busy ? 'CONFIRMANDO...' : 'ESTOU AQUI · FAZER CHECK-IN'}</button></>}</div>}</ResourceState></section>;
}
