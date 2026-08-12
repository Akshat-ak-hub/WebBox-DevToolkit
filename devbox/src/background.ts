// Background Service Worker for DevBox
// Enables Chrome Side Panel so DevBox stays open permanently across all tabs

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error: unknown) => console.error('SidePanel behavior error:', error));
  }
});
