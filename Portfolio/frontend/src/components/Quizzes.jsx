import React, { useState } from 'react';

const questions = [
  {
    q: "What does RAT stand for in Cybersecurity?",
    opts: ["Random Access Token", "Remote Access Trojan", "Read And Transmit", "Routing Address Table"],
    ans: 1
  },
  {
    q: "Which port is typically used for HTTPS?",
    opts: ["80", "22", "443", "8080"],
    ans: 2
  }
];

const Quizzes = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (idx) => {
    if (idx === questions[currentQ].ans) {
      setScore(score + 1);
    }
    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
      setCurrentQ(nextQ);
    } else {
      setShowResult(true);
    }
  };

  return (
    <section className="section bg-pink" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <h2 className="glitch-text" style={{ fontSize: '3rem', marginBottom: '2rem', position: 'absolute', top: '4rem', left: '4rem' }}>QUIZ ARENA</h2>
      
      <div className="brutal-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        {showResult ? (
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>MISSION COMPLETE</h3>
            <p style={{ fontSize: '1.5rem' }}>SCORE: {score}/{questions.length}</p>
            <button className="brutal-button" onClick={() => { setCurrentQ(0); setScore(0); setShowResult(false); }}>PLAY AGAIN</button>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '2rem' }}>{questions[currentQ].q}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions[currentQ].opts.map((opt, idx) => (
                <button 
                  key={idx} 
                  className="brutal-button" 
                  style={{ width: '100%', textAlign: 'left', backgroundColor: 'var(--pastel-yellow)' }}
                  onClick={() => handleAnswer(idx)}
                >
                  {idx + 1}. {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Quizzes;
