import React from 'react';

const Contact = () => {
  return (
    <section className="section bg-yellow" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <h2 className="glitch-text" style={{ fontSize: '4rem', marginBottom: '3rem' }}>CONTACT_ME</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '800px' }}>
        <a href="mailto:sarvasva5758@gmail.com" className="brutal-card" style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: 'var(--pastel-pink)' }}>
          <h3>EMAIL</h3>
          <p style={{ marginTop: '1rem', fontFamily: 'Courier New, monospace' }}>sarvasva5758@gmail.com</p>
        </a>
        
        <a href="https://github.com/scrxtch12418" target="_blank" rel="noreferrer" className="brutal-card" style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: 'var(--pastel-blue)' }}>
          <h3>GITHUB</h3>
          <p style={{ marginTop: '1rem', fontFamily: 'Courier New, monospace' }}>github.com/scrxtch12418</p>
        </a>
        
        <a href="https://linkedin.com/in/sarvasva-s-4470562b4" target="_blank" rel="noreferrer" className="brutal-card" style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: 'var(--pastel-green)' }}>
          <h3>LINKEDIN</h3>
          <p style={{ marginTop: '1rem', fontFamily: 'Courier New, monospace' }}>/in/sarvasva-s-4470562b4</p>
        </a>
        
        <div className="brutal-card" style={{ textAlign: 'center', backgroundColor: 'var(--pastel-purple)' }}>
          <h3>COMMLINK</h3>
          <p style={{ marginTop: '1rem', fontFamily: 'Courier New, monospace' }}>+1 861-897-1296</p>
        </div>
      </div>
      
      <p className="retro-font" style={{ position: 'absolute', bottom: '2rem', fontSize: '0.8rem', animation: 'blink 1s infinite' }}>END OF TRANSMISSION</p>
    </section>
  );
};

export default Contact;
