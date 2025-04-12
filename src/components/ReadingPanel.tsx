import React, { useState, useRef, useEffect } from 'react';
import { useDyslexiaSettings } from '../contexts/DyslexiaContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Pause, SkipForward, RotateCcw, X, Sparkles } from 'lucide-react';
import { textToSpeech } from '../utils/textToSpeech';

interface ReadingPanelProps {
  visible: boolean;
  onClose: () => void;
  contentToRead: string;
}

const ReadingPanel: React.FC<ReadingPanelProps> = ({ visible, onClose, contentToRead }) => {
  const { settings } = useDyslexiaSettings();
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);
  const [isSimplified, setIsSimplified] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const words = (isSimplified && simplifiedContent ? simplifiedContent : contentToRead).split(/\s+/);
  
  // Setup text-to-speech handling
  useEffect(() => {
    textToSpeech.setCallbacks({
      onStart: () => {
        setIsReading(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsReading(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
      },
      onPause: () => {
        setIsPaused(true);
      },
      onResume: () => {
        setIsPaused(false);
      },
      onWordBoundary: (event) => {
        // Calculate current word index based on character position
        const text = isSimplified && simplifiedContent ? simplifiedContent : contentToRead;
        const charIndex = event.charIndex;
        const wordsUpToChar = text.substring(0, charIndex).split(/\s+/).length - 1;
        setCurrentWordIndex(wordsUpToChar);
        
        // Auto-scroll to keep the current word in view
        if (contentRef.current) {
          const wordElements = contentRef.current.querySelectorAll('.word');
          if (wordElements[wordsUpToChar]) {
            wordElements[wordsUpToChar].scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      },
    });
    
    return () => {
      textToSpeech.stop();
    };
  }, [contentToRead, simplifiedContent, isSimplified]);
  
  const startReading = () => {
    const textToRead = isSimplified && simplifiedContent ? simplifiedContent : contentToRead;
    textToSpeech.speak(textToRead, settings.speechRate);
  };
  
  const pauseReading = () => {
    if (isPaused) {
      textToSpeech.resume();
    } else {
      textToSpeech.pause();
    }
  };
  
  const stopReading = () => {
    textToSpeech.stop();
    setIsReading(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  };
  
  const skipSentence = () => {
    // This is a simplified implementation
    // In a full extension, you would need more sophisticated text parsing
    if (currentWordIndex >= 0) {
      const currentText = isSimplified && simplifiedContent ? simplifiedContent : contentToRead;
      const remainingText = currentText.split(/\s+/).slice(currentWordIndex + 10).join(' ');
      if (remainingText) {
        stopReading();
        setTimeout(() => {
          textToSpeech.speak(remainingText, settings.speechRate);
        }, 100);
      }
    }
  };
  
  const simplifyContent = () => {
    setIsSimplifying(true);
    
    // Simulate API call to a summarization service
    setTimeout(() => {
      // This is where we would normally call an API
      // For this demo, we'll just create a simpler version of the text
      const simplified = contentToRead
        .split('. ')
        .map(sentence => {
          // Simplify long sentences by breaking them up
          if (sentence.split(' ').length > 10) {
            return sentence
              .split(' ')
              .filter((_, i) => i % 3 !== 1) // Remove some words to simulate simplification
              .join(' ');
          }
          return sentence;
        })
        .join('. ')
        .replace(/([a-z])\-([a-z])/gi, '$1$2') // Remove hyphens
        .replace(/\b(\w{10,})\b/g, (match) => match.substring(0, 7) + '...'); // Simplify long words
      
      setSimplifiedContent(simplified);
      setIsSimplified(true);
      setIsSimplifying(false);
    }, 1500);
  };
  
  const toggleSimplified = () => {
    if (!simplifiedContent && !isSimplified) {
      simplifyContent();
    } else {
      setIsSimplified(!isSimplified);
    }
    
    // If currently reading, restart with the new content
    if (isReading) {
      stopReading();
      setTimeout(startReading, 100);
    }
  };
  
  if (!visible) return null;
  
  return (
    <Card className="fixed bottom-4 right-4 w-[500px] max-w-[calc(100vw-2rem)] shadow-lg z-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Read Along Mode</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Reading Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={isReading ? pauseReading : startReading}
            >
              {isReading && !isPaused ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={skipSentence}
              disabled={!isReading}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={stopReading}
              disabled={!isReading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSimplified}
            disabled={isSimplifying}
            className="flex items-center space-x-1"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isSimplifying ? 'Simplifying...' : isSimplified ? 'Original Text' : 'Simplify Text'}
          </Button>
        </div>
        
        {/* Reading Content */}
        <div 
          className={`h-[300px] overflow-y-auto p-4 border rounded-md ${
            isSimplified ? 'bg-primary/5' : 'bg-background'
          }`}
          style={{
            lineHeight: `${settings.lineSpacing * 1.5}rem`,
            letterSpacing: `${settings.letterSpacing * 0.02}rem`,
          }}
          ref={contentRef}
        >
          <div className={`${settings.font === 'opendyslexic' ? 'font-opendyslexic' : ''}`}>
            {words.map((word, index) => (
              <span 
                key={index}
                className={`word ${index === currentWordIndex ? 'highlight-word' : ''}`}
              >
                {word}{' '}
              </span>
            ))}
          </div>
        </div>
        
        {isSimplified && (
          <div className="text-xs text-muted-foreground italic">
            Note: The text has been simplified for easier reading. This is a simulation of what an AI-powered
            simplification feature would do in the full extension.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadingPanel;
