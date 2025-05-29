
// Content script for Read Easy extension
let isExtensionActive = false;
let currentUtterance = null;
let recognition = null;
let dyslexiaToolbar = null;

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
      console.log('Voice command:', command);
      
      if (command.includes('hey discover') || command.includes('start reading')) {
        startReading();
      } else if (command.includes('stop discover') || command.includes('stop reading')) {
        stopReading();
      }
    };

    recognition.onerror = function(event) {
      console.log('Speech recognition error:', event.error);
    };
  }
}

// Start reading the page content
function startReading() {
  stopReading(); // Stop any current reading
  
  const content = extractPageContent();
  if (content && 'speechSynthesis' in window) {
    currentUtterance = new SpeechSynthesisUtterance(content);
    currentUtterance.rate = 0.8;
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

// Create and show the dyslexia toolbar
function createDyslexiaToolbar() {
  if (dyslexiaToolbar) return;

  dyslexiaToolbar = document.createElement('div');
  dyslexiaToolbar.id = 'read-easy-toolbar';
  dyslexiaToolbar.innerHTML = `
    <div style="
      position: fixed;
      top: 10px;
      right: 10px;
      background: #2563eb;
      color: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      min-width: 250px;
    ">
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
        <h3 style="margin: 0; font-size: 16px;">Read Easy</h3>
        <button id="close-toolbar" style="
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          margin-left: auto;
        ">×</button>
      </div>
      
      <div style="margin-bottom: 10px;">
        <button id="start-reading" style="
          background: #16a34a;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 5px;
        ">Start Reading</button>
        
        <button id="stop-reading" style="
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
        ">Stop Reading</button>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px;">Font Style:</label>
        <select id="font-select" style="
          width: 100%;
          padding: 5px;
          border: none;
          border-radius: 3px;
        ">
          <option value="Arial">Arial</option>
          <option value="OpenDyslexic">OpenDyslexic</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
        </select>
      </div>
      
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 5px; font-size: 12px;">Background Color:</label>
        <select id="background-select" style="
          width: 100%;
          padding: 5px;
          border: none;
          border-radius: 3px;
        ">
          <option value="default">Default</option>
          <option value="cream">Cream</option>
          <option value="light-blue">Light Blue</option>
          <option value="light-gray">Light Gray</option>
        </select>
      </div>
      
      <div>
        <button id="toggle-voice" style="
          background: #7c3aed;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
        ">Enable Voice Commands</button>
      </div>
    </div>
  `;

  document.body.appendChild(dyslexiaToolbar);
  
  // Add event listeners
  document.getElementById('close-toolbar').onclick = hideDyslexiaToolbar;
  document.getElementById('start-reading').onclick = startReading;
  document.getElementById('stop-reading').onclick = stopReading;
  document.getElementById('font-select').onchange = changeFontStyle;
  document.getElementById('background-select').onchange = changeBackground;
  document.getElementById('toggle-voice').onclick = toggleVoiceCommands;
}

// Hide the toolbar
function hideDyslexiaToolbar() {
  if (dyslexiaToolbar) {
    dyslexiaToolbar.remove();
    dyslexiaToolbar = null;
    isExtensionActive = false;
  }
}

// Change font style
function changeFontStyle(event) {
  const fontFamily = event.target.value;
  document.body.style.fontFamily = fontFamily;
}

// Change background color
function changeBackground(event) {
  const background = event.target.value;
  const colors = {
    'default': '',
    'cream': '#f7f3e9',
    'light-blue': '#e0f2fe',
    'light-gray': '#f5f5f5'
  };
  
  document.body.style.backgroundColor = colors[background] || '';
}

// Toggle voice commands
function toggleVoiceCommands() {
  const button = document.getElementById('toggle-voice');
  
  if (recognition && recognition.state === 'active') {
    recognition.stop();
    button.textContent = 'Enable Voice Commands';
    button.style.background = '#7c3aed';
  } else {
    if (recognition) {
      recognition.start();
      button.textContent = 'Disable Voice Commands';
      button.style.background = '#16a34a';
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
      createDyslexiaToolbar();
      initializeSpeechRecognition();
      isExtensionActive = true;
    }
    sendResponse({status: 'toggled'});
  }
});

// Initialize when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSpeechRecognition);
} else {
  initializeSpeechRecognition();
}
