import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  Send,
  User,
  Utensils,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { staffService } from '../../services/api';

export const StaffReviewsView: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await staffService.getReviews({
        canteenId: 'cant-a',
        rating: ratingFilter === 'ALL' ? undefined : Number(ratingFilter),
      });
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [ratingFilter]);

  const handleSendReply = async (reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text) return;

    try {
      setReplyingId(reviewId);
      const res = await staffService.replyReview(reviewId, text);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, reply: text } : r))
        );
        setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
      }
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              TRẢI NGHIỆM SINH VIÊN
            </span>
            <span className="text-xs text-slate-400">{reviews.length} lượt đánh giá món</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 mt-1">Đánh Giá & Phản Hồi Món Ăn</h2>
        </div>

        {/* Filter by Stars */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', '5', '4', '3', '2', '1'].map((st) => (
            <button
              key={st}
              onClick={() => setRatingFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                ratingFilter === st
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : `${st} sao`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Đang tải đánh giá của sinh viên...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
            Không có đánh giá nào phù hợp với bộ lọc
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-3"
            >
              {/* User & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {rev.userName ? rev.userName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{rev.userName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Utensils className="w-3 h-3 text-emerald-400" />
                      <span>{rev.productName || 'Món ăn căn tin'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs text-slate-200 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                "{rev.comment}"
              </p>

              {/* Canteen Reply Section */}
              {rev.reply ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Phản hồi từ Căng tin A2:</span>
                  </div>
                  <div className="text-slate-300">{rev.reply}</div>
                </div>
              ) : (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyTextMap[rev.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })
                    }
                    placeholder="Viết lời cảm ơn hoặc phản hồi cho sinh viên..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleSendReply(rev.id)}
                    disabled={replyingId === rev.id || !replyTextMap[rev.id]?.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
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
