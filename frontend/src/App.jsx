import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PhoneVerificationPage from './pages/PhoneVerificationPage';
import SignupDetailsPage from './pages/SignupDetailsPage';
import HomePage from './pages/HomePage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import StatusPage from './pages/StatusPage';
import CallPage from './pages/CallPage';
import CallsPage from './pages/CallsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<PhoneVerificationPage />} />
      <Route path="/signup/details" element={<SignupDetailsPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/call/:roomId" element={<CallPage />} />
      <Route path="/calls" element={<CallsPage />} />
    </Routes>
  );
}

export default App;
