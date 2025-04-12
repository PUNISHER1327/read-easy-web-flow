
import React, { useState, useRef, useEffect } from 'react';
import { useDyslexiaSettings } from '../contexts/DyslexiaContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Pause, SkipForward, RotateCcw, X, Sparkles, VolumeX, Volume2 } from 'lucide-react';
import { textToSpeech } from '../utils/textToSpeech';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ReadingPanelProps {
  visible: boolean;
  onClose: () => void;
  contentToRead: string;
}

const ReadingPanel: React.FC<ReadingPanelProps> = ({ visible, onClose, contentToRead }) => {
  const { settings, updateSettings } = useDyslexiaSettings();
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);
  const [isSimplified, setIsSimplified] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, this would control the speech synthesis volume
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    setIsMuted(newVolume[0] === 0);
    // In a real implementation, this would control the speech synthesis volume
  };
  
  if (!visible) return null;
  
  return (
    <TooltipProvider>
      <Card className="fixed bottom-4 right-4 w-[500px] max-w-[calc(100vw-2rem)] shadow-lg z-50 animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
              Read Along Mode
            </Badge>
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-destructive/10">
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close read along mode</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        
        <CardContent className="space-y-4 p-4">
          {/* Reading Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isReading ? pauseReading : startReading}
                    className="hover-scale"
                  >
                    {isReading && !isPaused ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isReading && !isPaused ? "Pause" : "Play"}</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={skipSentence}
                    disabled={!isReading}
                    className="hover-scale"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Skip ahead</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={stopReading}
                    disabled={!isReading}
                    className="hover-scale"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Restart</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" 
                    size="icon"
                    onClick={toggleMute}
                    className="hover-scale"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMuted ? "Unmute" : "Mute"}</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="w-24">
                <Slider
                  value={[volume]} 
                  min={0} 
                  max={1} 
                  step={0.1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSimplified ? "secondary" : "outline"}
                  size="sm"
                  onClick={toggleSimplified}
                  disabled={isSimplifying}
                  className="flex items-center space-x-1 hover-scale"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isSimplifying ? 'Simplifying...' : isSimplified ? 'Original Text' : 'Simplify Text'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSimplified ? "Show original text" : "Show simplified version"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Reading Content */}
          <div 
            className={`h-[300px] overflow-y-auto p-4 border rounded-md transition-colors duration-300 ${
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
            <div className="text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-2 bg-muted/10 p-2 rounded">
              <p className="font-medium text-sm mb-1">Simplified Text</p>
              <p>This is a simulation of AI-powered text simplification that would be available in the full extension.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ReadingPanel;
