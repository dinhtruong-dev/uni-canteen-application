import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  CheckCircle2,
  MapPin,
  Utensils,
  Camera,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface FoodReviewsViewProps {
  foodId?: string;
}

interface ReviewComment {
  id: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
  canteenName?: string;
}

export const FoodReviewsView: React.FC<FoodReviewsViewProps> = ({ foodId }) => {
  const { foods, viewParams, navigateTo, canteens, showToast } = useApp();

  const isCanteenReview = viewParams?.isCanteen || (viewParams?.canteenId && !foodId && !viewParams?.foodId);
  const canteen = viewParams?.canteen || canteens.find((c) => c.id === viewParams?.canteenId);

  const activeFoodId = foodId || viewParams?.foodId || viewParams?.food?.id;
  const food = isCanteenReview ? null : (foods.find((f) => f.id === activeFoodId) || viewParams?.food || foods[0]);
  const foodCanteen = food ? canteens.find((c) => c.id === food.canteenId) : null;

  const targetRating = isCanteenReview ? (canteen?.rating || 4.8) : (food?.rating || 4.8);
  const targetReviewCount = isCanteenReview ? (canteen?.reviewCount || 120) : (food?.reviewCount || 120);

  // Initial Mock Reviews
  const [reviews, setReviews] = useState<ReviewComment[]>(
    isCanteenReview
      ? [
          {
            id: 'rev-c1',
            userName: 'Nguyễn Văn Hùng',
            userRole: 'SV Khoa Tự Động Hóa',
            rating: 5,
            date: 'Hôm nay, 10:15',
            comment: 'Căng tin sạch sẽ, nhân viên quầy phục vụ rất nhanh nhẹn và thân thiện. Không gian thoáng mát giờ ăn trưa.',
            verifiedPurchase: true,
            helpfulCount: 22,
          },
          {
            id: 'rev-c2',
            userName: 'Lê Thảo My',
            userRole: 'SV Khoa Ngoại Thương',
            rating: 5,
            date: 'Hôm qua, 12:30',
            comment: 'Menu phong phú, giá sinh viên. Đặt trên app rồi xuống lấy không phải chen chúc chút nào.',
            verifiedPurchase: true,
            helpfulCount: 15,
            images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'],
          },
          {
            id: 'rev-c3',
            userName: 'Vũ Đức Thành',
            userRole: 'SV Viện CNTT',
            rating: 4,
            date: '3 ngày trước',
            comment: 'Bàn ghế sạch, có chỗ sạc điện thoại tiện lợi. Giờ cao điểm hơi đông nhưng đồ ra khá đều tay.',
            verifiedPurchase: true,
            helpfulCount: 7,
          },
        ]
      : [
          {
            id: 'rev-1',
            userName: 'Trần Minh Quân',
            userRole: 'SV Khoa CNTT • KTX A1',
            rating: 5,
            date: 'Hôm nay, 11:20',
            comment: 'Thịt thơm ngon đậm vị, cơm dẻo nóng hổi! Căng tin phục vụ nhanh hơn mong đợi, không phải xếp hàng lâu.',
            verifiedPurchase: true,
            helpfulCount: 14,
            images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'],
          },
          {
            id: 'rev-2',
            userName: 'Lê Thu Hà',
            userRole: 'SV Khoa Kinh Tế • Lớp ĐH22',
            rating: 5,
            date: 'Hôm qua, 18:45',
            comment: 'Khá ấn tượng với nước sốt đậm đà, đùi gà giòn rụm. Đủ năng lượng cho cả buổi chiều chạy deadline!',
            verifiedPurchase: true,
            helpfulCount: 8,
          },
          {
            id: 'rev-3',
            userName: 'Nguyễn Hoàng Nam',
            userRole: 'SV Khoa Cơ Khí • KTX B3',
            rating: 4,
            date: '3 ngày trước',
            comment: 'Món ăn đầy đặn, giá cả sinh viên rất hợp lý. Nếu cho thêm xíu rau tươi nữa thì tuyệt đối 5 sao!',
            verifiedPurchase: true,
            helpfulCount: 5,
          },
          {
            id: 'rev-4',
            userName: 'Phạm Thanh Thảo',
            userRole: 'SV Ngoại Ngữ • Tòa A2',
            rating: 5,
            date: '5 ngày trước',
            comment: 'Order trên ứng dụng siêu tiện, xuống căng tin đọc mã là có luôn không lo trễ giờ vào lớp.',
            verifiedPurchase: true,
            helpfulCount: 19,
          },
          {
            id: 'rev-5',
            userName: 'Đỗ Đức Anh',
            userRole: 'SV Kiến Trúc',
            rating: 4,
            date: '1 tuần trước',
            comment: 'Món ăn chuẩn vị, phục vụ chu đáo, sẽ ghé lại ăn thường xuyên.',
            verifiedPurchase: true,
            helpfulCount: 3,
          },
        ]
  );

  const [activeStarFilter, setActiveStarFilter] = useState<number | 'ALL'>('ALL');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [helpfulLiked, setHelpfulLiked] = useState<Record<string, boolean>>({});

  const soldCount = food ? (food.soldCount || (food.reviewCount * 3 + 120)) : 0;

  // Star Distribution percentages
  const starBreakdown = [
    { stars: 5, percent: 82, count: Math.round(targetReviewCount * 0.82) },
    { stars: 4, percent: 12, count: Math.round(targetReviewCount * 0.12) },
    { stars: 3, percent: 4, count: Math.round(targetReviewCount * 0.04) },
    { stars: 2, percent: 1, count: Math.round(targetReviewCount * 0.01) },
    { stars: 1, percent: 1, count: Math.round(targetReviewCount * 0.01) },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (activeStarFilter === 'ALL') return true;
    return r.rating === activeStarFilter;
  });

  const handleHelpfulToggle = (reviewId: string) => {
    setHelpfulLiked((prev) => {
      const isLiked = prev[reviewId];
      const nextState = !isLiked;
      
      setReviews((list) =>
        list.map((r) =>
          r.id === reviewId
            ? { ...r, helpfulCount: r.helpfulCount + (nextState ? 1 : -1) }
            : r
        )
      );

      return { ...prev, [reviewId]: nextState };
    });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Vui lòng viết nhận xét bình luận trước khi gửi!', 'warning');
      return;
    }

    const createdReview: ReviewComment = {
      id: `rev-new-${Date.now()}`,
      userName: 'Bạn (Sinh viên)',
      userRole: 'Tài khoản của bạn',
      rating: newRating,
      date: 'Vừa xong',
      comment: newComment.trim(),
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    setReviews([createdReview, ...reviews]);
    setNewComment('');
    showToast(isCanteenReview ? 'Cảm ơn bạn đã gửi đánh giá cho căng tin!' : 'Cảm ơn bạn đã gửi đánh giá cho món ăn này!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            if (isCanteenReview) {
              navigateTo('home');
            } else if (food) {
              navigateTo('food-detail', { foodId: food.id });
            } else {
              navigateTo('home');
            }
          }}
          className="p-2 -ml-2 rounded-full text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-extrabold text-slate-900 text-center flex-1 truncate px-2">
          {isCanteenReview ? 'Đánh giá Căng tin' : 'Đánh giá & Bình luận'}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Mini Summary Banner (Canteen or Food) */}
      {isCanteenReview && canteen ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex items-center gap-3 shadow-2xs">
          <img
            src={canteen.image}
            alt={canteen.name}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-slate-900 text-sm truncate">{canteen.name}</h2>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
              <span>{canteen.location}</span>
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
              <span className="text-emerald-600 font-bold">{canteen.isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-[11px] font-medium">{canteen.openingHours}</span>
            </div>
          </div>
        </div>
      ) : food ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex items-center gap-3 shadow-2xs">
          <img
            src={food.image}
            alt={food.name}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-slate-900 text-sm truncate">{food.name}</h2>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
              <span>{food.canteenName || foodCanteen?.name || 'Căng tin sinh viên'}</span>
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs font-bold text-sky-500">
              <span>{food.price.toLocaleString('vi-VN')}đ</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-[11px] font-medium">Đã bán {soldCount}+</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Overall Ratings & Star Distribution Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-100">
          {/* Main Average Score */}
          <div className="text-center shrink-0 space-y-1">
            <div className="text-4xl font-black text-slate-900">{targetRating}</div>
            <div className="flex items-center justify-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(targetRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-100'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Dựa trên <strong className="text-slate-800">{targetReviewCount}</strong> đánh giá
            </div>
          </div>

          {/* Star Distribution Bars */}
          <div className="flex-1 w-full space-y-1.5">
            {starBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 w-12 text-slate-700 font-bold shrink-0">
                  <span>{item.stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <span className="w-9 text-right text-[11px] font-semibold text-slate-400 shrink-0">
                  {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Star Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setActiveStarFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStarFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setActiveStarFilter(stars)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeStarFilter === stars
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{stars} sao</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Form Viết bình luận đánh giá */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span>Gửi đánh giá của bạn</span>
        </h3>

        <form onSubmit={handleAddReview} className="space-y-3">
          {/* Star selector */}
          <div className="flex items-center gap-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-100/80">
            <span className="text-xs font-bold text-slate-700 mr-1">Chất lượng:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= newRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-extrabold text-amber-700 ml-auto">
              {newRating === 5
                ? 'Cực kỳ ngon ⭐⭐⭐⭐⭐'
                : newRating === 4
                ? 'Ngon miệng ⭐⭐⭐⭐'
                : newRating === 3
                ? 'Bình thường ⭐⭐⭐'
                : newRating === 2
                ? 'Cần cải thiện ⭐⭐'
                : 'Chưa hài lòng ⭐'}
            </span>
          </div>

          {/* Comment input */}
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận thực tế về hương vị, thái độ phục vụ căng tin, phần ăn..."
              rows={3}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Đánh giá xác thực từ sinh viên
            </span>

            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Gửi đánh giá
            </button>
          </div>
        </form>
      </div>

      {/* Mục Đánh giá bằng Bình luận */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm px-1 flex items-center gap-2">
          <span>Bình luận thực tế ({filteredReviews.length})</span>
        </h3>

        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs font-semibold">
            Chưa có bình luận nào cho mức đánh giá này.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((rev) => {
              const isHelpful = helpfulLiked[rev.id];

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5"
                >
                  {/* User Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200 shrink-0">
                        {rev.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-800 text-xs">{rev.userName}</h4>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã mua món
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{rev.userRole}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{rev.date}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment Text */}
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">{rev.comment}</p>

                  {/* Comment Images if available */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {rev.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Ảnh thực tế"
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200/80 shadow-2xs"
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer - Helpful Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleHelpfulToggle(rev.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        isHelpful
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? 'fill-current' : ''}`} />
                      <span>Hữu ích ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
