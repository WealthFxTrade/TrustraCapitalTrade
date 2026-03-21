import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, MailCheck, ArrowRight } from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        toast.error('Invalid verification link');
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.post('/auth/verify-email', { token });

        if (data?.success) {
          setSuccess(true);
          toast.success('Email verified successfully');
        } else {
          throw new Error(data?.message || 'Verification failed');
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Verification failed. Please try again.';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          {loading ? (
            <Loader2 className="animate-spin text-yellow-500" size={40} />
          ) : success ? (
            <MailCheck className="text-green-400" size={40} />
          ) : (
            <ShieldCheck className="text-red-400" size={40} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-3">
          {loading
            ? 'Verifying Email'
            : success
            ? 'Verification Complete'
            : 'Verification Failed'}
        </h2>

        {/* Message */}
        <p className="text-gray-400 text-sm mb-8">
          {loading &&
            'Confirming your email address. Please wait...'}
          {!loading && success &&
            'Your email has been successfully verified. You can now access your account.'}
          {!loading && !success &&
            'The verification link is invalid or expired.'}
        </p>

        {/* Actions */}
        {!loading && (
          <div className="space-y-4">
            {success ? (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
              >
                Continue to Login <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <Link
                  to="/resend-verification"
                  className="block w-full py-4 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all uppercase text-sm"
                >
                  Resend Verification Email
                </Link>

                <Link
                  to="/login"
                  className="block text-sm text-yellow-500 hover:text-yellow-400"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
