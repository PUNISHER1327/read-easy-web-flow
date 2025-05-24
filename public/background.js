
// Background script for Read Easy extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Read Easy extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Toggle extension on the current tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleExtension
  });
});

function toggleExtension() {
  // This function will be injected into the page
  const existingExtension = document.getElementById('read-easy-extension');
  if (existingExtension) {
    existingExtension.style.display = existingExtension.style.display === 'none' ? 'block' : 'none';
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['dyslexiaSettings'], (result) => {
      sendResponse({ settings: result.dyslexiaSettings || {} });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ dyslexiaSettings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
