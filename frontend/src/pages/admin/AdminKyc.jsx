import { useEffect, useState, useCallback } from 'react';
import { fetchKyc, approveKyc, rejectKyc } from '../../api/adminKyc';

import './AdminKyc.css'; // ← add some basic styling

export default function AdminKyc() {
  const [kycList, setKycList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which rows are currently processing an action
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const loadKyc = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchKyc();
      // Be defensive — API shapes change sometimes
      setKycList(res?.data?.data ?? []);
    } catch (err: any) {
      console.error('Failed to load KYC list', err);
      setError(err.message || 'Could not load KYC requests. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  const isProcessing = (id: string) => processing.has(id);

  const startProcessing = (id: string) => {
    setProcessing((prev) => new Set([...prev, id]));
  };

  const stopProcessing = (id: string) => {
    setProcessing((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this KYC submission?\n\nThis action cannot be undone.')) return;

    startProcessing(id);
    try {
      await approveKyc(id);
      alert('KYC approved successfully.');
      loadKyc();
    } catch (err: any) {
      console.error(err);
      alert(`Approval failed: ${err.message || 'Unknown error'}`);
    } finally {
      stopProcessing(id);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt(
      'Enter rejection reason (will be sent to user):\n\nRequired field.',
      ''
    )?.trim();

    if (!reason) {
      alert('Rejection cancelled — reason is required.');
      return;
    }

    if (reason.length < 8) {
      alert('Rejection reason should be at least 8 characters.');
      return;
    }

    startProcessing(id);
    try {
      await rejectKyc(id, reason);
      alert('KYC rejected successfully.');
      loadKyc();
    } catch (err: any) {
      console.error(err);
      alert(`Rejection failed: ${err.message || 'Unknown error'}`);
    } finally {
      stopProcessing(id);
    }
  };

  if (loading) return <div className="loading">Loading KYC requests...</div>;

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadKyc}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-kyc">
      <h2>KYC Review Queue</h2>

      {kycList.length === 0 ? (
        <p className="empty">No KYC requests waiting for review.</p>
      ) : (
        <table className="kyc-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Document</th>
              <th>Selfie</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {kycList.map((k) => {
              const id = k._id;
              const proc = isProcessing(id);

              return (
                <tr key={id} className={proc ? 'processing' : ''}>
                  <td>{k.user?.email ?? '—'}</td>
                  <td>
                    {k.documentFront ? (
                      <a
                        href={k.documentFront}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Front
                      </a>
                    ) : (
                      '—'
                    )}
                    {k.documentBack && (
                      <>
                        {' • '}
                        <a
                          href={k.documentBack}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Back
                        </a>
                      </>
                    )}
                  </td>
                  <td>
                    {k.selfie ? (
                      <a href={k.selfie} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`status ${k.status || 'pending'}`}>
                    {k.status || 'pending'}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleApprove(id)}
                      disabled={proc}
                      className="btn approve"
                    >
                      {proc ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(id)}
                      disabled={proc}
                      className="btn reject"
                    >
                      {proc ? '…' : 'Reject'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
