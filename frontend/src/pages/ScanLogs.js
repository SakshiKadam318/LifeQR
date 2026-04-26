import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function ScanLogs() {
  const { API } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/qr/scan-logs`)
      .then(res => setLogs(res.data.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [API]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Scan History</h1>
        <p style={{ color: 'var(--text2)' }}>Every time your QR code was scanned — logged for your safety.</p>
      </div>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 22, marginBottom: 8 }}>No scans yet</h2>
          <p style={{ color: 'var(--text2)' }}>When someone scans your QR code, it will appear here.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap'
          }}>
            <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 700, color: 'var(--blue)' }}>{logs.length}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Total Scans</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 700, color: 'var(--green)' }}>
                {logs.filter(l => l.fingerprint_hash).length}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Verified Scans</div>
            </div>
            <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                {logs[0] ? new Date(logs[0].scanned_at).toLocaleDateString() : '—'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>Last Scanned</div>
            </div>
          </div>

          <div className="card">
            <div className="section-title"><div className="icon">📊</div>Scan Log</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {logs.map((log, i) => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px',
                  flexWrap: 'wrap', gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: log.fingerprint_hash ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      border: `1px solid ${log.fingerprint_hash ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>
                      {log.fingerprint_hash ? '🔒' : '📱'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        QR Scanned
                        {log.fingerprint_hash && (
                          <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 10 }}>Verified</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {log.ip_address || 'Unknown IP'}
                        {log.location_lat && ` · ${log.location_lat.toFixed(4)}, ${log.location_lng.toFixed(4)}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                    {new Date(log.scanned_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
