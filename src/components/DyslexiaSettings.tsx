
import React from 'react';
import { useDyslexiaSettings, FontType, BackgroundType } from '../contexts/DyslexiaContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';

interface DyslexiaSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DyslexiaSettings: React.FC<DyslexiaSettingsProps> = ({ open, onOpenChange }) => {
  const { settings, updateSettings, resetSettings } = useDyslexiaSettings();

  const fontOptions: { value: FontType; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'opendyslexic', label: 'OpenDyslexic' },
    { value: 'dyslexie', label: 'Dyslexie (Placeholder)' },
  ];

  const backgroundOptions: { value: BackgroundType; label: string; color: string }[] = [
    { value: 'default', label: 'Default', color: 'bg-background' },
    { value: 'cream', label: 'Cream', color: 'bg-dyslexia-cream' },
    { value: 'beige', label: 'Beige', color: 'bg-dyslexia-beige' },
    { value: 'soft-blue', label: 'Soft Blue', color: 'bg-dyslexia-soft-blue' },
    { value: 'soft-green', label: 'Soft Green', color: 'bg-dyslexia-soft-green' },
    { value: 'light-pink', label: 'Light Pink', color: 'bg-dyslexia-light-pink' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Read Easy Settings</DialogTitle>
          <DialogDescription>
            Customize your reading experience for dyslexia-friendly web browsing.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="px-1 max-h-[60vh]">
          <Tabs defaultValue="visual">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visual">Visual Settings</TabsTrigger>
              <TabsTrigger value="reading">Reading Aids</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="visual" className="space-y-4 p-2">
              {/* Font Settings */}
              <div className="space-y-2">
                <Label htmlFor="font-select">Font Style</Label>
                <Select 
                  value={settings.font} 
                  onValueChange={(value: FontType) => updateSettings({ font: value })}
                  disabled={!settings.enabled}
                >
                  <SelectTrigger id="font-select">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.value === 'opendyslexic' ? 'font-opendyslexic' : ''}>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose a font that makes reading easier for you. OpenDyslexic and Dyslexie are designed specifically for dyslexic readers.
                </p>
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <Label htmlFor="background-select">Background Color</Label>
                <Select 
                  value={settings.backgroundColor} 
                  onValueChange={(value: BackgroundType) => updateSettings({ backgroundColor: value })}
                  disabled={!settings.enabled}
                >
                  <SelectTrigger id="background-select">
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded mr-2 ${option.color} border border-border`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A suitable background color can reduce eye strain and improve readability. Cream and soft colors often work best.
                </p>
              </div>

              {/* Line Spacing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="line-spacing">Line Spacing</Label>
                  <span className="text-sm">{settings.lineSpacing.toFixed(1)}x</span>
                </div>
                <Slider 
                  id="line-spacing"
                  value={[settings.lineSpacing]} 
                  min={1} 
                  max={3} 
                  step={0.1}
                  onValueChange={(value) => updateSettings({ lineSpacing: value[0] })}
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Increased spacing between lines can prevent readers from losing their place in the text.
                </p>
              </div>

              {/* Letter Spacing */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="letter-spacing">Letter Spacing</Label>
                  <span className="text-sm">{settings.letterSpacing.toFixed(1)}</span>
                </div>
                <Slider 
                  id="letter-spacing"
                  value={[settings.letterSpacing]} 
                  min={0} 
                  max={5} 
                  step={0.5}
                  onValueChange={(value) => updateSettings({ letterSpacing: value[0] })}
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Wider spacing between letters can help prevent them from appearing to run together.
                </p>
              </div>

              {/* Reduce Visual Noise */}
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="noise-toggle">Reduce Visual Noise</Label>
                  <p className="text-xs text-muted-foreground">
                    Removes distracting animations and simplifies page elements
                  </p>
                </div>
                <Switch 
                  id="noise-toggle"
                  checked={settings.reduceVisualNoise} 
                  onCheckedChange={(checked) => updateSettings({ reduceVisualNoise: checked })}
                  disabled={!settings.enabled}
                />
              </div>
            </TabsContent>

            <TabsContent value="reading" className="space-y-4 p-2">
              {/* Speech Rate */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="speech-rate">Speech Rate</Label>
                  <span className="text-sm">{settings.speechRate.toFixed(1)}x</span>
                </div>
                <Slider 
                  id="speech-rate"
                  value={[settings.speechRate]} 
                  min={0.5} 
                  max={2} 
                  step={0.1}
                  onValueChange={(value) => updateSettings({ speechRate: value[0] })}
                  disabled={!settings.enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust how fast the text-to-speech feature reads content aloud.
                </p>
              </div>

              {/* Text-to-Speech options would go here in a real extension */}
              <div className="space-y-2">
                <Label>Text-to-Speech Voice</Label>
                <Select 
                  defaultValue="default" 
                  disabled={!settings.enabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Voice</SelectItem>
                    <SelectItem value="voice1">Sample Voice 1</SelectItem>
                    <SelectItem value="voice2">Sample Voice 2</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  In the full extension, you would be able to select from available system voices.
                </p>
              </div>

              {/* Reading Mode Settings */}
              <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-sm font-medium">Karaoke Mode Settings</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="highlight-toggle">Word Highlighting</Label>
                    <p className="text-xs text-muted-foreground">
                      Highlight words as they are spoken
                    </p>
                  </div>
                  <Switch 
                    id="highlight-toggle"
                    checked={true}
                    disabled={true}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <Label htmlFor="auto-scroll-toggle">Auto-Scroll</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically scroll to keep reading position in view
                    </p>
                  </div>
                  <Switch 
                    id="auto-scroll-toggle"
                    checked={true}
                    disabled={true}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 p-2">
              <div className="space-y-2">
                <Label>Content Summarization</Label>
                <div className="p-4 border rounded-md bg-muted/40">
                  <p className="text-sm">
                    In the full extension, this section would allow you to configure how the extension
                    summarizes and simplifies content. This could use AI models or rule-based algorithms
                    to make text more accessible.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Page Behavior</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <p className="text-sm">Apply settings automatically</p>
                      <p className="text-xs text-muted-foreground">
                        Apply your preferences to new pages automatically
                      </p>
                    </div>
                    <Switch checked={true} disabled={true} />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div>
                      <p className="text-sm">Remember site-specific settings</p>
                      <p className="text-xs text-muted-foreground">
                        Save different settings for different websites
                      </p>
                    </div>
                    <Switch checked={false} disabled={true} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DyslexiaSettings;
