import React, { useState } from 'react';
import {
  Star,
  Search,
  Filter,
  Eye,
  EyeOff,
  Store,
  UtensilsCrossed,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  studentId?: string;
  foodName: string;
  canteenName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'VISIBLE' | 'HIDDEN';
}

export const AdminReviewsView: React.FC = () => {
  const { canteens, showToast } = useApp();

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      userName: 'Nguyễn Văn Minh',
      studentId: '20230012',
      foodName: 'Cơm Gà Xối Mỡ Sốt Chua Ngọt',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      rating: 5,
      comment: 'Cơm gà giòn rụm nóng hổi, canh ăn kèm rất ngọt nước, ăn no căng bụng giờ trưa!',
      createdAt: 'Hôm nay, 12:15',
      status: 'VISIBLE',
    },
    {
      id: 'rev-2',
      userName: 'Trần Thị Mai',
      studentId: '20230045',
      foodName: 'Phở Bò Tái Nạm Truyền Thống',
      canteenName: 'Căng Tin A - Giảng Đường Trung Tâm A2',
      rating: 4,
      comment: 'Nước dùng thanh, thịt bò tươi mềm. Tuy nhiên giờ cao điểm phải xếp hàng nhận hơi lâu xíu.',
      createdAt: 'Hôm qua, 07:45',
      status: 'VISIBLE',
    },
    {
      id: 'rev-3',
      userName: 'Lê Hoàng Nam',
      studentId: '20220199',
      foodName: 'Bún Bò Huế Căng Tin B',
      canteenName: 'Căng Tin B - Nhà Bếp Ký Túc Xá B5',
      rating: 5,
      comment: 'Quá ngon! Bát bún đầy đặn có chả cua và tiết luộc, giá sinh viên 35k quá hợp lý.',
      createdAt: '28/09/2026',
      status: 'VISIBLE',
    },
    {
      id: 'rev-4',
      userName: 'Tài khoản ẩn danh',
      studentId: '20240312',
      foodName: 'Cơm Tấm Sườn Bì',
      canteenName: 'Căng Tin B - Nhà Bếp Ký Túc Xá B5',
      rating: 1,
      comment: 'Spam từ ngữ thiếu văn hóa @@@@ vi phạm chính sách cộng đồng trường học.',
      createdAt: '25/09/2026',
      status: 'HIDDEN',
    },
  ]);

  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReviews = reviews.filter((r) => {
    const matchSearch =
      r.foodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCanteen = canteenFilter === 'ALL' || r.canteenName.includes(canteenFilter);
    const matchRating = ratingFilter === 'ALL' || r.rating === Number(ratingFilter);

    return matchSearch && matchCanteen && matchRating;
  });

  const handleToggleVisibility = (id: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE' }
          : r
      )
    );
    showToast('Đã cập nhật trạng thái hiển thị của đánh giá!', 'info');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa vĩnh viễn đánh giá này?')) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Đã xóa đánh giá vi phạm!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            Kiểm Duyệt Đánh Giá & Phản Hồi Sinh Viên
          </h2>
          <p className="text-xs text-slate-400">
            Theo dõi ý kiến phản hồi về chất lượng món ăn, phục vụ căn tin, lọc và ẩn các bình luận vi phạm nội quy.
          </p>
        </div>

        {/* Filter and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo món ăn, sinh viên, bình luận..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <select
            value={canteenFilter}
            onChange={(e) => setCanteenFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả Căn tin</option>
            {canteens.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 outline-hidden"
          >
            <option value="ALL">Tất cả số sao đánh giá</option>
            <option value="5">5 sao (Xuất sắc)</option>
            <option value="4">4 sao (Tốt)</option>
            <option value="3">3 sao (Bình thường)</option>
            <option value="2">2 sao (Chưa hài lòng)</option>
            <option value="1">1 sao (Kém)</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            Không tìm thấy đánh giá nào phù hợp.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className={`bg-slate-900/90 border p-5 rounded-3xl transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                r.status === 'VISIBLE'
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-rose-900/40 bg-slate-950/60 opacity-70'
              }`}
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                    {r.userName.charAt(0)}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-100 text-xs">{r.userName}</span>
                    {r.studentId && (
                      <span className="text-[10px] text-slate-500 font-mono ml-2">
                        MSSV: {r.studentId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 ml-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= r.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700 fill-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-500">• {r.createdAt}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    {r.foodName}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    {r.canteenName}
                  </span>
                </div>

                <p className="text-xs text-slate-200 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80 leading-relaxed">
                  "{r.comment}"
                </p>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    r.status === 'VISIBLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {r.status === 'VISIBLE' ? 'HIỂN THỊ' : 'ĐÃ ẨN'}
                </span>

                <button
                  onClick={() => handleToggleVisibility(r.id)}
                  className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    r.status === 'VISIBLE'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                  }`}
                  title={r.status === 'VISIBLE' ? 'Ẩn đánh giá' : 'Hiện lại đánh giá'}
                >
                  {r.status === 'VISIBLE' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                  title="Xóa đánh giá vi phạm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
