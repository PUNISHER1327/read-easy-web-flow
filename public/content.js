// Enhanced content script for Read Easy extension with all accessibility features
let isExtensionActive = false;
let currentUtterance = null;
let recognition = null;
let dyslexiaToolbar = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let settings = {
  enabled: false,
  font: 'default',
  backgroundColor: 'default',
  lineSpacing: 1.5,
  letterSpacing: 1,
  reduceVisualNoise: false,
  speechRate: 1.0
};

// Initialize speech recognition
function initializeSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Voice command detected:', command);
      
      if (command.includes('hey discover') || command.includes('start reading')) {
        console.log('Starting reading via voice command');
        startReading();
      } else if (command.includes('stop discover') || command.includes('stop reading')) {
        console.log('Stopping reading via voice command');
        stopReading();
      }
    };

    recognition.onerror = function(event) {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        showNotification('Microphone access denied. Please allow microphone access for voice commands.');
      }
    };

    recognition.onend = function() {
      // Auto-restart recognition if it was enabled
      const voiceButton = document.getElementById('toggle-voice');
      if (voiceButton && voiceButton.textContent === 'Disable Voice Commands') {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
          }
        }, 1000);
      }
    };
  }
}

// Audio recording functions
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `voice-recording-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      stream.getTracks().forEach(track => track.stop());
      URL.revokeObjectURL(audioUrl);
      
      showNotification('Recording saved to downloads');
    };
    
    mediaRecorder.start();
    isRecording = true;
    showNotification('Recording started');
    
  } catch (error) {
    console.error('Recording failed:', error);
    showNotification('Recording failed: ' + error.message);
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    showNotification('Recording stopped');
  }
}

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['dyslexiaSettings'], (result) => {
    if (result.dyslexiaSettings) {
      settings = { ...settings, ...result.dyslexiaSettings };
      applySettings();
    }
  });
}

// Save settings to storage
function saveSettings() {
  chrome.storage.sync.set({ dyslexiaSettings: settings });
}

// Apply all accessibility settings to the page
function applySettings() {
  if (!settings.enabled) {
    resetPageStyles();
    return;
  }

  // Apply font
  applyFont(settings.font);
  
  // Apply background color
  applyBackgroundColor(settings.backgroundColor);
  
  // Apply spacing
  applySpacing(settings.lineSpacing, settings.letterSpacing);
  
  // Apply visual noise reduction
  if (settings.reduceVisualNoise) {
    reduceVisualNoise();
  } else {
    restoreVisualElements();
  }
}

// Apply font styles
function applyFont(font) {
  const fontMap = {
    'default': 'inherit',
    'opendyslexic': 'OpenDyslexic, monospace',
    'dyslexie': 'Dyslexie, serif'
  };
  
  const fontFamily = fontMap[font] || 'inherit';
  
  // Apply to all text elements
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, a, button, input, textarea, label');
  textElements.forEach(element => {
    element.style.fontFamily = fontFamily;
  });
}

// Apply background color
function applyBackgroundColor(backgroundColor) {
  const colorMap = {
    'default': '',
    'cream': '#f7f3e9',
    'beige': '#f5e6d3',
    'soft-blue': '#e0f2fe',
    'soft-green': '#f0fdf4',
    'light-pink': '#fef7f7'
  };
  
  const color = colorMap[backgroundColor] || '';
  document.body.style.backgroundColor = color;
  
  // Also apply to main content areas
  const mainElements = document.querySelectorAll('main, article, section, .content, .main');
  mainElements.forEach(element => {
    element.style.backgroundColor = color;
  });
}

// Apply spacing settings
function applySpacing(lineSpacing, letterSpacing) {
  const style = document.getElementById('read-easy-spacing') || document.createElement('style');
  style.id = 'read-easy-spacing';
  
  style.textContent = `
    * {
      line-height: ${lineSpacing} !important;
      letter-spacing: ${letterSpacing * 0.05}em !important;
    }
  `;
  
  if (!document.getElementById('read-easy-spacing')) {
    document.head.appendChild(style);
  }
}

// Reduce visual noise
function reduceVisualNoise() {
  const style = document.getElementById('read-easy-noise-reduction') || document.createElement('style');
  style.id = 'read-easy-noise-reduction';
  
  style.textContent = `
    * {
      animation: none !important;
      transition: none !important;
    }
    img:not([alt]), img[alt=""] {
      opacity: 0.3 !important;
    }
    .ad, .advertisement, .banner, .popup, .modal:not(#read-easy-toolbar) {
      display: none !important;
    }
    video:not([controls]) {
      opacity: 0.5 !important;
    }
  `;
  
  if (!document.getElementById('read-easy-noise-reduction')) {
    document.head.appendChild(style);
  }
}

// Restore visual elements
function restoreVisualElements() {
  const noiseStyle = document.getElementById('read-easy-noise-reduction');
  if (noiseStyle) {
    noiseStyle.remove();
  }
}

// Reset all page styles
function resetPageStyles() {
  // Remove custom styles
  const customStyles = document.querySelectorAll('#read-easy-spacing, #read-easy-noise-reduction');
  customStyles.forEach(style => style.remove());
  
  // Reset body background
  document.body.style.backgroundColor = '';
  
  // Reset font families
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, a, button, input, textarea, label');
  textElements.forEach(element => {
    element.style.fontFamily = '';
  });
}

// Start reading the page content
function startReading() {
  stopReading(); // Stop any current reading
  
  const content = extractPageContent();
  if (content && 'speechSynthesis' in window) {
    currentUtterance = new SpeechSynthesisUtterance(content);
    currentUtterance.rate = settings.speechRate;
    currentUtterance.pitch = 1;
    currentUtterance.volume = 1;
    
    currentUtterance.onend = function() {
      console.log('Finished reading');
      currentUtterance = null;
    };
    
    speechSynthesis.speak(currentUtterance);
    console.log('Started reading page content');
    
    // Show notification
    showNotification('Started reading page content');
  }
}

// Stop reading
function stopReading() {
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
    console.log('Stopped reading');
    showNotification('Stopped reading');
  }
}

// Extract readable content from the page
function extractPageContent() {
  const elementsToRead = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'span', 'div'];
  let content = '';
  
  elementsToRead.forEach(tag => {
    const elements = document.querySelectorAll(tag);
    elements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 10 && !element.closest('script, style, nav, footer, header')) {
        content += text + '. ';
      }
    });
  });
  
  return content.slice(0, 5000); // Limit content length
}

// Create and show the enhanced dyslexia toolbar
function createDyslexiaToolbar() {
  if (dyslexiaToolbar) return;

  dyslexiaToolbar = document.createElement('div');
  dyslexiaToolbar.id = 'read-easy-toolbar';
  dyslexiaToolbar.innerHTML = `
    <div style="
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ffffff;
      color: #1f2937;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      min-width: 320px;
      max-height: 80vh;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; font-size: 16px; color: #1f2937;">Read Easy - Full Settings</h3>
        <button id="close-toolbar" style="
          background: none;
          border: none;
          color: #6b7280;
          font-size: 18px;
          cursor: pointer;
        ">×</button>
      </div>
      
      <!-- Enable/Disable Toggle -->
      <div style="margin-bottom: 15px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="enable-extension" style="margin-right: 8px;">
          <span>Enable Read Easy</span>
        </label>
      </div>
      
      <!-- Reading Controls -->
      <div style="margin-bottom: 15px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Reading Controls</h4>
        <div style="display: flex; gap: 5px; margin-bottom: 10px;">
          <button id="start-reading" style="
            background: #16a34a;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">▶ Start</button>
          
          <button id="pause-reading" style="
            background: #eab308;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">⏸ Pause</button>
          
          <button id="stop-reading" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">⏹ Stop</button>
        </div>
        
        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #1f2937;">Speech Rate: <span id="speech-rate-value">1.0</span>x</label>
          <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="1.0" style="width: 100%;">
        </div>
      </div>
      
      <!-- Recording Controls -->
      <div style="margin-bottom: 15px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Voice Recording</h4>
        <div style="display: flex; gap: 5px;">
          <button id="start-recording" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">🎤 Record</button>
          
          <button id="stop-recording" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: none;
          ">⏹ Stop & Save</button>
        </div>
      </div>
      
      <!-- Font Settings -->
      <div style="margin-bottom: 15px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Font Settings</h4>
        <select id="font-select" style="
          width: 100%;
          padding: 6px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          margin-bottom: 8px;
          background: white;
          color: #1f2937;
        ">
          <option value="default">Default</option>
          <option value="opendyslexic">OpenDyslexic</option>
          <option value="dyslexie">Dyslexie</option>
        </select>
      </div>
      
      <!-- Background Color -->
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Background Color</h4>
        <select id="background-select" style="
          width: 100%;
          padding: 6px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          color: #1f2937;
        ">
          <option value="default">Default</option>
          <option value="cream">Cream</option>
          <option value="beige">Beige</option>
          <option value="soft-blue">Soft Blue</option>
          <option value="soft-green">Soft Green</option>
          <option value="light-pink">Light Pink</option>
        </select>
      </div>
      
      <!-- Spacing Controls -->
      <div style="margin-bottom: 15px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Spacing Controls</h4>
        
        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #1f2937;">Line Spacing: <span id="line-spacing-value">1.5</span>x</label>
          <input type="range" id="line-spacing" min="1" max="3" step="0.1" value="1.5" style="width: 100%;">
        </div>
        
        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 4px; font-size: 12px; color: #1f2937;">Letter Spacing: <span id="letter-spacing-value">1</span></label>
          <input type="range" id="letter-spacing" min="0" max="5" step="0.5" value="1" style="width: 100%;">
        </div>
      </div>
      
      <!-- Visual Settings -->
      <div style="margin-bottom: 15px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Visual Settings</h4>
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="reduce-noise" style="margin-right: 8px;">
          <span style="font-size: 12px; color: #1f2937;">Reduce Visual Noise</span>
        </label>
      </div>
      
      <!-- Voice Commands -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 10px;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">Voice Commands</h4>
        <button id="toggle-voice" style="
          background: #7c3aed;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          margin-bottom: 8px;
        ">Enable Voice Commands</button>
        <p style="font-size: 10px; margin: 0; opacity: 0.8; color: #6b7280;">Say "Hey Discover" to start or "Stop Discover" to stop reading</p>
      </div>
    </div>
  `;

  document.body.appendChild(dyslexiaToolbar);
  
  // Initialize UI with current settings
  updateToolbarUI();
  
  // Add event listeners
  setupToolbarEventListeners();
}

// Update toolbar UI to reflect current settings
function updateToolbarUI() {
  const enableCheckbox = document.getElementById('enable-extension');
  const fontSelect = document.getElementById('font-select');
  const backgroundSelect = document.getElementById('background-select');
  const lineSpacingSlider = document.getElementById('line-spacing');
  const letterSpacingSlider = document.getElementById('letter-spacing');
  const speechRateSlider = document.getElementById('speech-rate');
  const reduceNoiseCheckbox = document.getElementById('reduce-noise');
  
  if (enableCheckbox) enableCheckbox.checked = settings.enabled;
  if (fontSelect) fontSelect.value = settings.font;
  if (backgroundSelect) backgroundSelect.value = settings.backgroundColor;
  if (lineSpacingSlider) {
    lineSpacingSlider.value = settings.lineSpacing;
    document.getElementById('line-spacing-value').textContent = settings.lineSpacing.toFixed(1);
  }
  if (letterSpacingSlider) {
    letterSpacingSlider.value = settings.letterSpacing;
    document.getElementById('letter-spacing-value').textContent = settings.letterSpacing;
  }
  if (speechRateSlider) {
    speechRateSlider.value = settings.speechRate;
    document.getElementById('speech-rate-value').textContent = settings.speechRate.toFixed(1);
  }
  if (reduceNoiseCheckbox) reduceNoiseCheckbox.checked = settings.reduceVisualNoise;
}

// Setup all toolbar event listeners
function setupToolbarEventListeners() {
  // Close button
  document.getElementById('close-toolbar').onclick = hideDyslexiaToolbar;
  
  // Enable/disable toggle
  document.getElementById('enable-extension').onchange = function(e) {
    settings.enabled = e.target.checked;
    applySettings();
    saveSettings();
  };
  
  // Reading controls
  document.getElementById('start-reading').onclick = startReading;
  document.getElementById('pause-reading').onclick = pauseReading;
  document.getElementById('stop-reading').onclick = stopReading;
  
  // Recording controls
  document.getElementById('start-recording').onclick = function() {
    startRecording();
    document.getElementById('start-recording').style.display = 'none';
    document.getElementById('stop-recording').style.display = 'inline-block';
  };
  
  document.getElementById('stop-recording').onclick = function() {
    stopRecording();
    document.getElementById('start-recording').style.display = 'inline-block';
    document.getElementById('stop-recording').style.display = 'none';
  };
  
  // Speech rate
  document.getElementById('speech-rate').oninput = function(e) {
    settings.speechRate = parseFloat(e.target.value);
    document.getElementById('speech-rate-value').textContent = settings.speechRate.toFixed(1);
    saveSettings();
  };
  
  // Font selection
  document.getElementById('font-select').onchange = function(e) {
    settings.font = e.target.value;
    applySettings();
    saveSettings();
  };
  
  // Background color
  document.getElementById('background-select').onchange = function(e) {
    settings.backgroundColor = e.target.value;
    applySettings();
    saveSettings();
  };
  
  // Line spacing
  document.getElementById('line-spacing').oninput = function(e) {
    settings.lineSpacing = parseFloat(e.target.value);
    document.getElementById('line-spacing-value').textContent = settings.lineSpacing.toFixed(1);
    applySettings();
    saveSettings();
  };
  
  // Letter spacing
  document.getElementById('letter-spacing').oninput = function(e) {
    settings.letterSpacing = parseFloat(e.target.value);
    document.getElementById('letter-spacing-value').textContent = settings.letterSpacing;
    applySettings();
    saveSettings();
  };
  
  // Visual noise reduction
  document.getElementById('reduce-noise').onchange = function(e) {
    settings.reduceVisualNoise = e.target.checked;
    applySettings();
    saveSettings();
  };
  
  // Voice commands
  document.getElementById('toggle-voice').onclick = toggleVoiceCommands;
}

// Pause/resume reading
function pauseReading() {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
    showNotification('Reading paused');
  } else if (speechSynthesis.paused) {
    speechSynthesis.resume();
    showNotification('Reading resumed');
  }
}

// Hide the toolbar
function hideDyslexiaToolbar() {
  if (dyslexiaToolbar) {
    dyslexiaToolbar.remove();
    dyslexiaToolbar = null;
    isExtensionActive = false;
  }
}

// Toggle voice commands
function toggleVoiceCommands() {
  const button = document.getElementById('toggle-voice');
  
  if (recognition && button.textContent === 'Disable Voice Commands') {
    recognition.stop();
    button.textContent = 'Enable Voice Commands';
    button.style.background = '#7c3aed';
    showNotification('Voice commands disabled');
  } else {
    if (recognition) {
      try {
        recognition.start();
        button.textContent = 'Disable Voice Commands';
        button.style.background = '#16a34a';
        showNotification('Voice commands enabled - say "Hey Discover" to start reading');
      } catch (error) {
        console.error('Voice recognition start failed:', error);
        showNotification('Voice commands failed to start. Check microphone permissions.');
      }
    } else {
      showNotification('Voice recognition not supported in this browser');
    }
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 50px;
    right: 10px;
    background: #1f2937;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 10001;
    font-family: Arial, sans-serif;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.opacity = '1', 100);
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    if (isExtensionActive) {
      hideDyslexiaToolbar();
    } else {
      loadSettings();
      createDyslexiaToolbar();
      initializeSpeechRecognition();
      isExtensionActive = true;
    }
    sendResponse({status: 'toggled'});
  }
});

// Load fonts when page loads
function loadDyslexiaFonts() {
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}

// Initialize when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    loadDyslexiaFonts();
    loadSettings();
  });
} else {
  initializeSpeechRecognition();
  loadDyslexiaFonts();
  loadSettings();
}
