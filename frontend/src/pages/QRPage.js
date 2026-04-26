import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CARD_STYLES = [
  { id: 'wallet', label: 'Wallet Card', icon: '💳', desc: 'Credit card size', size: '85mm × 54mm', bg: '#0a0f1e', accent: '#ef4444', textColor: '#f1f5f9', border: '2px solid #ef4444' },
  { id: 'helmet', label: 'Helmet Sticker', icon: '🪖', desc: 'Square', size: '60mm × 60mm', bg: '#111827', accent: '#f59e0b', textColor: '#f1f5f9', border: '2px solid #f59e0b' },
  { id: 'car', label: 'Car', icon: '🚗', desc: 'Wide', size: '120mm × 60mm', bg: '#1a1a2e', accent: '#3b82f6', textColor: '#f1f5f9', border: '2px solid #3b82f6' },
  { id: 'badge', label: 'Badge', icon: '🪪', desc: 'Portrait', size: '54mm × 85mm', bg: '#0f172a', accent: '#10b981', textColor: '#f1f5f9', border: '2px solid #10b981' },
];

const SIZES = {
  wallet: { width: '85mm', height: '54mm' },
  helmet: { width: '60mm', height: '60mm' },
  car:    { width: '120mm', height: '60mm' },
  badge:  { width: '54mm', height: '85mm' },
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

export default function QRPage() {
  const { API } = useAuth();
  const [qr, setQr] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('wallet');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const getHeaders = () => {
    const token = localStorage.getItem('lifeqr_token');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/qr/active`, { headers: getHeaders() }),
      axios.get(`${API}/profile`, { headers: getHeaders() })
    ])
    .then(([qRes, pRes]) => {
      setQr(qRes.data.qr);
      setProfile(pRes.data.profile);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [API]);

  const generateQR = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/qr/generate`, {}, { headers: getHeaders() });
      setQr(res.data);
      showToast('QR code generated!');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate QR', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const style = CARD_STYLES.find(s => s.id === selectedStyle);
    const s = SIZES[selectedStyle];
    const isLandscape = selectedStyle === 'wallet' || selectedStyle === 'car';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <style>
          @page { size: ${s.width} ${s.height}; margin: 0; }
          * { box-sizing: border-box; }
          body { margin: 0; width: ${s.width}; height: ${s.height}; display: flex; justify-content: center; align-items: center; background: ${style.bg}; overflow: hidden; }
          .card { width: ${s.width}; height: ${s.height}; background: ${style.bg}; border: ${style.border}; border-radius: 12px; display: flex; flex-direction: ${isLandscape ? 'row' : 'column'}; align-items: center; justify-content: center; gap: 10px; padding: 12px; }
          .left { display: flex; flex-direction: column; align-items: center; gap: 6px; }
          .right { display: flex; flex-direction: column; gap: 6px; flex: 1; }
          h2 { color: ${style.accent}; margin: 0; font-family: Arial; font-size: ${isLandscape ? '13px' : '14px'}; }
          .name { color: ${style.textColor}; font-family: Arial; font-size: 13px; font-weight: bold; }
          .sub { color: ${style.textColor}; font-family: Arial; font-size: 10px; opacity: 0.6; }
          .blood { color: ${style.accent}; font-family: Arial; font-size: 12px; font-weight: bold; }
          img { width: ${isLandscape ? '90px' : '110px'}; height: ${isLandscape ? '90px' : '110px'}; }
        </style>
      </head>
      <body>
        <div class="card">
          ${isLandscape ? `
            <div class="left">
              <img src="${qr?.qrDataUrl}" />
            </div>
            <div class="right">
              <h2>🛡️ LifeQR</h2>
              <div class="name">${profile?.full_name || 'Emergency Medical ID'}</div>
              ${profile?.blood_type ? `<div class="blood">🩸 ${profile.blood_type}</div>` : ''}
              ${profile?.allergies ? `<div class="sub">⚠️ ${profile.allergies}</div>` : ''}
              <div class="sub">Scan for medical info</div>
            </div>
          ` : `
            <h2>🛡️ LifeQR</h2>
            <img src="${qr?.qrDataUrl}" />
            <div class="name">${profile?.full_name || 'Emergency Medical ID'}</div>
            ${profile?.blood_type ? `<div class="blood">🩸 ${profile.blood_type}</div>` : ''}
            <div class="sub">Scan for medical info</div>
          `}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  const style = CARD_STYLES.find(s => s.id === selectedStyle);

  return (
    <div className="page-container">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>My QR Code</h1>
        <p style={{ color: 'var(--text2)' }}>Generate your emergency QR code and print it on a card or sticker.</p>
      </div>

      {/* Card Style Selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title"><div className="icon">🎨</div>Choose Card Style</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {CARD_STYLES.map(s => (
            <div key={s.id} onClick={() => setSelectedStyle(s.id)} style={{
              border: selectedStyle === s.id ? `2px solid ${s.accent}` : '2px solid var(--border)',
              borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
              background: selectedStyle === s.id ? 'var(--bg3)' : 'var(--bg2)',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.desc} · {s.size}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Display */}
      <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
        {!qr ? (
          <div style={{ padding: '40px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📱</div>
            <p style={{ color: 'var(--text2)', marginBottom: 24 }}>No QR code yet. Generate one to get started!</p>
            <button className="btn btn-primary" onClick={generateQR} disabled={generating}>
              {generating ? <><div className="spinner" />Generating...</> : '✨ Generate My QR Code'}
            </button>
          </div>
        ) : (
          <div>
            {/* Card Preview */}
            <div style={{
              background: style.bg, border: style.border, borderRadius: 16,
              padding: 24, display: 'inline-flex',
              flexDirection: selectedStyle === 'wallet' || selectedStyle === 'car' ? 'row' : 'column',
              alignItems: 'center', gap: 16, marginBottom: 24,
              minWidth: selectedStyle === 'car' ? 400 : 'auto'
            }}>
              <img src={qr.qrDataUrl} alt="QR Code" style={{ width: 150, height: 150, borderRadius: 8 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: selectedStyle === 'wallet' || selectedStyle === 'car' ? 'flex-start' : 'center' }}>
                <div style={{ color: style.accent, fontWeight: 700, fontSize: 18, fontFamily: 'Space Grotesk' }}>🛡️ LifeQR</div>
                {profile?.full_name && <div style={{ color: style.textColor, fontWeight: 600, fontSize: 15 }}>{profile.full_name}</div>}
                {profile?.blood_type && <div style={{ color: style.accent, fontWeight: 700, fontSize: 13 }}>🩸 {profile.blood_type}</div>}
                {profile?.allergies && <div style={{ color: style.textColor, fontSize: 12, opacity: 0.7 }}>⚠️ {profile.allergies}</div>}
                <div style={{ color: style.textColor, fontSize: 11, opacity: 0.5 }}>Scan at emergency Time</div>
              </div>
            </div>

            <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>
              Expires: {new Date(qr.expiresAt).toLocaleDateString()}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print Card</button>
              <button className="btn btn-secondary" onClick={generateQR} disabled={generating}>
                {generating ? <><div className="spinner" />Regenerating...</> : '🔄 Regenerate QR'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card">
        <div className="section-title"><div className="icon">ℹ️</div>How it works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '1️⃣', text: 'Generate your QR code above' },
            { icon: '2️⃣', text: 'Choose a card style and print it' },
            { icon: '3️⃣', text: 'Stick it on your helmet, wallet, or car' },
            { icon: '4️⃣', text: 'Rescuers scan it to see your medical info instantly' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ color: 'var(--text2)', fontSize: 14 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}