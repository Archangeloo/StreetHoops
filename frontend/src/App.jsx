import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from './layouts/AppShell.jsx';
import { WelcomePage } from './pages/WelcomePage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RecoveryPage } from './pages/RecoveryPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ProfilePage, EditProfilePage } from './pages/ProfilePage.jsx';
import { CourtsPage, NewCourtPage, CheckinPage } from './pages/CourtsPages.jsx';
import { FriendsPage } from './pages/FriendsPage.jsx';
import { TeamsPage } from './pages/TeamsPage.jsx';
import { MatchCreatePage } from './pages/MatchCreatePage.jsx';
import { MatchPage } from './pages/MatchPage.jsx';
import { ScorePage } from './pages/ScorePage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { routeDefinitions } from './routes/routeDefinitions.js';

function AuthLoading() {
  return <AppShell guest><div className="loading-page" role="status" aria-live="polite"><span className="skeleton skeleton--title" /><span className="skeleton skeleton--text" /><span className="skeleton skeleton--card" /><span>Verificando sua sessão...</span></div></AppShell>;
}
function Screen({ screen }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (screen.guest && user) return <Navigate to="/inicio" replace />;
  if (!screen.guest && !user) return <Navigate to="/login" state={{ from: location }} replace />;
  const pages = { T01: WelcomePage, T02: RegisterPage, T03: LoginPage, T04: RecoveryPage, T05: HomePage,
    T06: CourtsPage, T07: NewCourtPage, T08: CheckinPage, T09: MatchCreatePage, T10: MatchPage, T11: ScorePage,
    T12: ProfilePage, T13: EditProfilePage, T14: FriendsPage, T15: TeamsPage };
  const Page = pages[screen.code];
  return <AppShell guest={screen.guest}><Page /></AppShell>;
}
function TermsRoute() {
  const { loading } = useAuth();
  return loading ? <AuthLoading /> : <AppShell guest><TermsPage /></AppShell>;
}
export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    {routeDefinitions.map((screen) => <Route path={screen.path} element={<Screen screen={screen} />} key={screen.code} />)}
    <Route path="/termos" element={<TermsRoute />} />
    <Route path="/jogadores/:id" element={<Screen screen={{ code: 'T12', guest: false }} />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}
