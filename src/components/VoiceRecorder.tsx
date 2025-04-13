
import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { audioRecorder } from '../utils/audioRecorder';
import { Mic, MicOff, Save, X } from 'lucide-react';
import { toast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog';

interface VoiceRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ open, onOpenChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [fileName, setFileName] = useState('voice-note');
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStartRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setAudioURL(null);
      toast({
        title: "Recording started",
        description: "Your voice is now being recorded"
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      const audioBlob = await audioRecorder.stopRecording();
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Your recording is ready to be saved"
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
    }
  };

  const handleSaveRecording = () => {
    if (!audioURL) return;
    
    // Create a download link
    const a = document.createElement('a');
    a.href = audioURL;
    a.download = `${fileName || 'voice-note'}.wav`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    
    toast({
      title: "Recording saved",
      description: `Saved as "${fileName}.wav"`
    });
  };

  const handleClose = () => {
    if (isRecording) {
      audioRecorder.stopRecording().catch(err => console.error('Error stopping recording:', err));
    }
    
    // Revoke URL to avoid memory leaks
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    // Reset state
    setIsRecording(false);
    setAudioURL(null);
    setFileName('voice-note');
    
    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Recorder</DialogTitle>
          <DialogDescription>
            Record your voice notes for easier note-taking
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 my-4">
          <div className="flex justify-center my-2">
            {isRecording ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-2">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <span className="text-sm">Recording...</span>
              </div>
            ) : (
              <Button 
                onClick={handleStartRecording} 
                variant="outline" 
                size="lg" 
                className="w-16 h-16 rounded-full"
                disabled={!!audioURL}
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}
          </div>
          
          {audioURL && (
            <div className="border rounded-md p-3">
              <audio ref={audioRef} src={audioURL} controls className="w-full" />
            </div>
          )}
          
          {!audioURL ? (
            <div className="flex justify-center">
              {isRecording && (
                <Button 
                  onClick={handleStopRecording} 
                  variant="destructive"
                >
                  <MicOff className="mr-2 h-4 w-4" /> Stop Recording
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                />
                <span className="text-sm text-muted-foreground">.wav</span>
              </div>
              
              <Button 
                onClick={handleSaveRecording} 
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" /> Save Recording
              </Button>
            </div>
          )}
        </div>
        
        <DialogClose asChild>
          <Button 
            type="button" 
            variant="ghost" 
            className="absolute right-4 top-4"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceRecorder;
