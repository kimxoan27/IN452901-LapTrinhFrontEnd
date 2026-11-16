// Câu 2: viết JavaScript tại đây

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// Câu 2a: Trả về "Còn x/y chỗ" hoặc "Hết chỗ"
const formatSeats = (event) => {
  const remaining = event.capacity - event.registeredCount;
  if (remaining <= 0) {
    return 'Hết chỗ';
  }
  return `Còn ${remaining}/${event.capacity} chỗ`;
};
// Câu 2b: Tạo danh sách card sự kiện và cập nhật vào #event-list
const renderEvents = (events) => {
  const eventList = document.querySelector('#event-list');

  const cards = events.map((event) => {
    const article = document.createElement('article');
    article.setAttribute('class', 'event-card');

    // Ảnh minh hoạ
    const img = document.createElement('img');
    img.setAttribute('src', 'img/event.svg');
    img.setAttribute('alt', event.name);

    // Tiêu đề sự kiện bọc trong thẻ <a>
    const h2 = document.createElement('h2');
    const link = document.createElement('a');
    link.setAttribute('href', `event-detail.html?id=${event.id}`);
    link.textContent = event.name;
    h2.appendChild(link);

    // Thời gian trong thẻ <time>
    const timeP = document.createElement('p');
    const time = document.createElement('time');
    time.setAttribute('datetime', event.startTime);
    time.textContent = formatDateTime(event.startTime);
    timeP.appendChild(time);

    // Địa điểm
    const locationP = document.createElement('p');
    locationP.textContent = event.location;

    // Số chỗ (nếu "Hết chỗ" thì bọc trong <span class="badge-full"> giống Câu 1)
    const seatsP = document.createElement('p');
    seatsP.setAttribute('class', 'seats');
    const seatText = formatSeats(event);

    const badge = document.createElement('span');
    if (seatText === 'Hết chỗ') {
      badge.setAttribute('class', 'badge-full');
    } else {
      badge.setAttribute('class', 'badge-seats'); // Huy hiệu xanh khi còn chỗ
    }
    badge.textContent = seatText;
    seatsP.appendChild(badge);

    article.append(img, h2, timeP, locationP, seatsP);
    return article;
  });

  eventList.replaceChildren(...cards);
};

// Câu 2c: Hàm async loadEvents(keyword) gọi API và cập nhật trạng thái
let currentController = null; // mở rộng: huỷ request cũ

const loadEvents = async (keyword = '') => {
  const statusEl = document.querySelector('#status');
  const eventList = document.querySelector('#event-list');
  const submitBtn = document.querySelector('#search-form button');

  currentController?.abort();
  currentController = new AbortController();
  const { signal } = currentController;

  statusEl.textContent = 'Đang tải…';
  submitBtn.disabled = true;

  const params = new URLSearchParams({ pageSize: '50' });
  if (keyword !== '') {
    params.set('q', keyword);
  }

  try {
    const response = await fetch(`${API_URL}/api/events?${params.toString()}`, { signal });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];

    if (items.length === 0) {
      statusEl.textContent = 'Không có sự kiện nào khớp từ khoá.';
      eventList.replaceChildren();
    } else {
      statusEl.textContent = `Tìm thấy ${items.length} sự kiện`;
      renderEvents(items);
    }
  } catch (error) {
    if (error.name === 'AbortError') return; // request cũ bị huỷ, bỏ qua
    statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
    eventList.replaceChildren();
  } finally {
    if (currentController.signal === signal) {
      submitBtn.disabled = false;
    }
  }
};

// Lắng nghe sự kiện gửi form tìm kiếm
const searchForm = document.querySelector('#search-form');
const keywordInput = document.querySelector('#keyword');

searchForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Chặn tải lại trang
  const keyword = keywordInput.value.trim(); // Cắt khoảng trắng đầu/cuối
  loadEvents(keyword);
});

// Gọi hàm ngay khi vừa mở trang
loadEvents();