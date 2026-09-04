import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './lib/supabase.js';
import { api } from './lib/api.js';
import Spinner from './components/Spinner.jsx';

import Landing    from './pages/Landing.jsx';
import Login      from './pages/Login.jsx';
import Signup     from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import Project    from './pages/Project.jsx';
import Settings   from './pages/Settings.jsx';
import Pricing    from './pages/Pricing.jsx';
import NotFound   from './pages/NotFound.jsx';
import { AboutLoop, Guidelines } from './pages/InfoPages.jsx';
import { Analytics, Deployments, Logs, Domains, EnvironmentVariables, Integrations, Team, Notifications, Activity, Security, Developer, Billing } from './pages/FeaturePages.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function syncProfile(nextSession) {
      if (!nextSession) {
        if (mounted) setProfile(null);
        return;
      }

      const name = nextSession.user?.user_metadata?.name || null;
      try {
        const p = await api.post('/auth/sync-user', { name });
        if (mounted) setProfile(p);
      } catch (error) {
        if (error?.status === 401) return;
        // Existing accounts may already be synced; keep profile loading resilient.
        try {
          const p = await api.get('/auth/me');
          if (mounted) setProfile(p);
        } catch {}
      }
    }

    function scheduleProfileSync(nextSession) {
      // Defer work started by onAuthStateChange so it does not re-enter the
      // auth lock while the event is being delivered.
      if (!nextSession) {
        setProfile(null);
        return;
      }
      setTimeout(() => { if (mounted) syncProfile(nextSession); }, 0);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      scheduleProfileSync(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setSession(session);
      scheduleProfileSync(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile() {
    try { const p = await api.get('/auth/me'); setProfile(p); } catch {}
  }
  function refreshProfile() { fetchProfile(); }

  if (session === undefined) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#090b11' }}>
        <Spinner size={36} />
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{ session, profile, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

function RequireAuth({ children }) {
  const { session } = useAuth();
  const loc = useLocation();
  if (!session) return <Navigate to={`/login?next=${loc.pathname}`} replace />;
  return children;
}

function RequireGuest({ children }) {
  const { session } = useAuth();
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login"   element={<RequireGuest><Login /></RequireGuest>} />
          <Route path="/signup"  element={<RequireGuest><Signup /></RequireGuest>} />
          <Route path="/forgot-password" element={<RequireGuest><ForgotPassword /></RequireGuest>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/dashboard"  element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/about-loop" element={<RequireAuth><AboutLoop /></RequireAuth>} />
          <Route path="/guidelines" element={<RequireAuth><Guidelines /></RequireAuth>} />
          <Route path="/projects"   element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/project/:id" element={<RequireAuth><Project /></RequireAuth>} />
          <Route path="/settings"   element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/deployments" element={<RequireAuth><Deployments /></RequireAuth>} />
          <Route path="/logs" element={<RequireAuth><Logs /></RequireAuth>} />
          <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
          <Route path="/domains" element={<RequireAuth><Domains /></RequireAuth>} />
          <Route path="/environment-variables" element={<RequireAuth><EnvironmentVariables /></RequireAuth>} />
          <Route path="/integrations" element={<RequireAuth><Integrations /></RequireAuth>} />
          <Route path="/team" element={<RequireAuth><Team /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/activity" element={<RequireAuth><Activity /></RequireAuth>} />
          <Route path="/security" element={<RequireAuth><Security /></RequireAuth>} />
          <Route path="/developer" element={<RequireAuth><Developer /></RequireAuth>} />
          <Route path="/billing" element={<RequireAuth><Billing /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
