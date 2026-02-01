import { useEffect, useState } from 'react';
import { submitKyc, getKycStatus } from '../api';
import toast from 'react-hot-toast';

export default function Kyc() {
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    getKycStatus().then(r => setStatus(r.data.status));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('document', file);

    try {
      await submitKyc(formData);
      toast.success('KYC submitted');
    } catch {
      toast.error('Submission failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
      <p className="mb-6">Status: <strong>{status}</strong></p>

      {status !== 'approved' && (
        <form onSubmit={submit}>
          <input type="file" required onChange={(e) => setFile(e.target.files[0])} />
          <button className="mt-4 bg-cyan-500 text-black px-6 py-2 rounded">
            Submit Document
          </button>
        </form>
      )}
    </div>
  );
}
