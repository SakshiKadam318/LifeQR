
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={`toast toast-${type}`}>{msg}</div>;
}

// Safely convert supported API response formats into an array.
function normalizeContacts(data) {
  if (Array.isArray(data)) return data;

  if (data && Array.isArray(data.contacts)) {
    return data.contacts;
  }

  if (data == null) return [];

  console.error('Invalid contacts response:', data);
  return [];
}

export default function Profile() {
  const { API } = useAuth();

  const [profile, setProfile] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    allergies: '',
    medical_conditions: '',
    current_medications: '',
    doctor_name: '',
    doctor_phone: '',
    organ_donor: false,
    address: ''
  });

  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    priority: 1
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('lifeqr_token');

    return {
      Authorization: `Bearer ${token}`
    };
  }, []);

  // Load profile and emergency contacts.
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const token = localStorage.getItem('lifeqr_token');

      if (!token) {
        if (mounted) {
          setLoading(false);
          showToast('Please log in to view your profile.', 'error');
        }
        return;
      }

      try {
        const response = await axios.get(`${API}/profile`, {
          headers: getHeaders()
        });

        if (!mounted) return;

        const data = response.data || {};
        const profileData = data.profile;

        if (
          profileData &&
          typeof profileData === 'object' &&
          !Array.isArray(profileData)
        ) {
          setProfile(prev => ({
            ...prev,
            ...profileData,
            organ_donor: Boolean(profileData.organ_donor)
          }));
        }

        setContacts(normalizeContacts(data.contacts));
      } catch (error) {
        console.error(
          'Profile load error:',
          error.response?.status,
          error.response?.data || error.message
        );

        if (mounted) {
          setContacts([]);
          showToast(
            error.response?.status === 401
              ? 'Session expired. Please log in again.'
              : 'Could not load profile. Please try again.',
            'error'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [API, getHeaders, showToast]);

  // Save medical profile.
  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/profile`, profile, {
        headers: getHeaders()
      });

      showToast('Profile saved successfully!');
    } catch (error) {
      console.error(
        'Save profile error:',
        error.response?.data || error.message
      );

      showToast(
        error.response?.status === 401
          ? 'Please log in again.'
          : 'Failed to save profile.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  // Add an emergency contact.
  const addContact = async (event) => {
    event.preventDefault();
    setAddingContact(true);

    try {
      const response = await axios.post(
        `${API}/profile/contacts`,
        {
          ...newContact,
          priority: contacts.length + 1
        },
        { headers: getHeaders() }
      );

      const returnedContact = response.data?.contact;

      const addedContact =
        returnedContact &&
        typeof returnedContact === 'object' &&
        !Array.isArray(returnedContact)
          ? { ...newContact, ...returnedContact }
          : {
              ...newContact,
              id: response.data?.id ?? response.data?.contactId
            };

      if (addedContact.id == null) {
        console.error('Unexpected add-contact response:', response.data);
        showToast(
          'Contact may have been saved, but its ID was not returned. Reload the page to verify.',
          'error'
        );
        return;
      }

      setContacts(prev => [
        ...(Array.isArray(prev) ? prev : []),
        addedContact
      ]);

      setNewContact({
        name: '',
        relationship: '',
        phone: '',
        priority: contacts.length + 2
      });

      setShowContactForm(false);
      showToast('Contact added!');
    } catch (error) {
      console.error(
        'Add contact error:',
        error.response?.data || error.message
      );

      showToast(
        error.response?.status === 401
          ? 'Please log in again.'
          : 'Failed to add contact.',
        'error'
      );
    } finally {
      setAddingContact(false);
    }
  };

  // Delete an emergency contact.
  const deleteContact = async (id) => {
    if (id == null) {
      showToast('Cannot delete this contact: ID is missing.', 'error');
      return;
    }

    try {
      await axios.delete(`${API}/profile/contacts/${id}`, {
        headers: getHeaders()
      });

      setContacts(prev =>
        (Array.isArray(prev) ? prev : []).filter(
          contact => String(contact.id) !== String(id)
        )
      );

      showToast('Contact removed.');
    } catch (error) {
      console.error(
        'Delete contact error:',
        error.response?.data || error.message
      );

      showToast(
        error.response?.status === 401
          ? 'Please log in again.'
          : 'Failed to remove contact.',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh'
        }}
      >
        <div
          className="spinner"
          style={{ width: 40, height: 40 }}
        />
      </div>
    );
  }

  const safeContacts = Array.isArray(contacts) ? contacts : [];

  return (
    <div className="page-container">
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontFamily: 'Space Grotesk',
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 6
          }}
        >
          My Medical Profile
        </h1>
        <p style={{ color: 'var(--text2)' }}>
          This information will be shown to rescuers when they scan your QR code.
        </p>
      </div>

      <form onSubmit={saveProfile}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">
            <div className="icon">👤</div>
            Personal Information
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    full_name: e.target.value
                  }))
                }
                placeholder="Your full name"
              />
            </div>

            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={profile.date_of_birth || ''}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    date_of_birth: e.target.value
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label>Gender</label>
              <select
                value={profile.gender || ''}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    gender: e.target.value
                  }))
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Blood Type</label>
              <select
                value={profile.blood_type || ''}
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    blood_type: e.target.value
                  }))
                }
              >
                <option value="">Select blood type</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                  bloodType => (
                    <option key={bloodType} value={bloodType}>
                      {bloodType}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Address</label>
            <input
              type="text"
              value={profile.address || ''}
              placeholder="Home address (helps rescuers)"
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  address: e.target.value
                }))
              }
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">
            <div className="icon">🏥</div>
            Medical Information
          </div>

          <div className="input-group">
            <label>Known Allergies</label>
            <textarea
              value={profile.allergies || ''}
              placeholder="e.g. Penicillin, Peanuts, Latex..."
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  allergies: e.target.value
                }))
              }
            />
          </div>

          <div className="input-group">
            <label>Medical Conditions</label>
            <textarea
              value={profile.medical_conditions || ''}
              placeholder="e.g. Diabetes Type 2, Hypertension, Epilepsy..."
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  medical_conditions: e.target.value
                }))
              }
            />
          </div>

          <div className="input-group">
            <label>Current Medications</label>
            <textarea
              value={profile.current_medications || ''}
              placeholder="e.g. Metformin 500mg, Aspirin 75mg..."
              onChange={e =>
                setProfile(prev => ({
                  ...prev,
                  current_medications: e.target.value
                }))
              }
            />
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Doctor's Name</label>
              <input
                type="text"
                value={profile.doctor_name || ''}
                placeholder="Dr. Sharma"
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    doctor_name: e.target.value
                  }))
                }
              />
            </div>

            <div className="input-group">
              <label>Doctor's Phone</label>
              <input
                type="tel"
                value={profile.doctor_phone || ''}
                placeholder="+91 98765 43210"
                onChange={e =>
                  setProfile(prev => ({
                    ...prev,
                    doctor_phone: e.target.value
                  }))
                }
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg3)',
              borderRadius: 10,
              padding: '14px 16px'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                🫀 Organ Donor
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text3)',
                  marginTop: 2
                }}
              >
                Indicate if you are a registered organ donor
              </div>
            </div>

            <button
              type="button"
              aria-label="Toggle organ donor status"
              aria-pressed={Boolean(profile.organ_donor)}
              onClick={() =>
                setProfile(prev => ({
                  ...prev,
                  organ_donor: !prev.organ_donor
                }))
              }
              style={{
                width: 48,
                height: 26,
                borderRadius: 13,
                border: 'none',
                cursor: 'pointer',
                background: profile.organ_donor
                  ? 'var(--green)'
                  : 'var(--bg2)',
                transition: 'background 0.2s',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: 3,
                  left: profile.organ_donor ? 25 : 3,
                  transition: 'left 0.2s'
                }}
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{ marginBottom: 32 }}
        >
          {saving ? (
            <>
              <div className="spinner" />
              Saving...
            </>
          ) : (
            '💾 Save Profile'
          )}
        </button>
      </form>

      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20
          }}
        >
          <div className="section-title" style={{ marginBottom: 0 }}>
            <div className="icon">📞</div>
            Emergency Contacts
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
            onClick={() => setShowContactForm(prev => !prev)}
          >
            {showContactForm ? '✕ Cancel' : '+ Add Contact'}
          </button>
        </div>

        {showContactForm && (
          <form
            onSubmit={addContact}
            style={{
              background: 'var(--bg3)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              border: '1px solid var(--border)'
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 14,
                fontSize: 14,
                color: 'var(--text2)'
              }}
            >
              New Emergency Contact
            </div>

            <div className="grid-2">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Maa / Papa / Bhai"
                  required
                  value={newContact.name}
                  onChange={e =>
                    setNewContact(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
                  }
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Relationship</label>
                <select
                  value={newContact.relationship}
                  onChange={e =>
                    setNewContact(prev => ({
                      ...prev,
                      relationship: e.target.value
                    }))
                  }
                >
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
              <input
                type="tel"
                placeholder="+91 98765 43210"
                required
                value={newContact.phone}
                onChange={e =>
                  setNewContact(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={addingContact}
            >
              {addingContact ? (
                <>
                  <div className="spinner" />
                  Adding...
                </>
              ) : (
                '+ Add Contact'
              )}
            </button>
          </form>
        )}

        {safeContacts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px 0',
              color: 'var(--text3)'
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📵</div>
            <p>No emergency contacts added yet.</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>
              These are the people rescuers can call when you're in danger.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}
          >
            {safeContacts.map((contact, index) => (
              <div
                key={contact.id ?? `${contact.phone}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg3)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  border:
                    index === 0
                      ? '1px solid rgba(239,68,68,0.3)'
                      : '1px solid var(--border)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      background:
                        index === 0 ? 'var(--red-glow)' : 'var(--bg2)',
                      border:
                        index === 0
                          ? '1px solid rgba(239,68,68,0.4)'
                          : '1px solid var(--border)'
                    }}
                  >
                    {index === 0 ? '⭐' : '👤'}
                  </div>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {contact.name || 'Unnamed contact'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {contact.relationship || 'Contact'} · {contact.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {index === 0 && (
                    <span className="badge badge-red">Primary</span>
                  )}

                  <button
                    type="button"
                    aria-label={`Delete ${contact.name || 'contact'}`}
                    onClick={() => deleteContact(contact.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text3)',
                      fontSize: 18,
                      lineHeight: 1
                    }}
                  >
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
