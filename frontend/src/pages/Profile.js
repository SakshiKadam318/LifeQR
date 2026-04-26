import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

export default function Profile() {
  const { API } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '', date_of_birth: '', gender: '', blood_type: '',
    allergies: '', medical_conditions: '', current_medications: '',
    doctor_name: '', doctor_phone: '', organ_donor: false, address: ''
  });
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', priority: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  // ✅ Har request mein token automatically bhejta hai
  const getHeaders = () => {
    const token = localStorage.getItem('lifeqr_token');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const token = localStorage.getItem('lifeqr_token');
    if (!token) return;

    axios.get(`${API}/profile`, { headers: getHeaders() })
      .then(res => {
        if (res.data.profile) {
          setProfile(prev => ({ ...prev, ...res.data.profile, organ_donor: !!res.data.profile.organ_donor }));
        }
        setContacts(res.data.contacts || []);
      })
      .catch(err => console.error('Profile load error:', err))
      .finally(() => setLoading(false));
  }, [API]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/profile`, profile, { headers: getHeaders() });
      showToast('Profile saved successfully!');
    } catch {
      showToast('Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addContact = async (e) => {
    e.preventDefault();
    setAddingContact(true);
    try {
      const res = await axios.post(`${API}/profile/contacts`, newContact, { headers: getHeaders() });
      setContacts([...contacts, { ...newContact, id: res.data.id }]);
      setNewContact({ name: '', relationship: '', phone: '', priority: contacts.length + 1 });
      setShowContactForm(false);
      showToast('Contact added!');
    } catch {
      showToast('Failed to add contact.', 'error');
    } finally {
      setAddingContact(false);
    }
  };

  const deleteContact = async (id) => {
    try {
      await axios.delete(`${API}/profile/contacts/${id}`, { headers: getHeaders() });
      setContacts(contacts.filter(c => c.id !== id));
      showToast('Contact removed.');
    } catch {
      showToast('Failed to remove contact.', 'error');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="page-container">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          My Medical Profile
        </h1>
        <p style={{ color: 'var(--text2)' }}>This information will be shown to rescuers when they scan your QR code.</p>
      </div>

      <form onSubmit={saveProfile}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title"><div className="icon">👤</div>Personal Information</div>
          <div className="grid-2">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" value={profile.full_name}
                onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Your full name" />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" value={profile.date_of_birth || ''}
                onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select value={profile.gender || ''} onChange={e => setProfile({ ...profile, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label>Blood Type</label>
              <select value={profile.blood_type || ''} onChange={e => setProfile({ ...profile, blood_type: e.target.value })}>
                <option value="">Select blood type</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group">
            <label>Address</label>
            <input type="text" value={profile.address || ''} placeholder="Home address (helps rescuers)"
              onChange={e => setProfile({ ...profile, address: e.target.value })} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title"><div className="icon">🏥</div>Medical Information</div>
          <div className="input-group">
            <label>Known Allergies</label>
            <textarea value={profile.allergies || ''} placeholder="e.g. Penicillin, Peanuts, Latex..."
              onChange={e => setProfile({ ...profile, allergies: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Medical Conditions</label>
            <textarea value={profile.medical_conditions || ''} placeholder="e.g. Diabetes Type 2, Hypertension, Epilepsy..."
              onChange={e => setProfile({ ...profile, medical_conditions: e.target.value })} />
          </div>
          <div className="input-group">
            <label>Current Medications</label>
            <textarea value={profile.current_medications || ''} placeholder="e.g. Metformin 500mg, Aspirin 75mg..."
              onChange={e => setProfile({ ...profile, current_medications: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label>Doctor's Name</label>
              <input type="text" value={profile.doctor_name || ''} placeholder="Dr. Sharma"
                onChange={e => setProfile({ ...profile, doctor_name: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Doctor's Phone</label>
              <input type="tel" value={profile.doctor_phone || ''} placeholder="+91 98765 43210"
                onChange={e => setProfile({ ...profile, doctor_phone: e.target.value })} />
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>🫀 Organ Donor</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Indicate if you are a registered organ donor</div>
            </div>
            <button type="button" onClick={() => setProfile({ ...profile, organ_donor: !profile.organ_donor })}
              style={{
                width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: profile.organ_donor ? 'var(--green)' : 'var(--bg2)',
                transition: 'background 0.2s', position: 'relative'
              }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: profile.organ_donor ? 25 : 3,
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginBottom: 32 }}>
          {saving ? <><div className="spinner" />Saving...</> : '💾 Save Profile'}
        </button>
      </form>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>
            <div className="icon">📞</div>Emergency Contacts
          </div>
          <button className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowContactForm(!showContactForm)}>
            {showContactForm ? '✕ Cancel' : '+ Add Contact'}
          </button>
        </div>

        {showContactForm && (
          <form onSubmit={addContact} style={{
            background: 'var(--bg3)', borderRadius: 12, padding: 20, marginBottom: 20,
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14, color: 'var(--text2)' }}>New Emergency Contact</div>
            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Name</label>
                <input type="text" placeholder="Maa / Papa / Bhai" required
                  value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Relationship</label>
                <select value={newContact.relationship} onChange={e => setNewContact({ ...newContact, relationship: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 12 }}>
              <label>Phone Number</label>
              <input type="tel" placeholder="+91 98765 43210" required
                value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={addingContact}>
              {addingContact ? <><div className="spinner" />Adding...</> : '+ Add Contact'}
            </button>
          </form>
        )}

        {contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📵</div>
            <p>No emergency contacts added yet.</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>These are the people rescuers can call when you're in danger.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contacts.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px',
                border: i === 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    background: i === 0 ? 'var(--red-glow)' : 'var(--bg2)',
                    border: `1px solid ${i === 0 ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`
                  }}>
                    {i === 0 ? '⭐' : '👤'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.relationship} · {c.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {i === 0 && <span className="badge badge-red">Primary</span>}
                  <button onClick={() => deleteContact(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, lineHeight: 1 }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}