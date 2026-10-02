/**
 * Bảng OptionGroups (Quản lý luật & Tiêu đề nhóm):
 * - id: Mã nhóm (VD: grp-size, grp-topping)
 * - canteenId: Thuộc căng tin nào quản lý
 * - name: Tên nhóm (VD: "Chọn kích cỡ", "Mức đường", "Món ăn kèm")
 * - isRequired: Bắt buộc hay không (Boolean)
 * - minChoices: Chọn tối thiểu mấy cái (Mặc định: 0 hoặc 1)
 * - maxChoices: Chọn tối đa mấy cái (VD: Size = 1, Topping = 3)
 */
export interface OptionGroup {
  id: string;
  canteenId: string;
  name: string;
  isRequired: boolean;
  minChoices: number;
  maxChoices: number;
}

/**
 * Bảng OptionItems (Các lựa chọn cụ thể có giá tiền):
 * - id: Mã lựa chọn (VD: opt-size-l, opt-tranchau)
 * - groupId: Khóa ngoại trỏ về OptionGroups
 * - name: Tên hiển thị (VD: "Size L", "Trân châu đen", "Trứng ốp la")
 * - price: Giá tiền cộng thêm (VD: 10000, 5000, 0)
 * - isAvailable: Trạng thái còn hàng hay hết hàng tạm thời
 */
export interface OptionItem {
  id: string;
  groupId: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

/**
 * SelectedOptionSnapshot: Mô hình Snapshot chứa thông tin cấu hình tùy chọn
 * tại thời điểm tạo đơn hàng (immutable):
 * - groupId: Mã nhóm (VD: "grp-size")
 * - groupName: Tên nhóm (VD: "Kích cỡ")
 * - optionId: Mã lựa chọn (VD: "opt-size-l")
 * - optionName: Tên lựa chọn (VD: "Size L")
 * - price: Giá phụ thu tại thời điểm đặt (VD: 10000)
 */
export interface SelectedOptionSnapshot {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
  // Aliases tương thích ngược nếu các view cũ truy xuất
  itemId?: string;
  itemName?: string;
  extraPrice?: number;
}
