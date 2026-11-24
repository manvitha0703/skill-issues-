import { SafeStorage } from '../storage/chromeStorage';
import { VaultManager } from '../vault/vaultManager';

// On installation, check if onboarding has been shown
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const onboardingComplete = await SafeStorage.get('swde_onboarding_complete', false);
    if (!onboardingComplete) {
      chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
    }
  }

  // Set up context menu
  chrome.contextMenus.create({
    id: 'swde-simplify-selection',
    title: '✨ Simplify Selected Text',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'swde-read-selection',
    title: '🔊 Read Selection Aloud',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'swde-simplify-selection' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SPEAK_TEXT',
      payload: `Simplifying: ${info.selectionText}`,
    });
  } else if (info.menuItemId === 'swde-read-selection' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'SPEAK_TEXT',
      payload: info.selectionText,
    });
  }
});

// Runtime message handler for vault and tab synchronization
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_VAULT_STATUS') {
    (async () => {
      const isConfigured = await VaultManager.isConfigured();
      const isLocked = await VaultManager.isLocked();
      let vaultData = null;
      if (isConfigured && !isLocked) {
        try {
          vaultData = await VaultManager.getData();
        } catch (_) {}
      }
      sendResponse({ isConfigured, isLocked, vaultData });
    })();
    return true; // Keep message channel open for async response
  }
});
