// PikPak URL Extractor PRO - content.js

(function() {
  // 1. Nhúng file injected.js vào trang web để bắt XHR/Fetch
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  (document.head || document.documentElement).appendChild(script);

  // 2. Lắng nghe tin nhắn từ injected.js khi tìm thấy URL
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PIKPAK_URL_FOUND') {
      addUrl(event.data.url);
    }
  });

  function getCurrentTitle() {
    // Ưu tiên các selector cho video đang phát hoặc đang được chọn
    const selectors = [
      '.video-title', 
      '.disabled-rename.title',
      '.checked .name .ellipsis', // Dành cho giao diện danh sách/lưới của PikPak
      '.name .ellipsis',
      '.pp-link-button.ellipsis.active'
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }

    return document.title || 'Unknown Title';
  }

  // Thêm URL mới vào bộ nhớ (loại bỏ trùng lặp)
  function addUrl(fullUrl) {
    chrome.storage.local.get(['urls'], (data) => {
      let urls = data.urls || [];
      if (urls.some(u => u.url === fullUrl)) return;

      const expiry = parseExpiry(fullUrl);
      const title = getCurrentTitle();
      const newUrl = {
        url: fullUrl,
        title: title,
        expiry: expiry,
        addedAt: Date.now()
      };

      urls.push(newUrl);
      chrome.storage.local.set({ urls: urls }, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_COUNT' });
      });
    });
  }

  // Phân tích tham số 'expire' từ URL để tính thời gian hết hạn
  function parseExpiry(url) {
    try {
      const urlObj = new URL(url);
      const expire = urlObj.searchParams.get('expire');
      return expire ? parseInt(expire) * 1000 : null; // Chuyển từ giây sang mili giây
    } catch (e) {
      return null;
    }
  }

})();
