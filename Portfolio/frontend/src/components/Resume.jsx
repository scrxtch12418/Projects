import React from 'react';

const Resume = () => {
  return (
    <section className="section bg-yellow" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '4rem' }}>
      <div style={{ gridColumn: '1 / -1' }}>
        <h2 className="glitch-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>RESUME [LVL 21]</h2>
      </div>
      
      <div className="brutal-card">
        <h3><span style={{ color: 'var(--neon-pink)' }}>&gt;</span> EXPERIENCE</h3>
        <div style={{ marginTop: '1rem' }}>
          <h4>Software Dev Intern</h4>
          <p style={{ fontWeight: 'bold' }}>AIC NITTE Incubation Center</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Jun 2024 - Aug 2024</p>
          <ul>
            <li>Prototyped hardware components by designing & 3D-printing enclosures.</li>
            <li>Developed Arduino firmware for embedded sensor modules.</li>
            <li>Researched prompt engineering strategies for LLM output optimization.</li>
          </ul>
        </div>
      </div>

      <div className="brutal-card">
        <h3><span style={{ color: 'var(--neon-cyan)' }}>&gt;</span> EDUCATION</h3>
        <div style={{ marginTop: '1rem' }}>
          <h4>NMAM Institute of Technology</h4>
          <p>B.Tech in Computer Science and Engineering</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Aug 2024 - May 2028</p>
          
          <h4>Expert PU College</h4>
          <p>Higher Secondary Certificate (12th)</p>
          <p style={{ fontSize: '0.9rem' }}>Jun 2022 - Apr 2024</p>
        </div>
      </div>

      <div className="brutal-card" style={{ gridColumn: '1 / -1' }}>
        <h3><span style={{ color: 'var(--pastel-purple)' }}>&gt;</span> SKILLS & STATS</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          
          <div>
            <p>PYTHON / JS / C#</p>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          <div>
            <p>CYBERSECURITY / PENTESTING</p>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: '85%', backgroundColor: 'var(--pastel-pink)' }}></div>
            </div>
          </div>
          
          <div>
            <p>AI / ML / LLMs</p>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: '75%', backgroundColor: 'var(--pastel-blue)' }}></div>
            </div>
          </div>
          
          <div>
            <p>REACT / FASTAPI / NODE</p>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: '80%', backgroundColor: 'var(--neon-cyan)' }}></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Resume;
