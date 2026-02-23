// PikPak URL Extractor PRO - content.js

(function() {
  // 1. Nhúng file injected.js vào trang web để bắt XHR/Fetch
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  (document.head || document.documentElement).appendChild(script);

  // 2. Lắng nghe tin nhắn từ injected.js khi tìm thấy URL
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PIKPAK_URL_FOUND') {
      addUrl(event.data.url, event.data.metadata);
    }
  });

  // Hàm lấy metadata từ DOM hiện tại (Dự phòng cho JSON)
  function getCurrentMetadata() {
    // Ưu tiên:
    // 1. Hàng đang được chọn (Checked) - Người dùng chủ động tác động
    // 2. Hàng đang xem (Current-path)
    // 3. Hàng đang hover/active
    let activeRow = document.querySelector('.checked.row') || 
                    document.querySelector('.current-path.row') ||
                    document.querySelector('.row:hover') ||
                    document.querySelector('.row');
    
    let metadata = {
      title: document.title.replace(' - PikPak', '').replace('PikPak', '').trim(),
      size: null,
      time: null,
      thumbnail: null
    };

    if (activeRow) {
      // Lấy Tiêu đề
      const label = activeRow.getAttribute('aria-label');
      const titleEl = activeRow.querySelector('.ellipsis');
      if (label && label.trim()) metadata.title = label.trim();
      else if (titleEl) metadata.title = titleEl.textContent.trim();

      // Lấy Dung lượng và Thời gian
      const extraInfo = activeRow.querySelector('.extra-info');
      if (extraInfo) {
        const divs = extraInfo.querySelectorAll('div');
        if (divs.length >= 1) metadata.size = divs[0].textContent.trim();
        if (divs.length >= 2) metadata.time = divs[1].textContent.trim();
      }

      // Lấy Thumbnail (Tránh lấy ảnh placeholder/blur quá cũ)
      const imgEl = activeRow.querySelector('.el-image img');
      if (imgEl && imgEl.src && !imgEl.src.startsWith('data:')) {
        metadata.thumbnail = imgEl.src;
      } else {
        const blurEl = activeRow.querySelector('.file-cover .blur');
        if (blurEl && blurEl.style.backgroundImage) {
          const bgImg = blurEl.style.backgroundImage.slice(5, -2);
          if (bgImg && !bgImg.startsWith('data:')) metadata.thumbnail = bgImg;
        }
      }
    }

    // Nếu tiêu đề là "PikPak" (chưa load xong), cố gắng lấy từ video hiện tại
    if (!metadata.title || metadata.title === 'PikPak') {
      const videoTitle = document.querySelector('.video-title, .playing-title');
      if (videoTitle) metadata.title = videoTitle.textContent.trim();
    }

    return metadata;
  }

  // Thêm URL mới hoặc cập nhật metadata cho URL cũ (Chống trùng lặp tuyệt đối)
  function addUrl(fullUrl, providedMeta = null) {
    chrome.storage.local.get(['urls'], (data) => {
      let urls = data.urls || [];
      const expiry = parseExpiry(fullUrl);
      const meta = providedMeta || getCurrentMetadata();

      // Tìm kiếm trùng lặp thông minh:
      // 1. Trùng URL tuyệt đối
      // 2. Hoặc trùng cả Tên và Dung lượng (Dấu hiệu của cùng 1 file từ CDN khác nhau)
      const existingIndex = urls.findIndex(u => {
        const isSameUrl = u.url === fullUrl;
        const isSameFile = (meta.title && meta.title !== 'Unknown Title' && u.title === meta.title) && 
                           (meta.size && u.size === meta.size);
        return isSameUrl || isSameFile;
      });

      if (existingIndex !== -1) {
        // Cập nhật thông tin nếu cái mới "xịn" hơn
        const current = urls[existingIndex];
        const isBetter = (!current.thumbnail && meta.thumbnail) || 
                         (current.title === 'Unknown Title' && meta.title && meta.title !== 'Unknown Title');

        if (isBetter || urls[existingIndex].url !== fullUrl) {
          urls[existingIndex] = {
            ...current,
            // Nếu URL khác nhưng cùng file, ta giữ URL mới nhất (thường là cái đang active)
            url: fullUrl || current.url, 
            title: meta.title || current.title,
            size: meta.size || current.size,
            time: meta.time || current.time,
            thumbnail: meta.thumbnail || current.thumbnail,
          };
          chrome.storage.local.set({ urls: urls }, () => {
            chrome.runtime.sendMessage({ type: 'UPDATE_COUNT' });
          });
        }
        return;
      }

      const newUrl = {
        url: fullUrl,
        title: meta.title || 'Unknown Title',
        size: meta.size,
        time: meta.time,
        thumbnail: meta.thumbnail,
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
