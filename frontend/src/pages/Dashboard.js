import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user, API } = useAuth();
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [qr, setQr] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/profile`),
      axios.get(`${API}/qr/active`),
      axios.get(`${API}/qr/scan-logs`)
    ]).then(([pRes, qRes, lRes]) => {
      setProfile(pRes.data.profile);
      setContacts(pRes.data.contacts);
      setQr(qRes.data.qr);
      setLogs(lRes.data.logs);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [API]);

  const profileComplete = () => {
    if (!profile) return 0;
    const fields = ['blood_type', 'allergies', 'medical_conditions', 'date_of_birth'];
    const filled = fields.filter(f => profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const completion = profileComplete();

  return (
    <div className="page-container">
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 30, fontWeight: 700, marginBottom: 6 }}>
          Hello, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)' }}>Manage your emergency medical identity</p>
      </div>

      {/* Alert if profile incomplete */}
      {completion < 100 && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{ fontWeight: 600, color: '#fcd34d', marginBottom: 4 }}>⚠️ Profile {completion}% complete</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>Add your medical details to make your QR more useful in emergencies.</div>
          </div>
          <Link to="/profile" className="btn btn-secondary" style={{ fontSize: 13 }}>Complete Profile →</Link>
        </div>
      )}

      {/* Alert if no emergency contacts */}
      {contacts.length === 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--red-light)', marginBottom: 4 }}>🚨 No emergency contacts!</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>Without contacts, rescuers can't reach your family. Add them now.</div>
          </div>
          <Link to="/profile" className="btn btn-primary" style={{ fontSize: 13 }}>Add Contacts →</Link>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Profile Complete', value: `${completion}%`, color: completion === 100 ? 'var(--green)' : 'var(--amber)', icon: '👤' },
          { label: 'Emergency Contacts', value: contacts.length, color: contacts.length > 0 ? 'var(--green)' : 'var(--red)', icon: '📞' },
          { label: 'QR Status', value: qr ? 'Active' : 'None', color: qr ? 'var(--green)' : 'var(--red)', icon: '🔲' },
          { label: 'Times Scanned', value: logs.length, color: 'var(--blue)', icon: '📊' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* QR Card */}
        <div className="card">
          <div className="section-title">
            <div className="icon">🔲</div>
            Your QR Code
          </div>
          {qr ? (
            <div style={{ textAlign: 'center' }}>
              <img src={qr.qrDataUrl} alt="Your LifeQR" style={{ width: 160, height: 160, borderRadius: 12, marginBottom: 12 }} />
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
                Expires: {new Date(qr.expires_at).toLocaleDateString()}
              </div>
              <Link to="/qr" className="btn btn-primary btn-full" style={{ fontSize: 13 }}>
                🖨️ Print / Download
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔲</div>
              <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 14 }}>You haven't generated your QR code yet.</p>
              <Link to="/qr" className="btn btn-primary btn-full">Generate QR Code</Link>
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="card">
          <div className="section-title">
            <div className="icon">📞</div>
            Emergency Contacts
          </div>
          {contacts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contacts.slice(0, 3).map((c, i) => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px'
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i === 0 ? 'var(--red-glow)' : 'var(--bg2)',
                    border: `1px solid ${i === 0 ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16
                  }}>
                    {i === 0 ? '⭐' : '👤'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.relationship}</div>
                  </div>
                </div>
              ))}
              <Link to="/profile" style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'none', textAlign: 'center', marginTop: 4 }}>
                Manage contacts →
              </Link>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📵</div>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 16 }}>No contacts added yet.</p>
              <Link to="/profile" className="btn btn-secondary btn-full">Add Emergency Contacts</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent scans */}
      {logs.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="section-title">
            <div className="icon">📊</div>
            Recent Scans
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logs.slice(0, 5).map(log => (
              <div key={log.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📱</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>QR Scanned</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{log.ip_address || 'Unknown location'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {new Date(log.scanned_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
