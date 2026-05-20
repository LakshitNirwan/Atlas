import { useState } from 'react';
import { MapPin, User, Sun, Moon } from 'lucide-react';

const LoginScreen = ({ T, isDarkMode, setIsDarkMode, onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', reg_no: '', password: '' });
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await onLogin(isLoginMode, authForm);
    } catch (err) {
      setAuthError(err.message || 'Error');
    }
  };

  return (
    <div className="atlas-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: '100vh', position: 'relative' }}>
      <button
        className="theme-toggle-btn"
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="atlas-card" style={{ padding: '40px', width: '100%', maxWidth: '420px' }}>
        <div className="corner-br" />

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <MapPin size={48} color={T.cyan} style={{ margin: '0 auto 10px', filter: `drop-shadow(0 0 10px ${T.cyanDim})` }} />
          <h1 style={{ fontFamily: "'Orbitron', sans-serif", margin: 0, fontSize: '2.5rem', fontWeight: '900', color: T.text0, letterSpacing: '0.1em' }}>ATLAS</h1>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", color: T.cyanDim, margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '5px' }}>Terminal Access</p>
        </div>

        {authError && (
          <div style={{ backgroundColor: isDarkMode ? 'rgba(239,68,68,0.1)' : 'rgba(200,32,32,0.08)', border: `1px solid ${T.red}`, color: T.red, padding: '12px', borderRadius: '3px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLoginMode && (
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.text2 }} />
              <input type="text" placeholder="Full Name" required className="atlas-control" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.text2, fontFamily: "'Share Tech Mono', monospace", fontSize: '12px' }}>ID</span>
            <input type="text" placeholder="VIT Reg No" required className="atlas-control" style={{ textTransform: 'uppercase' }} value={authForm.reg_no} onChange={(e) => setAuthForm({ ...authForm, reg_no: e.target.value })} />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.text2, fontFamily: "'Share Tech Mono', monospace", fontSize: '12px' }}>PW</span>
            <input type="password" placeholder="Password" required className="atlas-control" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
          </div>
          <button type="submit" className="atlas-btn" style={{ marginTop: '10px' }}>
            {isLoginMode ? 'Authenticate' : 'Initialize Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', color: T.text2, fontSize: '0.9rem' }}>
          {isLoginMode ? 'Unregistered user? ' : 'Already initialized? '}
          <span
            onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }}
            style={{ color: T.cyan, cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace" }}
          >
            {isLoginMode ? '[ CREATE PROFILE ]' : '[ LOGIN ]'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;