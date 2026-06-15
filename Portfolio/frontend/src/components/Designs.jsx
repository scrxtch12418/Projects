import React from 'react';

const Designs = () => {
  return (
    <section className="section bg-purple" style={{ alignItems: 'center' }}>
      <h2 className="glitch-text" style={{ fontSize: '3rem', marginBottom: '2rem', alignSelf: 'flex-start' }}>DESIGNS GALLERY</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%' }}>
        {[1, 2, 3].map((item) => (
          <div key={item} className="brutal-card" style={{ padding: '1rem', transform: `rotate(${Math.random() * 6 - 3}deg)` }}>
            <div style={{ 
              width: '100%', 
              height: '250px', 
              backgroundColor: '#333', 
              border: 'var(--brutal-border)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--pastel-green)',
              fontFamily: 'Press Start 2P'
            }}>
              IMAGE_{item}.PNG
            </div>
            <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>PROJECT {item} - UI/UX DESIGN</p>
          </div>
        ))}
      </div>
      
      <a href="#" className="brutal-button" style={{ alignSelf: 'flex-start', marginTop: '3rem', backgroundColor: 'var(--pastel-green)' }}>VIEW MORE ON BEHANCE</a>
    </section>
  );
};

export default Designs;
