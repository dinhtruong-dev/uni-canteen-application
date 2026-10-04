import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Eye,
  EyeOff,
  Store,
  UtensilsCrossed,
  MessageSquare,
  Send,
  CornerDownRight,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { adminService } from '../../services/api';

interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  studentId?: string;
  foodName: string;
  productName?: string;
  canteenName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'VISIBLE' | 'HIDDEN';
  reply?: string;
  repliedAt?: string;
}

export const AdminReviewsView: React.FC = () => {
  const { canteens, showToast } = useApp();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [canteenFilter, setCanteenFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReviews({
        canteenId: canteenFilter,
        rating: ratingFilter,
      });
      if (res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      }
    } catch (err: any) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [canteenFilter, ratingFilter]);

  const filteredReviews = reviews.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (r.foodName || '').toLowerCase().includes(term) ||
      (r.userName || '').toLowerCase().includes(term) ||
      (r.comment || '').toLowerCase().includes(term);

    return matchSearch;
  });

  const handleToggleVisibility = async (id: string, currentStatus: 'VISIBLE' | 'HIDDEN') => {
    const nextStatus = currentStatus === 'VISIBLE' ? 'HIDDEN' : 'VISIBLE';
    try {
      await adminService.toggleReviewVisibility(id, nextStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );
      showToast(`Đã chuyển trạng thái đánh giá sang: ${nextStatus === 'VISIBLE' ? 'Hiển thị' : 'Đã ẩn'}`, 'info');
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái đánh giá', 'error');
    }
  };

  const handleSendReply = async (reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text) {
      showToast('Vui lòng nhập nội dung phản hồi', 'warning');
      return;
    }

    try {
      const res = await adminService.replyReview(reviewId, text);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, reply: text, repliedAt: new Date().toISOString() } : r))
        );
        setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
        setActiveReplyId(null);
        showToast('Đã gửi phản hồi đánh giá và lưu vào CSDL thành công!', 'success');
      }
    } catch (err) {
      showToast('Lỗi gửi phản hồi đánh giá', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            Kiểm Duyệt & Phản Hồi Đánh Giá Sinh Viên (CSDL Live)
          </h2>
          <p className="text-xs text-slate-400">
            Dữ liệu đánh giá từ bảng CSDL `reviews` trong MySQL. Bạn có thể ẩn/hiện bình luận hoặc gửi phản hồi chính thức từ ban quản trị.
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
              <option key={c.id} value={c.id}>
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
      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Đang tải dữ liệu đánh giá từ MySQL...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            Không tìm thấy đánh giá nào phù hợp trong CSDL.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className={`bg-slate-900/90 border p-5 rounded-3xl transition-all shadow-md space-y-3 ${
                r.status === 'VISIBLE'
                  ? 'border-slate-800 hover:border-slate-700'
                  : 'border-rose-900/40 bg-slate-950/60 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                      {r.userName?.charAt(0) || 'U'}
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

                    <span className="text-[10px] text-slate-500">
                      • {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      {r.foodName || r.productName || 'Món ăn'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      {r.canteenName || 'Căng tin Campus'}
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
                    onClick={() => handleToggleVisibility(r.id, r.status)}
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
                    onClick={() => setActiveReplyId(activeReplyId === r.id ? null : r.id)}
                    className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Phản hồi đánh giá"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Phản hồi</span>
                  </button>
                </div>
              </div>

              {/* Phản hồi hiện tại nếu có */}
              {r.reply && (
                <div className="ml-6 p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-start gap-2">
                  <CornerDownRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-purple-300 flex items-center gap-2">
                      <span>Ban Quản Trị Căn Tin đã phản hồi:</span>
                      {r.repliedAt && (
                        <span className="text-[10px] text-purple-400/70 font-normal">
                          {new Date(r.repliedAt).toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-slate-300">{r.reply}</p>
                  </div>
                </div>
              )}

              {/* Form nhập phản hồi */}
              {activeReplyId === r.id && (
                <div className="ml-6 pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyTextMap[r.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [r.id]: e.target.value })}
                    placeholder="Nhập nội dung phản hồi từ Ban Quản Trị..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 outline-hidden focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleSendReply(r.id)}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
