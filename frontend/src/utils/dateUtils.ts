/**
 * ĐỊNH DẠNG THỜI GIAN & NGÀY THÁNG
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Chuẩn hóa thời gian đơn hàng sang định dạng Việt Nam đồng nhất: HH:mm DD/MM/YYYY
 * Ví dụ: "11:15 10/08/2026", "06:08 19/09/2026"
 */
export function formatOrderDateTime(rawDate: string | undefined | null): string {
  if (!rawDate) return '';
  const trimmed = rawDate.trim();

  // Khớp định dạng: HH:mm DD/MM/YYYY hoặc HH:mm:ss DD/MM/YYYY
  const vnPattern = /^(\d{1,2}):(\d{2})(?::\d{2})?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const vnMatch = trimmed.match(vnPattern);
  if (vnMatch) {
    const [, h, m, d, mo, y] = vnMatch;
    return `${h.padStart(2, '0')}:${m} ${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${y}`;
  }

  // Khớp định dạng: DD/MM/YYYY, HH:mm hoặc DD/MM/YYYY HH:mm
  const dmyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})/;
  const dmyMatch = trimmed.match(dmyPattern);
  if (dmyMatch) {
    const [, d, mo, y, h, m] = dmyMatch;
    return `${h.padStart(2, '0')}:${m} ${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${y}`;
  }

  // Khớp định dạng quốc tế: YYYY-MM-DD HH:mm hoặc YYYY-MM-DDTHH:mm:ss
  const ymdPattern = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/;
  const ymdMatch = trimmed.match(ymdPattern);
  if (ymdMatch) {
    const [, y, mo, d, h = '00', m = '00'] = ymdMatch;
    return `${h.padStart(2, '0')}:${m} ${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${y}`;
  }

  // Fallback qua JavaScript Date
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const hours = String(parsed.getHours()).padStart(2, '0');
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

  return trimmed;
}

