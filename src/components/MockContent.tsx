
import React, { useRef } from 'react';
import { useDyslexiaSettings } from '../contexts/DyslexiaContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { VolumeIcon } from 'lucide-react';
import { textToSpeech } from '../utils/textToSpeech';

const MockContent: React.FC = () => {
  const { settings } = useDyslexiaSettings();
  const articleRef = useRef<HTMLDivElement>(null);
  
  const paragraphs = [
    "Dyslexia is a learning disorder that involves difficulty reading due to problems identifying speech sounds and learning how they relate to letters and words. Also called reading disability, dyslexia affects areas of the brain that process language.",
    "People with dyslexia have normal intelligence and usually have normal vision. Most children with dyslexia can succeed in school with tutoring or a specialized education program. Emotional support also plays an important role.",
    "Though there's no cure for dyslexia, early assessment and intervention result in the best outcome. Sometimes dyslexia goes undiagnosed for years and isn't recognized until adulthood, but it's never too late to seek help."
  ];

  const paragraphs2 = [
    "The brain changes and develops in remarkable ways during the early years of life. But these changes don't stop at childhood. The brain continues to develop and establish neural connections throughout life.",
    "Neuroplasticity is the brain's ability to change and adapt as a result of experience. When people repeatedly practice an activity or access a memory, their neural networks — groups of neurons that fire together, creating electrochemical pathways — shape themselves according to that activity or memory.",
    "If certain neural networks in the brain are damaged due to illness or injury, sometimes other, undamaged networks can take over and carry out the function. This is known as reorganization. During reorganization, the brain compensates for damage in one area by reassigning the task to a different region of the brain.",
    "The ability of the brain to compensate for damage by forming new connections is especially important during rehabilitation after a traumatic brain injury, stroke, or other neurological condition. Neuroplasticity allows patients to recover from stroke, learning disorders, and even effects of emotional trauma."
  ];

  // Apply dyslexia-friendly styling if enabled
  const getContentStyle = () => {
    if (!settings.enabled) return {};
    
    let fontFamily = '';
    if (settings.font === 'opendyslexic') fontFamily = 'OpenDyslexic, sans-serif';
    else if (settings.font === 'dyslexie') fontFamily = 'Dyslexie, sans-serif';
    
    let backgroundColor = '';
    if (settings.backgroundColor !== 'default') {
      backgroundColor = `var(--dyslexia-${settings.backgroundColor})`;
    }
    
    return {
      fontFamily,
      backgroundColor,
      lineHeight: `${settings.lineSpacing * 1.5}`,
      letterSpacing: `${settings.letterSpacing * 0.02}rem`,
    };
  };

  const handleReadParagraph = (text: string) => {
    textToSpeech.speak(text, settings.speechRate);
  };

  return (
    <div 
      ref={articleRef}
      className={`max-w-3xl mx-auto py-8 px-4 sm:px-6 ${
        settings.enabled && settings.reduceVisualNoise ? 'simplify-content' : ''
      }`}
      style={getContentStyle()}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">Understanding Dyslexia</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">What Is Dyslexia?</h2>
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <div key={index} className="group relative">
                <p className="mb-4">{paragraph}</p>
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleReadParagraph(paragraph)}
                    className="h-8 w-8"
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Brain Plasticity and Learning</h2>
          <div className="space-y-4">
            {paragraphs2.map((paragraph, index) => (
              <div key={index} className="group relative">
                <p className="mb-4">{paragraph}</p>
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleReadParagraph(paragraph)}
                    className="h-8 w-8"
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Symptoms of Dyslexia</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Difficulty reading, including reading aloud</li>
                <li>Slow and labor-intensive reading and writing</li>
                <li>Problems spelling</li>
                <li>Avoiding activities that involve reading</li>
                <li>Mispronouncing names or words, or problems retrieving words</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center"
                onClick={() => handleReadParagraph("Symptoms of Dyslexia include: Difficulty reading, including reading aloud. Slow and labor-intensive reading and writing. Problems spelling. Avoiding activities that involve reading. Mispronouncing names or words, or problems retrieving words.")}
              >
                <VolumeIcon className="h-4 w-4 mr-2" />
                Read Aloud
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Support Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Early phonological awareness training</li>
                <li>Multisensory structured language education</li>
                <li>Accommodations like extra time for tests</li>
                <li>Assistive technology (text-to-speech, audiobooks)</li>
                <li>Emotional support and understanding</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center"
                onClick={() => handleReadParagraph("Support Strategies include: Early phonological awareness training. Multisensory structured language education. Accommodations like extra time for tests. Assistive technology such as text-to-speech and audiobooks. Emotional support and understanding.")}
              >
                <VolumeIcon className="h-4 w-4 mr-2" />
                Read Aloud
              </Button>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default MockContent;
