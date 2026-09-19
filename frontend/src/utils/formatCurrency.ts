/**
 * ĐỊNH DẠNG TIỀN TỆ VIỆT NAM ĐỒNG (VND)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0đ';
  return amount.toLocaleString('vi-VN') + 'đ';
}
