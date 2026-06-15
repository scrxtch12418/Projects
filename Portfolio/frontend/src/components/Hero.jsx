import React from 'react';
import profileImg from '../assets/profile.png';

const Hero = () => {
  return (
    <section className="section bg-pink" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <h1 className="glitch-text" style={{ fontSize: '10vw', margin: 0, lineHeight: 1 }}>PORTFOLIO</h1>
      <div className="brutal-card" style={{ marginTop: '2rem', display: 'inline-block', transform: 'rotate(-3deg)' }}>
        <img 
          src={profileImg} 
          alt="Sarvasva" 
          style={{ width: '300px', height: '300px', objectFit: 'cover', border: 'var(--brutal-border)' }}
        />
        <h2 style={{ marginTop: '1rem', fontSize: '1.5rem' }}>SARVASVA</h2>
      </div>
      <div style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}>
        <p className="retro-font">PRESS START</p>
        <p className="retro-font" style={{ fontSize: '0.8rem', marginTop: '0.5rem', animation: 'blink 1s infinite' }}>SCROLL DOWN v</p>
      </div>
      <style>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
