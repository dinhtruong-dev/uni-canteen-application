import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  Send,
  CheckCircle2,
  MapPin,
  Utensils,
  ShoppingBag,
  Lock,
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
  const { foods, viewParams, navigateTo, canteens, orders, showToast } = useApp();

  const isCanteenReview = viewParams?.isCanteen || (viewParams?.canteenId && !foodId && !viewParams?.foodId);
  const canteen = viewParams?.canteen || canteens.find((c) => c.id === viewParams?.canteenId);

  const activeFoodId = foodId || viewParams?.foodId || viewParams?.food?.id;
  const food = isCanteenReview ? null : (foods.find((f) => f.id === activeFoodId) || viewParams?.food || foods[0]);
  const foodCanteen = food ? canteens.find((c) => c.id === food.canteenId) : null;

  const targetRating = isCanteenReview ? (canteen?.rating || 4.8) : (food?.rating || 4.8);
  const targetReviewCount = isCanteenReview ? (canteen?.reviewCount || 120) : (food?.reviewCount || 120);

  // Kiểm tra điều kiện: Khách hàng PHẢI có đơn hàng hoàn thành (COMPLETED) mới được đánh giá
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const eligibleOrder = isCanteenReview
    ? completedOrders.find((o) => o.canteenId === canteen?.id)
    : completedOrders.find((o) => o.items.some((it) => it.food.id === food?.id));

  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

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
            comment: 'Cực kỳ ngon & phục vụ chu đáo',
            verifiedPurchase: true,
            helpfulCount: 22,
          },
          {
            id: 'rev-c2',
            userName: 'Lê Thảo My',
            userRole: 'SV Khoa Ngoại Thương',
            rating: 5,
            date: 'Hôm qua, 12:30',
            comment: 'Rất hài lòng, đồ ăn ra nhanh',
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
            comment: 'Hài lòng với chất lượng phục vụ',
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
            comment: 'Cực kỳ ngon miệng & chuẩn vị',
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
            comment: 'Rất ngon, phần ăn no nê',
            verifiedPurchase: true,
            helpfulCount: 8,
          },
          {
            id: 'rev-3',
            userName: 'Nguyễn Hoàng Nam',
            userRole: 'SV Khoa Cơ Khí • KTX B3',
            rating: 4,
            date: '3 ngày trước',
            comment: 'Hài lòng, đồ ăn nóng sốt',
            verifiedPurchase: true,
            helpfulCount: 5,
          },
          {
            id: 'rev-4',
            userName: 'Phạm Thanh Thảo',
            userRole: 'SV Ngoại Ngữ • Tòa A2',
            rating: 5,
            date: '5 ngày trước',
            comment: 'Tuyệt vời, sẽ tiếp tục ủng hộ',
            verifiedPurchase: true,
            helpfulCount: 19,
          },
          {
            id: 'rev-5',
            userName: 'Đỗ Đức Anh',
            userRole: 'SV Kiến Trúc',
            rating: 4,
            date: '1 tuần trước',
            comment: 'Món ăn ngon và sạch sẽ',
            verifiedPurchase: true,
            helpfulCount: 3,
          },
        ]
  );

  const [activeStarFilter, setActiveStarFilter] = useState<number | 'ALL'>('ALL');
  const [newRating, setNewRating] = useState<number>(5);
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

    if (!eligibleOrder) {
      showToast('Bạn chỉ có thể đánh giá sau khi đã hoàn thành đơn hàng!', 'error');
      return;
    }

    const ratingDescriptions: Record<number, string> = {
      5: 'Cực kỳ ngon & hài lòng ⭐⭐⭐⭐⭐',
      4: 'Ngon miệng & phục vụ tốt ⭐⭐⭐⭐',
      3: 'Bình thường ⭐⭐⭐',
      2: 'Tạm được ⭐⭐',
      1: 'Cần cải thiện ⭐',
    };

    const createdReview: ReviewComment = {
      id: `rev-new-${Date.now()}`,
      userName: 'Bạn (Sinh viên)',
      userRole: `Đơn #${eligibleOrder.orderNumber} • Đã mua hàng`,
      rating: newRating,
      date: 'Vừa xong',
      comment: ratingDescriptions[newRating] || `Đánh giá ${newRating} sao`,
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    setReviews([createdReview, ...reviews]);
    setHasSubmittedReview(true);
    showToast(isCanteenReview ? 'Cảm ơn bạn đã gửi đánh giá cho căng tin!' : 'Cảm ơn bạn đã gửi đánh giá cho món ăn!', 'success');
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
          {isCanteenReview ? 'Đánh giá Căng tin' : 'Đánh giá & Xếp hạng'}
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

      {/* ĐÁNH GIÁ: Bắt buộc hoàn thành đơn hàng mới được đánh giá, và BỎ phần viết nhận xét */}
      {!eligibleOrder ? (
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 text-center space-y-3 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm">
              Chỉ khách hàng đã hoàn thành đơn mới được đánh giá
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Để bảo đảm tính khách quan và tránh tình trạng đánh giá tràn lan, bạn cần đặt món và <strong className="text-slate-700">hoàn thành đơn hàng</strong> tại căng tin trước khi gửi đánh giá.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                if (food) navigateTo('food-detail', { foodId: food.id });
                else navigateTo('category', { canteenId: canteen?.id, canteen });
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" /> Đặt món ngay
            </button>
            <button
              onClick={() => navigateTo('orders')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Đơn hàng của tôi
            </button>
          </div>
        </div>
      ) : hasSubmittedReview ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-extrabold text-emerald-900 text-sm">
            Bạn đã gửi đánh giá cho đơn hàng #{eligibleOrder.orderNumber}
          </h4>
          <p className="text-xs text-emerald-700">
            Cảm ơn bạn đã phản hồi đánh giá sao cho bữa ăn!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Đánh giá đơn hàng #{eligibleOrder.orderNumber}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã hoàn thành đơn
            </span>
          </div>

          <form onSubmit={handleAddReview} className="space-y-3.5">
            {/* Chọn số sao trực tiếp - Đã bỏ phần viết đánh giá */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Mức độ hài lòng:</span>
                <span className="text-xs font-extrabold text-amber-800">
                  {newRating === 5
                    ? '⭐⭐⭐⭐⭐ Cực kỳ ngon & hài lòng'
                    : newRating === 4
                    ? '⭐⭐⭐⭐ Ngon miệng'
                    : newRating === 3
                    ? '⭐⭐⭐ Bình thường'
                    : newRating === 2
                    ? '⭐⭐ Tạm được'
                    : '⭐ Cần cải thiện'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1.5 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                    title={`${star} sao`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 ${
                        star <= newRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                          : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Xác thực đã dùng bữa
              </span>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Gửi đánh giá
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách Đánh giá thực tế từ khách hàng đã mua */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm px-1 flex items-center gap-2">
          <span>Đánh giá từ khách hàng ({filteredReviews.length})</span>
        </h3>

        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs font-semibold">
            Chưa có đánh giá nào cho mức này.
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
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã hoàn thành đơn
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{rev.userRole}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{rev.date}</span>
                  </div>

                  {/* Rating Stars & Sentiment */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.comment && (
                      <span className="text-slate-700 text-xs font-semibold">
                        {rev.comment}
                      </span>
                    )}
                  </div>

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
