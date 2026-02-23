// PikPak URL Extractor PRO - injected.js (Chạy trực tiếp trong ngữ cảnh trang web)

(function() {
  const TARGET_DOMAIN = 'mypikpak.com';
  const DOWNLOAD_PATH = '/download/?fid=';

  // Kiểm tra xem URL có đúng định dạng link tải của PikPak không
  function isPikPakDownloadUrl(url) {
    return url && url.includes(TARGET_DOMAIN) && url.includes(DOWNLOAD_PATH);
  }

  // Gửi URL bắt được về content script
  function reportUrl(url) {
    if (isPikPakDownloadUrl(url)) {
      window.postMessage({ type: 'PIKPAK_URL_FOUND', url: url }, '*');
    }
  }

  // Chặn (Hook) Fetch API
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = args[0] instanceof Request ? args[0].url : args[0];
    
    // Kiểm tra URL yêu cầu
    reportUrl(url);

    // Một số link có thể nằm trong nội dung phản hồi JSON
    const clone = response.clone();
    clone.json().then(data => {
      findUrlsInObject(data);
    }).catch(() => {});

    return response;
  };

  // Chặn (Hook) XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    reportUrl(url);
    return originalOpen.apply(this, arguments);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      try {
        const data = JSON.parse(this.responseText);
        findUrlsInObject(data);
      } catch (e) {}
    });
    return originalSend.apply(this, arguments);
  };

  // Hàm tìm kiếm đệ quy các URL trong object JSON
  function findUrlsInObject(obj) {
    if (!obj) return;
    const str = JSON.stringify(obj);
    const regex = /https:\/\/[^"']+\.mypikpak\.com\/download\/\?fid=[^"']+/g;
    const matches = str.match(regex);
    if (matches) {
      matches.forEach(reportUrl);
    }
  }

  // Định kỳ kiểm tra thẻ <video> trong DOM
  setInterval(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      if (v.src) reportUrl(v.src);
      const sources = v.querySelectorAll('source');
      sources.forEach(s => {
        if (s.src) reportUrl(s.src);
      });
    });
  }, 2000);

  console.log('PikPak URL Extractor PRO: Injected script đã tải.');
})();
