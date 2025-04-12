
import React, { useState } from 'react';
import { DyslexiaProvider } from '../contexts/DyslexiaContext';
import DyslexiaToolbar from './DyslexiaToolbar';
import DyslexiaSettings from './DyslexiaSettings';
import ReadingPanel from './ReadingPanel';
import MockContent from './MockContent';
import { textToSpeech } from '../utils/textToSpeech';

const DyslexiaExtension: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readModeVisible, setReadModeVisible] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
  const handleToggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  
  const handleToggleReadMode = () => {
    setReadModeVisible(!readModeVisible);
    // Stop reading if read mode is closed
    if (readModeVisible) {
      textToSpeech.stop();
      setIsReading(false);
    }
  };
  
  const handleStartReading = () => {
    // In a real extension, we would parse content from the selected element
    // or visible content on the page
    const content = document.querySelector('main')?.textContent || '';
    textToSpeech.speak(content);
    setIsReading(true);
  };
  
  const handlePauseReading = () => {
    if (textToSpeech.getStatus().isPaused) {
      textToSpeech.resume();
    } else {
      textToSpeech.pause();
    }
  };
  
  return (
    <DyslexiaProvider>
      <div className="min-h-screen flex flex-col">
        <header className="bg-background z-10 border-b sticky top-0">
          <div className="container mx-auto py-2">
            <DyslexiaToolbar 
              onToggleSettings={handleToggleSettings}
              onToggleReadMode={handleToggleReadMode}
              isReading={isReading}
              onStartReading={handleStartReading}
              onPauseReading={handlePauseReading}
            />
          </div>
        </header>
        
        <main className="flex-1">
          <MockContent />
        </main>
        
        <DyslexiaSettings 
          open={settingsOpen} 
          onOpenChange={setSettingsOpen} 
        />
        
        <ReadingPanel 
          visible={readModeVisible}
          onClose={handleToggleReadMode}
          contentToRead={`
            Understanding Dyslexia
            
            What Is Dyslexia?
            
            Dyslexia is a learning disorder that involves difficulty reading due to problems identifying speech sounds and learning how they relate to letters and words. Also called reading disability, dyslexia affects areas of the brain that process language.
            
            People with dyslexia have normal intelligence and usually have normal vision. Most children with dyslexia can succeed in school with tutoring or a specialized education program. Emotional support also plays an important role.
            
            Though there's no cure for dyslexia, early assessment and intervention result in the best outcome. Sometimes dyslexia goes undiagnosed for years and isn't recognized until adulthood, but it's never too late to seek help.
            
            Brain Plasticity and Learning
            
            The brain changes and develops in remarkable ways during the early years of life. But these changes don't stop at childhood. The brain continues to develop and establish neural connections throughout life.
          `}
        />
      </div>
    </DyslexiaProvider>
  );
};

export default DyslexiaExtension;
