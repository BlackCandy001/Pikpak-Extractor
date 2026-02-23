// PikPak URL Extractor PRO - injected.js (Chạy trực tiếp trong ngữ cảnh trang web)

(function() {
  const TARGET_DOMAIN = 'mypikpak.com';
  const DOWNLOAD_PATH = '/download/?fid=';

  // Kiểm tra xem URL có đúng định dạng link tải của PikPak không
  function isPikPakDownloadUrl(url) {
    return url && url.includes(TARGET_DOMAIN) && url.includes(DOWNLOAD_PATH);
  }

  // Gửi URL bắt được về content script kèm metadata nếu có
  function reportUrl(url, providedMeta = null) {
    if (isPikPakDownloadUrl(url)) {
      window.postMessage({ 
        type: 'PIKPAK_URL_FOUND', 
        url: url, 
        metadata: providedMeta 
      }, '*');
    }
  }

  // Chặn (Hook) Fetch API
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    const url = args[0] instanceof Request ? args[0].url : args[0];
    
    // Nếu là link tải trực tiếp (không thông qua JSON), báo cáo ngay
    if (isPikPakDownloadUrl(url)) {
      reportUrl(url);
    }

    const clone = response.clone();
    clone.json().then(data => {
      traverseObject(data);
    }).catch(() => {});

    return response;
  };

  // Chặn (Hook) XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    // Báo cáo ngay nếu là link tải trực tiếp
    if (isPikPakDownloadUrl(url)) {
      reportUrl(url);
    }
    return originalOpen.apply(this, arguments);
  };

  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function() {
    this.addEventListener('load', function() {
      try {
        const data = JSON.parse(this.responseText);
        traverseObject(data);
      } catch (e) {}
    });
    return originalSend.apply(this, arguments);
  };

  // Hàm duyệt object đệ quy để tìm URL và Metadata đi kèm
  function traverseObject(obj) {
    if (!obj || typeof obj !== 'object') return;

    // Nếu object này chứa link tải
    if (obj.web_content_link || (obj.download_url && isPikPakDownloadUrl(obj.download_url))) {
      const url = obj.web_content_link || obj.download_url;
      const meta = {
        title: obj.name || obj.file_name,
        size: formatSize(obj.size),
        time: formatTime(obj.modified_time || obj.created_time),
        thumbnail: obj.thumbnail_link || obj.icon_link
      };
      reportUrl(url, meta);
    }

    // Tiếp tục duyệt sâu hơn
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        traverseObject(obj[key]);
      } else if (typeof obj[key] === 'string' && isPikPakDownloadUrl(obj[key])) {
        reportUrl(obj[key]);
      }
    }
  }

  function formatSize(bytes) {
    if (!bytes) return null;
    bytes = parseInt(bytes);
    if (isNaN(bytes)) return null;
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatTime(timeStr) {
    if (!timeStr) return null;
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return null; }
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
