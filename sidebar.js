// PikPak URL Extractor PRO - sidebar.js

let urls = [];

// Khởi tạo và lắng nghe thay đổi từ storage
chrome.storage.local.get(['urls'], (data) => {
  urls = data.urls || [];
  renderUrls();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.urls) {
    urls = changes.urls.newValue || [];
    renderUrls();
  }
});

function renderUrls() {
  const list = document.getElementById('pikpak-url-list');
  if (!list) return;

  if (urls.length === 0) {
    list.innerHTML = `
      <div class="panel-empty">
        <div class="icon">📽️</div>
        <div>Chưa bắt được link nào. Hãy mở một video để bắt đầu.</div>
      </div>
    `;
    return;
  }

  list.innerHTML = '';
  const now = Date.now();

  urls.forEach((item, index) => {
    const remaining = item.expiry ? Math.max(0, Math.floor((item.expiry - now) / 1000)) : null;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    const timeStr = remaining !== null ? `${hours}h ${minutes}m ${seconds}s` : 'Không rõ';

    const itemEl = document.createElement('div');
    itemEl.className = 'url-item';
    itemEl.innerHTML = `
      <div class="url-title" title="${item.title}">${item.title}</div>
      <textarea class="url-textarea" readonly>${item.url}</textarea>
      <div class="url-footer">
        <div class="countdown" id="timer-${index}">Hết hạn: ${timeStr}</div>
        <div class="item-actions">
          <button class="btn btn-secondary btn-small btn-copy" data-index="${index}">Copy</button>
          <button class="btn btn-primary btn-small btn-open" data-index="${index}">Open</button>
          <button class="btn btn-danger-text btn-small btn-remove" data-index="${index}">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(itemEl);
  });

  // Gán sự kiện
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index;
      navigator.clipboard.writeText(urls[index].url);
      const originalText = e.target.innerText;
      e.target.innerText = 'Đã copy!';
      setTimeout(() => e.target.innerText = originalText, 1000);
    };
  });

  document.querySelectorAll('.btn-open').forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index;
      window.open(urls[index].url, '_blank');
    };
  });

  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.onclick = (e) => {
      const index = e.target.dataset.index;
      urls.splice(index, 1);
      chrome.storage.local.set({ urls: urls });
      chrome.runtime.sendMessage({ type: 'UPDATE_COUNT' });
    };
  });
}

// Các nút Header
document.getElementById('pikpak-clear').addEventListener('click', () => {
  urls = [];
  chrome.storage.local.set({ urls: urls });
  chrome.runtime.sendMessage({ type: 'UPDATE_COUNT' });
});

document.getElementById('pikpak-export').addEventListener('click', () => {
  if (urls.length === 0) return;
  const text = urls.map(u => `Title: ${u.title}\nURL: ${u.url}\n`).join('\n---\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pikpak-urls-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

// Cập nhật bộ đếm thời gian
setInterval(() => {
  if (urls.length === 0) return;
  const now = Date.now();
  
  // Tự động xóa link hết hạn
  const initialCount = urls.length;
  urls = urls.filter(item => !item.expiry || item.expiry > now);
  
  if (urls.length !== initialCount) {
    chrome.storage.local.set({ urls: urls });
    chrome.runtime.sendMessage({ type: 'UPDATE_COUNT' });
  } else {
    // Chỉ cập nhật text timer
    urls.forEach((item, index) => {
      const timerEl = document.getElementById(`timer-${index}`);
      if (timerEl) {
        const remaining = item.expiry ? Math.max(0, Math.floor((item.expiry - now) / 1000)) : null;
        if (remaining !== null) {
          const hours = Math.floor(remaining / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          timerEl.innerText = `Hết hạn: ${hours}h ${minutes}m ${seconds}s`;
        }
      }
    });
  }
}, 1000);
