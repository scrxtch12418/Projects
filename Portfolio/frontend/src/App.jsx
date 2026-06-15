import React, { useEffect, useState } from 'react';
import './index.css';
import Hero from './components/Hero';
import Resume from './components/Resume';
import Designs from './components/Designs';
import Speaking from './components/Speaking';
import Quizzes from './components/Quizzes';
import Contact from './components/Contact';
import Platformer from './components/Platformer';

function App() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorHover, setCursorHover] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    
    // Add event listeners for hover state on interactive elements
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button' || e.target.closest('button') || e.target.closest('a')) {
        setCursorHover(true);
      } else {
        setCursorHover(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div className="crt pointer-events-none"></div>
      
      <div 
        className={`custom-cursor ${cursorHover ? 'hover' : ''}`}
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      ></div>

      <div className="snap-container">
        <Hero />
        <Resume />
        <Designs />
        <Speaking />
        <Quizzes />
        <Contact />
      </div>
      
      <Platformer />
    </>
  );
}

export default App;
