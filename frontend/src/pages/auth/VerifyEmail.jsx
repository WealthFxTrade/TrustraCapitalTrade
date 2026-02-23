import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://trustracapitaltrade-backend.onrender.com';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`\( {BACKEND_URL}/api/auth/verify-email/ \){token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="text-center">
        {status === 'verifying' && <h2>Verifying your email...</h2>}
        {status === 'success' && (
          <div>
            <h2 className="text-green-400">Email verified!</h2>
            <p>Redirecting to login...</p>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <h2 className="text-red-400">Verification failed</h2>
            <p>Link invalid or expired. Try resending verification email.</p>
          </div>
        )}
      </div>
    </div>
  );
}
