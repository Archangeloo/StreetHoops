import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo.jsx';

export function WelcomePage() {
  return (
    <section className="welcome-page">
      <div className="particle particle--one" aria-hidden="true">◌</div>
      <div className="particle particle--two" aria-hidden="true">◌</div>
      <div className="particle particle--three" aria-hidden="true">◌</div>
      <div className="welcome-hero">
        <Logo large />
        <p className="eyebrow">SEU JOGO COMEÇA AQUI</p>
        <h1>DOMINE <span>A QUADRA.</span></h1>
        <p className="welcome-description">Encontre sua galera, desafie jogadores e faça história nas quadras da sua região.</p>
      </div>
      <div className="welcome-actions">
        <Link className="button button--primary button--pulse" to="/cadastro">CRIAR MINHA CONTA</Link>
        <Link className="button button--secondary" to="/login">JÁ TENHO CONTA</Link>
        <p className="small-note">Do primeiro check-in à última cesta. Sua comunidade começa aqui.</p>
      </div>
    </section>
  );
}
