
// Content script for Read Easy extension
let extensionRoot = null;
let isExtensionLoaded = false;

// Initialize the extension
function initializeExtension() {
  if (isExtensionLoaded) return;
  
  // Create container for the extension
  extensionRoot = document.createElement('div');
  extensionRoot.id = 'read-easy-extension';
  extensionRoot.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create shadow DOM to isolate styles
  const shadowRoot = extensionRoot.attachShadow({ mode: 'open' });
  
  // Add the extension HTML
  shadowRoot.innerHTML = `
    <style>
      /* Reset and base styles */
      * { box-sizing: border-box; margin: 0; padding: 0; }
      :host { 
        all: initial; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .extension-container {
        background: #ffffff;
        border-bottom: 2px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      
      .extension-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #1f2937;
      }
      
      .controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      
      .btn {
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #ffffff;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .btn:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }
      
      .btn.active {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      
      .toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        background: #e5e7eb;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .toggle-switch.active {
        background: #3b82f6;
      }
      
      .toggle-slider {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
      }
      
      .toggle-switch.active .toggle-slider {
        transform: translateX(20px);
      }
      
      .select {
        padding: 4px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        font-size: 14px;
      }
      
      .close-btn {
        background: #ef4444;
        color: white;
        border: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      }
      
      .close-btn:hover {
        background: #dc2626;
      }
    </style>
    
    <div class="extension-container">
      <div class="extension-title">
        <span>✨</span>
        <span>Read Easy</span>
      </div>
      
      <div class="controls">
        <div class="toggle-switch" id="enableToggle">
          <div class="toggle-slider"></div>
        </div>
        
        <select class="select" id="fontSelect">
          <option value="default">Default Font</option>
          <option value="opendyslexic">OpenDyslexic</option>
          <option value="dyslexie">Dyslexie</option>
        </select>
        
        <select class="select" id="backgroundSelect">
          <option value="default">Default</option>
          <option value="cream">Cream</option>
          <option value="beige">Beige</option>
          <option value="soft-blue">Soft Blue</option>
          <option value="soft-green">Soft Green</option>
          <option value="light-pink">Light Pink</option>
        </select>
        
        <button class="btn" id="readBtn">🔊 Read</button>
        <button class="btn" id="stopBtn">⏹️ Stop</button>
        <button class="btn" id="voiceBtn">🎤 Voice</button>
      </div>
      
      <button class="close-btn" id="closeBtn">×</button>
    </div>
  `;
  
  // Add event listeners
  setupEventListeners(shadowRoot);
  
  // Insert into page
  document.body.insertBefore(extensionRoot, document.body.firstChild);
  isExtensionLoaded = true;
  
  // Load saved settings
  loadSettings();
}

function setupEventListeners(shadowRoot) {
  const enableToggle = shadowRoot.getElementById('enableToggle');
  const fontSelect = shadowRoot.getElementById('fontSelect');
  const backgroundSelect = shadowRoot.getElementById('backgroundSelect');
  const readBtn = shadowRoot.getElementById('readBtn');
  const stopBtn = shadowRoot.getElementById('stopBtn');
  const voiceBtn = shadowRoot.getElementById('voiceBtn');
  const closeBtn = shadowRoot.getElementById('closeBtn');
  
  let isEnabled = false;
  let isReading = false;
  let isVoiceActive = false;
  let currentUtterance = null;
  let recognition = null;
  
  // Initialize speech recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.toLowerCase().trim();
      
      if (transcript.includes('hey discover')) {
        startReading();
      } else if (transcript.includes('stop discover')) {
        stopReading();
      }
    };
  }
  
  // Enable/disable toggle
  enableToggle.addEventListener('click', () => {
    isEnabled = !isEnabled;
    enableToggle.classList.toggle('active', isEnabled);
    applySettings();
    saveSettings();
  });
  
  // Font selection
  fontSelect.addEventListener('change', () => {
    applySettings();
    saveSettings();
  });
  
  // Background selection
  backgroundSelect.addEventListener('change', () => {
    applySettings();
    saveSettings();
  });
  
  // Read button
  readBtn.addEventListener('click', startReading);
  
  // Stop button
  stopBtn.addEventListener('click', stopReading);
  
  // Voice activation button
  voiceBtn.addEventListener('click', () => {
    if (!recognition) return;
    
    isVoiceActive = !isVoiceActive;
    voiceBtn.classList.toggle('active', isVoiceActive);
    
    if (isVoiceActive) {
      recognition.start();
      voiceBtn.textContent = '🎤 Listening...';
    } else {
      recognition.stop();
      voiceBtn.textContent = '🎤 Voice';
    }
  });
  
  // Close button
  closeBtn.addEventListener('click', () => {
    if (extensionRoot) {
      extensionRoot.style.display = 'none';
    }
    stopReading();
    if (recognition && isVoiceActive) {
      recognition.stop();
    }
  });
  
  function startReading() {
    if (isReading) return;
    
    // Get page content
    const content = document.body.innerText || document.body.textContent || '';
    const textToRead = content.substring(0, 5000); // Limit to avoid very long texts
    
    if ('speechSynthesis' in window) {
      currentUtterance = new SpeechSynthesisUtterance(textToRead);
      currentUtterance.rate = 0.9;
      currentUtterance.onstart = () => {
        isReading = true;
        readBtn.textContent = '⏸️ Pause';
        readBtn.classList.add('active');
      };
      currentUtterance.onend = () => {
        isReading = false;
        readBtn.textContent = '🔊 Read';
        readBtn.classList.remove('active');
      };
      
      speechSynthesis.speak(currentUtterance);
    }
  }
  
  function stopReading() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    isReading = false;
    readBtn.textContent = '🔊 Read';
    readBtn.classList.remove('active');
  }
  
  function applySettings() {
    if (!isEnabled) {
      // Reset to default
      document.documentElement.style.removeProperty('background-color');
      document.documentElement.style.removeProperty('font-family');
      document.documentElement.style.removeProperty('line-height');
      document.documentElement.style.removeProperty('letter-spacing');
      return;
    }
    
    // Apply font
    const font = fontSelect.value;
    switch (font) {
      case 'opendyslexic':
        document.documentElement.style.fontFamily = 'monospace';
        break;
      case 'dyslexie':
        document.documentElement.style.fontFamily = 'serif';
        break;
      default:
        document.documentElement.style.removeProperty('font-family');
    }
    
    // Apply background
    const background = backgroundSelect.value;
    switch (background) {
      case 'cream':
        document.documentElement.style.backgroundColor = '#fffbf0';
        break;
      case 'beige':
        document.documentElement.style.backgroundColor = '#fefcbf';
        break;
      case 'soft-blue':
        document.documentElement.style.backgroundColor = '#eff6ff';
        break;
      case 'soft-green':
        document.documentElement.style.backgroundColor = '#f0fdf4';
        break;
      case 'light-pink':
        document.documentElement.style.backgroundColor = '#fdf2f8';
        break;
      default:
        document.documentElement.style.removeProperty('background-color');
    }
    
    // Apply spacing
    if (isEnabled) {
      document.documentElement.style.lineHeight = '1.6';
      document.documentElement.style.letterSpacing = '0.05em';
    }
  }
  
  function saveSettings() {
    const settings = {
      enabled: isEnabled,
      font: fontSelect.value,
      background: backgroundSelect.value
    };
    
    chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: settings
    });
  }
  
  function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.settings) {
        const settings = response.settings;
        
        isEnabled = settings.enabled || false;
        enableToggle.classList.toggle('active', isEnabled);
        
        if (settings.font) {
          fontSelect.value = settings.font;
        }
        
        if (settings.background) {
          backgroundSelect.value = settings.background;
        }
        
        applySettings();
      }
    });
  }
}

// Auto-initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    if (extensionRoot) {
      extensionRoot.style.display = extensionRoot.style.display === 'none' ? 'block' : 'none';
    }
  }
});
