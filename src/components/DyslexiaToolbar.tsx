
import React, { useState, useEffect } from 'react';
import { FontType, BackgroundType, useDyslexiaSettings } from '../contexts/DyslexiaContext';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Type, 
  PaintBucket, 
  ArrowUpDown,
  MoveHorizontal,
  EyeOff, 
  Play, 
  Pause, 
  Settings,
  BookOpen,
  MicIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { textToSpeech } from '../utils/textToSpeech';
import { voiceActivation } from '../utils/voiceActivation';
import { toast } from './ui/use-toast';

interface DyslexiaToolbarProps {
  onToggleSettings: () => void;
  onToggleReadMode: () => void;
  isReading: boolean;
  onStartReading: () => void;
  onPauseReading: () => void;
}

const DyslexiaToolbar: React.FC<DyslexiaToolbarProps> = ({ 
  onToggleSettings, 
  onToggleReadMode,
  isReading,
  onStartReading,
  onPauseReading
}) => {
  const { settings, updateSettings } = useDyslexiaSettings();
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState(false);

  useEffect(() => {
    // Set up voice activation callback
    voiceActivation.setActivationCallback(() => {
      toast({
        title: "Voice activation triggered!",
        description: "Starting screen reader..."
      });
      onStartReading();
    });
  }, [onStartReading]);

  const fontOptions: { value: FontType; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'opendyslexic', label: 'OpenDyslexic' },
    { value: 'dyslexie', label: 'Dyslexie' },
  ];

  const backgroundOptions: { value: BackgroundType; label: string; color: string }[] = [
    { value: 'default', label: 'Default', color: 'bg-background' },
    { value: 'cream', label: 'Cream', color: 'bg-yellow-50' },
    { value: 'beige', label: 'Beige', color: 'bg-amber-50' },
    { value: 'soft-blue', label: 'Soft Blue', color: 'bg-blue-50' },
    { value: 'soft-green', label: 'Soft Green', color: 'bg-green-50' },
    { value: 'light-pink', label: 'Light Pink', color: 'bg-pink-50' },
  ];

  const handleVoiceActivationToggle = async (enabled: boolean) => {
    if (enabled) {
      const success = await voiceActivation.startListening();
      if (success) {
        setVoiceActivationEnabled(true);
        toast({
          title: "Voice activation enabled",
          description: "Say 'Hey Discover' to start reading"
        });
      } else {
        toast({
          title: "Voice activation failed",
          description: "Please check microphone permissions",
          variant: "destructive"
        });
      }
    } else {
      voiceActivation.stopListening();
      setVoiceActivationEnabled(false);
      toast({
        title: "Voice activation disabled",
        description: "Voice commands are now off"
      });
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-md border border-border flex items-center space-x-4 overflow-x-auto">
      <TooltipProvider>
        {/* Enable/Disable Switch */}
        <div className="flex items-center space-x-2">
          <Switch 
            checked={settings.enabled} 
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            id="dyslexia-toggle"
          />
          <label htmlFor="dyslexia-toggle" className="text-sm font-medium cursor-pointer">
            Enable
          </label>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Font Selection */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Type className="h-4 w-4 mr-2" />
              <Select 
                value={settings.font} 
                onValueChange={(value: FontType) => updateSettings({ font: value })}
                disabled={!settings.enabled}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change font style</p>
          </TooltipContent>
        </Tooltip>

        {/* Background Color */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <PaintBucket className="h-4 w-4 mr-2" />
              <Select 
                value={settings.backgroundColor} 
                onValueChange={(value: BackgroundType) => updateSettings({ backgroundColor: value })}
                disabled={!settings.enabled}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Background" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change background color</p>
          </TooltipContent>
        </Tooltip>

        {/* Line Spacing */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4" />
              <div className="min-w-[140px]">
                <Slider 
                  value={[settings.lineSpacing]} 
                  min={1} 
                  max={3} 
                  step={0.1}
                  onValueChange={(value) => updateSettings({ lineSpacing: value[0] })}
                  disabled={!settings.enabled}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Adjust line spacing</p>
          </TooltipContent>
        </Tooltip>

        {/* Letter Spacing */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <MoveHorizontal className="h-4 w-4" />
              <div className="min-w-[140px]">
                <Slider 
                  value={[settings.letterSpacing]} 
                  min={0} 
                  max={5} 
                  step={0.5}
                  onValueChange={(value) => updateSettings({ letterSpacing: value[0] })}
                  disabled={!settings.enabled}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Adjust letter spacing</p>
          </TooltipContent>
        </Tooltip>

        {/* Reduce Visual Noise */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <EyeOff className="h-4 w-4" />
              <Switch 
                checked={settings.reduceVisualNoise} 
                onCheckedChange={(checked) => updateSettings({ reduceVisualNoise: checked })}
                disabled={!settings.enabled}
                id="noise-toggle"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reduce visual noise</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-8" />

        {/* Voice Activation */}
        {voiceActivation.isSupported() && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <MicIcon className={`h-4 w-4 ${voiceActivationEnabled ? 'text-green-500' : ''}`} />
                <Switch 
                  checked={voiceActivationEnabled} 
                  onCheckedChange={handleVoiceActivationToggle}
                  disabled={!settings.enabled}
                  id="voice-activation-toggle"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice activation ("Hey Discover")</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Read Mode Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onToggleReadMode}
              disabled={!settings.enabled}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle read mode</p>
          </TooltipContent>
        </Tooltip>

        {/* Play/Pause Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={isReading ? onPauseReading : onStartReading}
              disabled={!settings.enabled}
            >
              {isReading ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isReading ? "Pause reading" : "Start reading"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onToggleSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DyslexiaToolbar;
