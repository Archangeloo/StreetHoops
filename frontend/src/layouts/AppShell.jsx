import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Logo } from '../components/Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Notifications } from '../components/Notifications.jsx';

const navigation = [
  ['Início', '/inicio', '⌂'], ['Quadras', '/quadras', '▦'], ['Amigos', '/amigos', '♧'],
  ['Equipe', '/social', '♜'], ['Perfil', '/perfil', '◉'],
];

export function AppShell({ children, guest }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const onLogout = async () => {
    if (leaving) return;
    setLeaving(true);
    setLogoutError('');
    try { await logout(); navigate('/', { replace: true }); }
    catch { setLogoutError('Não foi possível sair agora. Confira sua conexão e tente novamente.'); }
    finally { setLeaving(false); }
  };
  return (
    <main className="phone-shell">
      <div className="court-lines" aria-hidden="true" />
      <header className="app-header">
        <NavLink to={user ? '/inicio' : '/'} aria-label="Ir para início do Street Hoops"><Logo /></NavLink>
        <span className="app-header__label">STREET <strong>HOOPS</strong></span>
        {user && !guest ? <><Notifications /><button type="button" className="header-logout" onClick={onLogout} disabled={leaving} aria-label="Sair da conta">{leaving ? 'SAINDO' : 'SAIR ↗'}</button></> : <span className="phase-label">STREETBALL</span>}
      </header>
      {logoutError && <div className="form-message form-message--error" role="alert">{logoutError}</div>}
      <div className={`screen ${!guest ? 'screen--signed' : ''}`} key={location.pathname}>{children}</div>
      {!guest && <nav className="bottom-nav" aria-label="Navegação principal">
        {navigation.map(([label, href, glyph]) => <NavLink to={href} key={href} className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}><span className="bottom-nav__icon" aria-hidden="true">{glyph}</span><span>{label}</span></NavLink>)}
      </nav>}
    </main>
  );
}
