// PikPak URL Extractor PRO - background.js

let isActive = true;

// Khởi tạo trạng thái khi cài đặt
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ active: isActive });
  updateBadge();
});

// Cập nhật số lượng trên icon (badge) và trạng thái hoạt động
function updateBadge() {
  chrome.storage.local.get(['active', 'urls'], (data) => {
    const active = data.active !== false;
    const urlCount = data.urls ? data.urls.length : 0;

    if (!active) {
      // Hiển thị OFF khi tắt
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    } else {
      // Hiển thị số lượng link bắt được
      chrome.action.setBadgeText({ text: urlCount > 0 ? urlCount.toString() : '' });
      chrome.action.setBadgeBackgroundColor({ color: '#3686ff' });
    }
  });
}

// Bật/Tắt extension khi click vào biểu tượng icon
chrome.action.onClicked.addListener((tab) => {
  // Side panel sẽ tự động mở do cấu hình ở trên
  updateBadge();
});

// Lắng nghe tin nhắn từ content script để cập nhật badge
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_COUNT') {
    updateBadge();
  }
});
