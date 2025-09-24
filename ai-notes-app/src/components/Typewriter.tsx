import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  infinite?: boolean;
  onComplete?: () => void;
  className?: string;
  cursor?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  delay = 100,
  infinite = false,
  onComplete,
  className = '',
  cursor = true
}) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentIndex <= text.length) {
      timeout = setTimeout(() => {
        setCurrentText(text.slice(0, currentIndex));
        setCurrentIndex(prev => prev + 1);
      }, delay);
    } else if (!isDeleting && currentIndex > text.length) {
      if (infinite) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1000);
      } else {
        onComplete?.();
      }
    } else if (isDeleting && currentIndex > 0) {
      timeout = setTimeout(() => {
        setCurrentText(text.slice(0, currentIndex - 1));
        setCurrentIndex(prev => prev - 1);
      }, delay / 2);
    } else if (isDeleting && currentIndex === 0) {
      setIsDeleting(false);
      setCurrentIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, text, delay, infinite, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor) return;
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [cursor]);

  return (
    <span className={className}>
      {currentText}
      {cursor && (
        <span 
          className={`inline-block w-0.5 h-5 bg-current ml-1 transition-opacity duration-100 ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </span>
  );
};

export default Typewriter;