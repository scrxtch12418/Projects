import React, { useState, useEffect } from 'react';

const Platformer = () => {
  const [pos, setPos] = useState({ x: 50, y: window.innerHeight - 100 });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const step = 20;
      setPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        if (e.key === 'ArrowRight') newX += step;
        if (e.key === 'ArrowLeft') newX -= step;
        // Simple jump (no physics, just moves up then down would be complex in this simple state, let's just do up/down movement for now)
        if (e.key === 'ArrowUp') newY -= step * 3;
        if (e.key === 'ArrowDown') newY += step;
        
        // Boundaries
        newX = Math.max(0, Math.min(window.innerWidth - 32, newX));
        
        return { x: newX, y: newY };
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple gravity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPos(prev => {
        const floor = window.innerHeight - 100;
        if (prev.y < floor) {
          return { ...prev, y: Math.min(floor, prev.y + 10) }; // Fall down
        }
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="platformer-char" 
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      title="Use Arrow Keys to Move!"
    >
      <div style={{ width: '6px', height: '6px', backgroundColor: '#000', position: 'absolute', top: '8px', right: '4px' }}></div>
      <div style={{ width: '6px', height: '6px', backgroundColor: '#000', position: 'absolute', top: '8px', left: '8px' }}></div>
    </div>
  );
};

export default Platformer;
