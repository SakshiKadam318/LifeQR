import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{minHeight:'100vh', background:'var(--bg)', overflowX:'hidden'}}>
      {/* Hero */}
      <div style={{
        minHeight:'100vh',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        textAlign:'center',
        padding:'40px 20px',
        position:'relative'
      }}>
        {/* Glow BG */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:600, height:600,
          background:'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
          pointerEvents:'none'
        }}/>

        <div style={{
          display:'inline-flex', alignItems:'center', gap:8,
          background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
          borderRadius:999, padding:'6px 16px', marginBottom:32,
          fontSize:13, fontWeight:600, color:'var(--red-light)'
        }}>
          ❤️ Saving lives, one scan at a time
        </div>

        <h1 style={{
          fontFamily:'Space Grotesk', fontSize:'clamp(42px, 7vw, 80px)',
          fontWeight:700, lineHeight:1.1, marginBottom:24,
          background:'linear-gradient(135deg, #f1f5f9 40%, #ef4444)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
        }}>
          One QR Code.<br/>One Saved Life.
        </h1>

        <p style={{
          fontSize:18, color:'var(--text2)', maxWidth:520, lineHeight:1.7, marginBottom:40
        }}>
          LifeQR stores your medical info and emergency contacts behind a QR code. 
          When you can't speak — your QR code speaks for you.
        </p>

        <div style={{display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center'}}>
          <Link to="/register" className="btn btn-primary btn-lg">
            🛡️ Create Your LifeQR
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display:'flex', gap:48, marginTop:80, flexWrap:'wrap', justifyContent:'center'
        }}>
          {[
            { num:'3 sec', label:'Average scan time' },
            { num:'100%', label:'Works offline' },
            { num:'0', label:'Numbers shown to strangers' }
          ].map(s => (
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Space Grotesk', fontSize:32, fontWeight:700, color:'var(--red)'}}>{s.num}</div>
              <div style={{fontSize:13, color:'var(--text3)', marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{
        background:'var(--bg2)',
        borderTop:'1px solid var(--border)',
        padding:'80px 20px'
      }}>
        <div style={{maxWidth:800, margin:'0 auto', textAlign:'center'}}>
          <h2 style={{fontFamily:'Space Grotesk', fontSize:36, fontWeight:700, marginBottom:16}}>
            How LifeQR works
          </h2>
          <p style={{color:'var(--text2)', marginBottom:60}}>Simple for you. Life-saving for rescuers.</p>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:24}}>
            {[
              { step:'01', icon:'📝', title:'Register & fill info', desc:'Add your medical history, blood type, allergies and emergency contacts.' },
              { step:'02', icon:'🔲', title:'Generate QR code', desc:'A unique encrypted QR code is created linked to your profile.' },
              { step:'03', icon:'🖨️', title:'Print or save it', desc:'Print it on a card, sticker, or save on your phone lock screen.' },
              { step:'04', icon:'📱', title:'Rescuer scans', desc:'Anyone with a phone camera can scan your QR in an emergency.' },
              { step:'05', icon:'🔒', title:'Fingerprint logged', desc:'The rescuer\'s fingerprint is logged for accountability and safety.' },
              { step:'06', icon:'📞', title:'Family called', desc:'One tap on "Call Now" connects the rescuer to your emergency contact.' }
            ].map(item => (
              <div key={item.step} className="card" style={{textAlign:'left', position:'relative'}}>
                <div style={{
                  fontFamily:'Space Grotesk', fontSize:12, fontWeight:700,
                  color:'var(--red)', marginBottom:12, letterSpacing:'0.1em'
                }}>STEP {item.step}</div>
                <div style={{fontSize:28, marginBottom:12}}>{item.icon}</div>
                <div style={{fontFamily:'Space Grotesk', fontWeight:600, marginBottom:8}}>{item.title}</div>
                <div style={{fontSize:14, color:'var(--text2)', lineHeight:1.6}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:'80px 20px', textAlign:'center'}}>
        <h2 style={{fontFamily:'Space Grotesk', fontSize:36, fontWeight:700, marginBottom:16}}>
          Your safety card, always with you
        </h2>
        <p style={{color:'var(--text2)', marginBottom:40}}>Free to create. Priceless in an emergency.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Get Started — It's Free
        </Link>
      </div>
    </div>
  );
}
