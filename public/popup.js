
// Popup script for Read Easy extension
document.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activateBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const helpBtn = document.getElementById('helpBtn');
  
  // Activate extension button
  activateBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be loaded, inject it
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      }
    });
    
    window.close();
  });
  
  // Settings button (could open options page in the future)
  settingsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://docs.lovable.dev' });
    window.close();
  });
  
  // Help button
  helpBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://docs.lovable.dev/tips-tricks/troubleshooting' });
    window.close();
  });
});
