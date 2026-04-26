import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || "http://192.168.7.2:5000/api";

const LANGS = {
  en: { flag:'🇬🇧', name:'English', title:'🚨 Emergency Info', verify:'🔐 Verify & View', loading:'Loading...', profile:'👤 Personal Info', medical:'🏥 Medical Info', contacts:'📞 Emergency Contacts', call:'📞 Call Now', gender:'Gender', dob:'Date of Birth', blood:'Blood Group', address:'Address', allergies:'⚠️ Allergies', conditions:'🩺 Conditions', medications:'💊 Medications', doctor:'👨‍⚕️ Doctor', none:'None', audio:'🔊 Speak Emergency Info', audioStop:'⏹ Stop', audioTitle:'🔊 Audio Emergency', audioDesc:'Phone will speak all info aloud', locationTitle:'📍 Send Location to Family', locationReady:'✅ Location ready', locationWait:'⏳ Getting location...', locationBtn:'📲 Send Location SMS', locationSent:'✅ SMS App Opened!', locationNote:'SMS app opens with location + info ready', hospTitle:'🏥 Find Nearest Hospital', hospBtn:'🏥 Find Hospitals', hospLoading:'⏳ Finding...', emergency:'🚨 National Emergency' },
  mr: { flag:'🇮🇳', name:'मराठी', title:'🚨 आपत्कालीन माहिती', verify:'🔐 माहिती बघा', loading:'लोड होत आहे...', profile:'👤 वैयक्तिक माहिती', medical:'🏥 वैद्यकीय माहिती', contacts:'📞 आपत्कालीन संपर्क', call:'📞 Call करा', gender:'लिंग', dob:'जन्मतारीख', blood:'रक्तगट', address:'पत्ता', allergies:'⚠️ अॅलर्जी', conditions:'🩺 आजार', medications:'💊 औषधे', doctor:'👨‍⚕️ डॉक्टर', none:'काहीही नाही', audio:'🔊 माहिती मोठ्याने ऐका', audioStop:'⏹ थांबवा', audioTitle:'🔊 ऑडिओ आपत्काल', audioDesc:'फोन सगळी माहिती मोठ्याने सांगेल', locationTitle:'📍 कुटुंबाला Location पाठवा', locationReady:'✅ Location मिळाली', locationWait:'⏳ Location मिळवत आहे...', locationBtn:'📲 Location SMS पाठवा', locationSent:'✅ SMS App उघडलं!', locationNote:'SMS app मध्ये location + माहिती ready असेल', hospTitle:'🏥 जवळचे Hospital शोधा', hospBtn:'🏥 Hospitals शोधा', hospLoading:'⏳ शोधत आहे...', emergency:'🚨 राष्ट्रीय आपत्काल' },
  hi: { flag:'🇮🇳', name:'हिंदी', title:'🚨 आपातकालीन जानकारी', verify:'🔐 जानकारी देखें', loading:'लोड हो रहा है...', profile:'👤 व्यक्तिगत जानकारी', medical:'🏥 चिकित्सा जानकारी', contacts:'📞 आपातकालीन संपर्क', call:'📞 Call करें', gender:'लिंग', dob:'जन्म तिथि', blood:'रक्त समूह', address:'पता', allergies:'⚠️ एलर्जी', conditions:'🩺 बीमारी', medications:'💊 दवाइयां', doctor:'👨‍⚕️ डॉक्टर', none:'कोई नहीं', audio:'🔊 जानकारी सुनें', audioStop:'⏹ रोकें', audioTitle:'🔊 ऑडियो आपातकाल', audioDesc:'फोन सारी जानकारी जोर से बोलेगा', locationTitle:'📍 परिवार को Location भेजें', locationReady:'✅ Location मिली', locationWait:'⏳ Location मिल रही है...', locationBtn:'📲 Location SMS भेजें', locationSent:'✅ SMS App खुला!', locationNote:'SMS app में location + जानकारी ready होगी', hospTitle:'🏥 नजदीकी अस्पताल खोजें', hospBtn:'🏥 अस्पताल खोजें', hospLoading:'⏳ खोज रहे हैं...', emergency:'🚨 राष्ट्रीय आपातकाल' },
  te: { flag:'🇮🇳', name:'తెలుగు', title:'🚨 అత్యవసర సమాచారం', verify:'🔐 సమాచారం చూడండి', loading:'లోడ్ అవుతోంది...', profile:'👤 వ్యక్తిగత సమాచారం', medical:'🏥 వైద్య సమాచారం', contacts:'📞 అత్యవసర సంప్రదింపులు', call:'📞 కాల్ చేయండి', gender:'లింగం', dob:'పుట్టిన తేది', blood:'రక్తపు గ్రూప్', address:'చిరునామా', allergies:'⚠️ అలెర్జీలు', conditions:'🩺 వ్యాధులు', medications:'💊 మందులు', doctor:'👨‍⚕️ డాక్టర్', none:'ఏదీ లేదు', audio:'🔊 సమాచారం వినండి', audioStop:'⏹ ఆపండి', audioTitle:'🔊 ఆడియో అత్యవసరం', audioDesc:'ఫోన్ అన్ని సమాచారాన్ని బిగ్గరగా చెప్తుంది', locationTitle:'📍 కుటుంబానికి Location పంపండి', locationReady:'✅ Location దొరికింది', locationWait:'⏳ Location తీసుకుంటోంది...', locationBtn:'📲 Location SMS పంపండి', locationSent:'✅ SMS App తెరిచింది!', locationNote:'SMS app లో location ready గా ఉంటుంది', hospTitle:'🏥 దగ్గరి ఆసుపత్రి వెతకండి', hospBtn:'🏥 ఆసుపత్రి వెతకండి', hospLoading:'⏳ వెతుకుతున్నాం...', emergency:'🚨 జాతీయ అత్యవసరం' },
  ta: { flag:'🇮🇳', name:'தமிழ்', title:'🚨 அவசர தகவல்', verify:'🔐 தகவல் காண்க', loading:'ஏற்றுகிறது...', profile:'👤 தனிப்பட்ட தகவல்', medical:'🏥 மருத்துவ தகவல்', contacts:'📞 அவசர தொடர்புகள்', call:'📞 அழைக்கவும்', gender:'பாலினம்', dob:'பிறந்த தேதி', blood:'இரத்த வகை', address:'முகவரி', allergies:'⚠️ ஒவ்வாமை', conditions:'🩺 நோய்கள்', medications:'💊 மருந்துகள்', doctor:'👨‍⚕️ மருத்துவர்', none:'எதுவுமில்லை', audio:'🔊 தகவல் கேளுங்கள்', audioStop:'⏹ நிறுத்து', audioTitle:'🔊 ஒலி அவசரநிலை', audioDesc:'தொலைபேசி அனைத்து தகவல்களையும் சத்தமாக சொல்லும்', locationTitle:'📍 குடும்பத்திற்கு Location அனுப்பு', locationReady:'✅ Location கிடைத்தது', locationWait:'⏳ Location பெறுகிறது...', locationBtn:'📲 Location SMS அனுப்பு', locationSent:'✅ SMS App திறந்தது!', locationNote:'SMS app இல் location ready ஆக இருக்கும்', hospTitle:'🏥 அருகில் உள்ள மருத்துவமனை', hospBtn:'🏥 மருத்துவமனை தேடு', hospLoading:'⏳ தேடுகிறோம்...', emergency:'🚨 தேசிய அவசரநிலை' },
};

const detectLang = () => {
  const l = navigator.language?.toLowerCase() || 'en';
  if (l.startsWith('mr')) return 'mr';
  if (l.startsWith('hi')) return 'hi';
  if (l.startsWith('te')) return 'te';
  if (l.startsWith('ta')) return 'ta';
  return 'en';
};

export default function ScanPage() {
  const { token } = useParams();
  const [data, setData]           = useState(null);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [verified, setVerified]   = useState(false);
  const [lang, setLang]           = useState(detectLang);
  const [speaking, setSpeaking]   = useState(false);
  const [location, setLocation]   = useState(null);
  const [locError, setLocError]   = useState('');
  const [smsSent, setSmsSent]     = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHosp, setLoadingHosp] = useState(false);

  const t = LANGS[lang];

  useEffect(() => {
    if (!data) return;
    if (!navigator.geolocation) { setLocError('not supported'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()    => setLocError('denied')
    );
  }, [data]);

  const handleVerify = async () => {
    setVerified(true); setLoading(true);
    try {
      const res = await axios.get(`${API}/public/scan/${token}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load emergency information");
    } finally { setLoading(false); }
  };

  const speakEmergency = useCallback(() => {
    if (!('speechSynthesis' in window)) { alert('Audio not supported'); return; }
    window.speechSynthesis.cancel();
    const p = data?.profile || {};
    const c = data?.contacts?.[0];

    const texts = {
      en: `Emergency Alert! Patient name is ${p.full_name || 'unknown'}. Blood group ${p.blood_type || 'unknown'}. ${p.allergies ? 'Allergic to ' + p.allergies + '.' : 'No known allergies.'} ${p.medical_conditions ? 'Medical condition: ' + p.medical_conditions + '.' : ''} ${c ? 'Please call ' + c.name + '.' : ''} Call one zero eight for ambulance immediately.`,
      mr: `आपत्काल! रुग्णाचे नाव ${p.full_name || 'माहित नाही'} आहे. रक्तगट ${p.blood_type || 'माहित नाही'}. ${p.allergies ? p.allergies + ' ची अॅलर्जी आहे.' : ''} ${p.medical_conditions ? 'आजार: ' + p.medical_conditions + '.' : ''} ${c ? 'कृपया ' + c.name + ' ला call करा.' : ''} ambulance साठी एक शून्य आठ वर call करा.`,
      hi: `आपातकाल! मरीज का नाम ${p.full_name || 'अज्ञात'} है। रक्त समूह ${p.blood_type || 'अज्ञात'}। ${p.allergies ? p.allergies + ' से एलर्जी है।' : ''} ${p.medical_conditions ? 'बीमारी: ' + p.medical_conditions + '।' : ''} ${c ? 'कृपया ' + c.name + ' को call करें।' : ''} ambulance के लिए एक शून्य आठ पर call करें।`,
      te: `అత్యవసరం! రోగి పేరు ${p.full_name || 'తెలియదు'}. రక్తపు గ్రూప్ ${p.blood_type || 'తెలియదు'}. ${p.allergies ? p.allergies + ' కి అలెర్జీ ఉంది.' : ''} ${c ? c.name + ' కి call చేయండి.' : ''} ambulance కోసం ఒక సున్న ఎనిమిది కి call చేయండి.`,
      ta: `அவசரநிலை! நோயாளி பெயர் ${p.full_name || 'தெரியவில்லை'}. இரத்த வகை ${p.blood_type || 'தெரியவில்லை'}. ${p.allergies ? p.allergies + ' ஒவ்வாமை உள்ளது.' : ''} ${c ? c.name + ' அழைக்கவும்.' : ''} ambulance க்கு ஒன்று பூஜ்யம் எட்டு அழைக்கவும்.`,
    };

    // Preferred lang codes for each language
    const langPref = {
      en: ['en-IN', 'en-GB', 'en-US', 'en'],
      mr: ['mr-IN', 'mr', 'hi-IN', 'hi', 'en-IN', 'en'],
      hi: ['hi-IN', 'hi', 'en-IN', 'en'],
      te: ['te-IN', 'te', 'en-IN', 'en'],
      ta: ['ta-IN', 'ta', 'en-IN', 'en'],
    };

    const doSpeak = () => {
      const voices  = window.speechSynthesis.getVoices();
      const prefs   = langPref[lang] || langPref.en;
      let bestVoice = null;

      // Find best matching voice from preference list
      for (const code of prefs) {
        bestVoice = voices.find(v => v.lang === code)
                 || voices.find(v => v.lang.startsWith(code.split('-')[0]));
        if (bestVoice) break;
      }

      // Pick text — if no native voice found, fall back to English text
      const hasNativeVoice = bestVoice && bestVoice.lang.startsWith(prefs[0].split('-')[0]);
      const text = hasNativeVoice ? (texts[lang] || texts.en) : texts.en;
      const spokenLang = hasNativeVoice ? prefs[0] : 'en-IN';

      const u = new SpeechSynthesisUtterance(text);
      u.lang  = spokenLang;
      u.rate  = 0.85;
      u.pitch = 1;
      if (bestVoice) u.voice = bestVoice;
      u.onstart = () => setSpeaking(true);
      u.onend   = () => setSpeaking(false);
      u.onerror = () => { setSpeaking(false); };
      window.speechSynthesis.speak(u);
    };

    // Voices may not be loaded on first call — wait if needed
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        doSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      doSpeak();
    }
  }, [data, lang]);

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  const sendLocationSMS = () => {
    if (!location) { alert('Location not available.'); return; }
    const p = data?.profile || {};
    const c = data?.contacts?.[0];
    if (!c) { alert('No emergency contact found.'); return; }
    const mapsLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
    const messages = {
      en: `🚨 EMERGENCY!\n${p.full_name} met with an accident.\n📍 ${mapsLink}\n🩸 Blood: ${p.blood_type || 'Unknown'}\n⚠️ ${p.allergies || 'None'}\nCome immediately!`,
      mr: `🚨 आपत्काल!\n${p.full_name} ला अपघात झाला.\n📍 ${mapsLink}\n🩸 रक्तगट: ${p.blood_type || 'माहित नाही'}\n⚠️ ${p.allergies || 'नाही'}\nलगेच या!`,
      hi: `🚨 आपातकाल!\n${p.full_name} को दुर्घटना हुई।\n📍 ${mapsLink}\n🩸 रक्त: ${p.blood_type || 'अज्ञात'}\n⚠️ ${p.allergies || 'नहीं'}\nतुरंत आएं!`,
      te: `🚨 అత్యవసరం!\n${p.full_name} కి ప్రమాదం జరిగింది.\n📍 ${mapsLink}\n🩸 రక్తం: ${p.blood_type || 'తెలియదు'}\nవెంటనే రండి!`,
      ta: `🚨 அவசரநிலை!\n${p.full_name} விபத்தில் சிக்கினார்.\n📍 ${mapsLink}\n🩸 இரத்தம்: ${p.blood_type || 'தெரியவில்லை'}\nவாருங்கள்!`,
    };
    const phone = c.phone.replace(/\D/g,'');
    window.open(`sms:${phone}?body=${encodeURIComponent(messages[lang] || messages.en)}`, '_blank');
    setSmsSent(true); setTimeout(() => setSmsSent(false), 4000);
  };

  const findHospitals = () => {
    if (!location) { alert('Location not available.'); return; }
    setLoadingHosp(true);
    window.open(`https://www.google.com/maps/search/hospital/@${location.lat},${location.lng},15z`, '_blank');
    setTimeout(() => {
      setHospitals([
        { name:'Nearest Govt Hospital', dist:'Check Maps', phone:'108' },
        { name:'Sassoon General Hospital', dist:'Pune', phone:'02026128000' },
        { name:'Ambulance', dist:'—', phone:'108' },
      ]);
      setLoadingHosp(false);
    }, 800);
  };

  const card = { background:'#1e293b', borderRadius:16, padding:20, marginTop:16, boxShadow:'0 0 20px rgba(0,0,0,0.3)' };
  const bigBtn = (bg, disabled) => ({ background: disabled ? '#374151' : bg, border:'none', padding:'14px 20px', borderRadius:12, color:'white', fontSize:16, fontWeight:'bold', cursor: disabled ? 'not-allowed' : 'pointer', width:'100%', marginTop:8, opacity: disabled ? 0.6 : 1 });

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(180deg,#0f172a,#020617)', padding:16, color:'white', fontFamily:'sans-serif', maxWidth:480, margin:'0 auto' }}>

      {/* Language Selector */}
      <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {Object.entries(LANGS).map(([key, val]) => (
          <button key={key} onClick={() => setLang(key)} style={{ background: lang===key ? '#ef4444' : '#1e293b', border: lang===key ? '2px solid #ef4444' : '2px solid #334155', borderRadius:20, padding:'6px 14px', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            {val.flag} {val.name}
          </button>
        ))}
      </div>

      <h1 style={{ textAlign:'center', color:'#ef4444', marginBottom:20, fontSize:22 }}>{t.title}</h1>

      {!verified && (
        <div style={{ textAlign:'center', marginTop:60 }}>
          <button onClick={handleVerify} style={{ background:'#ef4444', padding:'16px 40px', border:'none', borderRadius:12, color:'white', fontSize:17, fontWeight:'bold', boxShadow:'0 4px 20px rgba(239,68,68,0.4)', cursor:'pointer' }}>
            {t.verify}
          </button>
        </div>
      )}

      {loading && <p style={{ textAlign:'center', marginTop:20 }}>{t.loading}</p>}
      {error   && <p style={{ textAlign:'center', color:'red', marginTop:20 }}>{error}</p>}

      {data && (<>

        {/* Profile */}
        <div style={card}>
          <h2 style={{ marginBottom:10, fontSize:18 }}>{t.profile}</h2>
          <h3 style={{ color:'#ef4444', marginBottom:10 }}>👤 {data.profile?.full_name || '—'}</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:15 }}>
            {data.profile?.gender        && <span>👩 {t.gender}: {data.profile.gender}</span>}
            {data.profile?.date_of_birth && <span>🎂 {t.dob}: {data.profile.date_of_birth}</span>}
            {data.profile?.blood_type    && <span style={{ color:'#ef4444', fontWeight:'bold', fontSize:20 }}>🩸 {t.blood}: {data.profile.blood_type}</span>}
            {data.profile?.address       && <span>📍 {data.profile.address}</span>}
          </div>
        </div>

        {/* Medical */}
        <div style={card}>
          <h2 style={{ marginBottom:12, fontSize:18 }}>{t.medical}</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:14 }}>
            <p>{t.allergies}: {data.profile?.allergies || t.none}</p>
            <p>{t.conditions}: {data.profile?.medical_conditions || t.none}</p>
            <p>{t.medications}: {data.profile?.current_medications || t.none}</p>
            {data.profile?.doctor_name  && <p>{t.doctor}: {data.profile.doctor_name}</p>}
            {data.profile?.doctor_phone && <p>📞 {data.profile.doctor_phone}</p>}
          </div>
        </div>

        {/* Contacts */}
        {data.contacts?.length > 0 && (
          <div style={card}>
            <h2 style={{ marginBottom:12, fontSize:18 }}>{t.contacts}</h2>
            {data.contacts.map((c) => (
              <div key={c.id} style={{ marginTop:10, padding:12, borderRadius:10, background:'#334155' }}>
                <p style={{ marginBottom:8, fontSize:15, fontWeight:600 }}>{c.name} ({c.relationship})</p>
                <a href={`tel:${c.phone}`} style={{ textDecoration:'none' }}>
                  <button style={bigBtn('#ef4444', false)}>{t.call}</button>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* FEATURE 1: Audio */}
        <div style={card}>
          <h2 style={{ marginBottom:6, fontSize:18 }}>{t.audioTitle}</h2>
          <p style={{ fontSize:13, color:'#94a3b8', marginBottom:10 }}>{t.audioDesc}</p>
          {!speaking
            ? <button onClick={speakEmergency} style={bigBtn('#1d4ed8', false)}>{t.audio}</button>
            : <button onClick={stopSpeaking}   style={bigBtn('#64748b', false)}>{t.audioStop}</button>
          }
        </div>

        {/* FEATURE 2: Location SMS */}
        <div style={card}>
          <h2 style={{ marginBottom:6, fontSize:18 }}>{t.locationTitle}</h2>
          <p style={{ fontSize:13, color: location ? '#4ade80' : '#f59e0b', marginBottom:10 }}>
            {location ? `${t.locationReady}: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : t.locationWait}
          </p>
          <button onClick={sendLocationSMS} disabled={!location} style={bigBtn('#16a34a', !location)}>
            {smsSent ? t.locationSent : t.locationBtn}
          </button>
          <p style={{ fontSize:11, color:'#64748b', marginTop:6, textAlign:'center' }}>{t.locationNote}</p>
        </div>

        {/* FEATURE 3: Hospital */}
        <div style={card}>
          <h2 style={{ marginBottom:10, fontSize:18 }}>{t.hospTitle}</h2>
          <button onClick={findHospitals} disabled={loadingHosp} style={bigBtn('#7c3aed', false)}>
            {loadingHosp ? t.hospLoading : t.hospBtn}
          </button>
          {hospitals.length > 0 && (
            <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
              {hospitals.map((h,i) => (
                <div key={i} style={{ background:'#334155', borderRadius:10, padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>🏥 {h.name}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>📍 {h.dist}</div>
                  </div>
                  <a href={`tel:${h.phone}`} style={{ textDecoration:'none' }}>
                    <button style={{ background:'#7c3aed', border:'none', borderRadius:8, padding:'8px 14px', color:'white', fontWeight:'bold', cursor:'pointer', fontSize:14 }}>📞</button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Numbers */}
        <div style={card}>
          <h2 style={{ marginBottom:12, fontSize:18 }}>{t.emergency}</h2>
          <div style={{ display:'flex', gap:10 }}>
            {[{label:'🚑 108',num:'108'},{label:'🆘 112',num:'112'},{label:'👮 100',num:'100'}].map(e => (
              <a key={e.num} href={`tel:${e.num}`} style={{ flex:1, textDecoration:'none' }}>
                <button style={{ background:'#1e293b', border:'2px solid #ef4444', borderRadius:10, padding:'12px 6px', color:'white', fontWeight:'bold', cursor:'pointer', width:'100%', fontSize:14 }}>
                  {e.label}
                </button>
              </a>
            ))}
          </div>
        </div>

        <div style={{ height:40 }} />
      </>)}
    </div>
  );
}