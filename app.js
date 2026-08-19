const workbookUrl = './sach.xlsx';
const bookTableBody = document.getElementById('bookTableBody');
const summaryEl = document.getElementById('summary');
const messageEl = document.getElementById('message');
const searchInput = document.getElementById('searchInput');
const pageSizeSelects = document.querySelectorAll('.page-size-select');
const pageInfoElements = document.querySelectorAll('.page-info');
const previousPageButtons = document.querySelectorAll('.previous-page-button');
const nextPageButtons = document.querySelectorAll('.next-page-button');
const bookDialog = document.getElementById('bookDialog');
const dialogTitle = document.getElementById('dialogTitle');
const bookDetails = document.getElementById('bookDetails');
const closeDialogButton = document.getElementById('closeDialogButton');

let books = [];
let filteredBooks = [];
let currentPage = 1;
let pageSize = Number(pageSizeSelects[0].value);

document.addEventListener('DOMContentLoaded', init);

async function init() {
  searchInput.addEventListener('input', renderTable);
  pageSizeSelects.forEach((select) => select.addEventListener('change', () => {
    pageSize = Number(select.value);
    currentPage = 1;
    pageSizeSelects.forEach((pageSizeSelect) => {
      pageSizeSelect.value = String(pageSize);
    });
    renderPage();
  }));
  previousPageButtons.forEach((button) => button.addEventListener('click', () => changePage(-1)));
  nextPageButtons.forEach((button) => button.addEventListener('click', () => changePage(1)));
  bookTableBody.addEventListener('click', handleRowActivation);
  bookTableBody.addEventListener('keydown', handleRowActivation);
  closeDialogButton.addEventListener('click', () => bookDialog.close());
  bookDialog.addEventListener('click', (event) => {
    if (event.target === bookDialog) bookDialog.close();
  });

  await loadBooks();
}

async function loadBooks() {
  try {
    const response = await fetch(workbookUrl);

    if (!response.ok) {
      throw new Error('Không tìm thấy file sach.xlsx. Hãy đặt file Excel vào cùng thư mục với trang web.');
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    books = parseWorkbook(workbook);

    if (!books.length) {
      showMessage('Không tìm thấy dòng dữ liệu hợp lệ trong file Excel. Hãy kiểm tra hàng đầu tiên là tên các cột của sổ sách.');
      summaryEl.textContent = 'Tìm thấy 0 sách';
      renderTable();
      return;
    }

    hideMessage();
    summaryEl.textContent = `Đã tải ${books.length} sách`;
    renderTable();
  } catch (error) {
    console.error(error);
    showMessage(error.message || 'Đã xảy ra lỗi khi tải file Excel.');
    summaryEl.textContent = 'Không thể tải dữ liệu thư viện';
  }
}

function parseWorkbook(workbook) {
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  return rows
    .map((row) => normalizeBook(row))
    .filter((book) => book && book.title);
}

function normalizeBook(row) {
  const normalized = {};

  Object.keys(row).forEach((key) => {
    const normalizedKey = normalizeKey(key);
    normalized[normalizedKey] = String(row[key] ?? '').trim();
  });

  const serialNumber = normalized.stt || normalized.no || normalized.number || '';
  const id = normalized.masosach || normalized.bookid || normalized.id || normalized.booknumber || '';
  const title = normalized.tensach || normalized.title || normalized.booktitle || normalized.name || '';
  const author = normalized.tacgia || normalized.author || normalized.authors || normalized.writer || '';

  if (!title && !id && !author) return null;

  return {
    serialNumber,
    id,
    title: title || 'Chưa có tên sách',
    author,
    publisher: normalized.noixuatban || '',
    publicationYear: normalized.namxuatban || '',
    format: normalized.kho || '',
    pages: normalized.sotrang || '',
    price: normalized.tienvnd || '',
    registeredDate: normalized.ngayvaoso || '',
    notes: normalized.ghichu || '',
  };
}

function normalizeKey(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s/g, '');
}

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  filteredBooks = books.filter((book) => !query || Object.values(book).some((field) => String(field).toLowerCase().includes(query)));
  currentPage = 1;

  summaryEl.textContent = `${filteredBooks.length} sách được hiển thị`;

  if (!filteredBooks.length) {
    bookTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-row">Không có sách nào phù hợp với tìm kiếm hiện tại.</td>
      </tr>
    `;
    updatePagination();
    return;
  }

  renderPage();
}

function renderPage() {
  if (!filteredBooks.length) return;

  const firstIndex = (currentPage - 1) * pageSize;
  const pageBooks = filteredBooks.slice(firstIndex, firstIndex + pageSize);

  bookTableBody.innerHTML = `
    ${pageBooks.map((book, index) => renderRow(book, firstIndex + index)).join('')}
  `;
  updatePagination();
}

function renderRow(book, index) {
  return `
    <tr class="book-row" data-book-index="${index}" tabindex="0" aria-label="Xem thông tin ${escapeHtml(book.title)}">
      <td>${escapeHtml(book.serialNumber)}</td>
      <td>${escapeHtml(book.id)}</td>
      <td>${escapeHtml(book.title)}</td>
      <td>${escapeHtml(book.author)}</td>
      <td>${escapeHtml(book.publisher)}</td>
      <td>${escapeHtml(formatPrice(book.price))}</td>
    </tr>
  `;
}

function updatePagination() {
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  pageInfoElements.forEach((element) => {
    element.textContent = filteredBooks.length ? `Trang ${currentPage} / ${totalPages}` : 'Không có dữ liệu';
  });
  previousPageButtons.forEach((button) => {
    button.disabled = currentPage <= 1 || !filteredBooks.length;
  });
  nextPageButtons.forEach((button) => {
    button.disabled = currentPage >= totalPages || !filteredBooks.length;
  });
}

function changePage(offset) {
  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const nextPage = currentPage + offset;

  if (nextPage < 1 || nextPage > totalPages) return;

  currentPage = nextPage;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleRowActivation(event) {
  const row = event.target.closest('.book-row');
  if (!row || (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ')) return;

  if (event.type === 'keydown') {
    event.preventDefault();
  }

  openBookDetails(filteredBooks[Number(row.dataset.bookIndex)]);
}

function openBookDetails(book) {
  if (!book) return;

  dialogTitle.textContent = book.title;
  bookDetails.innerHTML = [
    ['STT', book.serialNumber],
    ['Mã số sách', book.id],
    ['Tác giả', book.author],
    ['NXB', book.publisher],
    ['Giá tiền', formatPrice(book.price)],
    ['Năm xuất bản', book.publicationYear],
    ['Khổ', book.format],
    ['Số trang', book.pages],
    ['Ngày vào sổ', book.registeredDate],
    ['Ghi chú', book.notes],
  ]
    .map(([label, value]) => `<div class="detail-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '—')}</dd></div>`)
    .join('');

  bookDialog.showModal();
}

function showMessage(message) {
  messageEl.hidden = false;
  messageEl.textContent = message;
}

function hideMessage() {
  messageEl.hidden = true;
  messageEl.textContent = '';
}

function formatPrice(value) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return '';

  const digitsOnly = rawValue.replace(/[^\d-]/g, '');
  if (!digitsOnly || !/^-?\d+$/.test(digitsOnly)) return rawValue;

  return Number(digitsOnly).toLocaleString('en-US');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
