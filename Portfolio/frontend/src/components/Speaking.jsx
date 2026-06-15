import React from 'react';

const Speaking = () => {
  return (
    <section className="section bg-blue" style={{ alignItems: 'center' }}>
      <h2 className="glitch-text" style={{ fontSize: '3rem', marginBottom: '2rem', alignSelf: 'flex-start' }}>PUBLIC SPEAKING</h2>
      
      <div className="brutal-card" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {[1, 2, 3].map((slide) => (
            <div key={slide} style={{ 
              minWidth: '250px', 
              height: '150px', 
              backgroundColor: '#333',
              border: '2px solid #000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--pastel-blue)',
              fontFamily: 'Press Start 2P',
              fontSize: '0.8rem'
            }}>
              SLIDE {slide}
            </div>
          ))}
        </div>
        
        <div>
          <h3>THE ART OF PROMPT INJECTION</h3>
          <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>
            I recently spoke at a local cybersecurity meetup discussing the vulnerabilities in modern LLMs. 
            We explored how prompt injection attacks can bypass standard safety filters, and I demonstrated 
            my custom Prompt Injection Checker tool built with Python. 
            The interactive session allowed attendees to attempt their own jailbreaks on a sandbox LLM instance!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Speaking;
