import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
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
import { apiClient, adminService } from '../../services/api/client';
import { HeaderNav } from '../../components/common/HeaderNav';

interface FoodReviewsViewProps {
  foodId?: string;
}

interface ReviewComment {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  orderId?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  images?: string[];
  canteenName?: string;
  replyText?: string;
  reply?: string;
  repliedAt?: string;
}

export const FoodReviewsView: React.FC<FoodReviewsViewProps> = ({ foodId }) => {
  const { foods, viewParams, navigateTo, goBack, canteens, orders, showToast, currentUser } = useApp();

  const isCanteenReview = viewParams?.isCanteen || (viewParams?.canteenId && !foodId && !viewParams?.foodId);
  const canteen = viewParams?.canteen || canteens.find((c) => c.id === viewParams?.canteenId);

  const activeFoodId = foodId || viewParams?.foodId || viewParams?.food?.id;
  const food = isCanteenReview ? null : (foods.find((f) => f.id === activeFoodId) || viewParams?.food || foods[0]);
  const foodCanteen = food ? canteens.find((c) => c.id === food.canteenId) : null;

  const targetRating = isCanteenReview ? (canteen?.rating || 4.8) : (food?.rating || 4.8);
  const targetReviewCount = isCanteenReview ? (canteen?.reviewCount || 120) : (food?.reviewCount || 120);

  // Kiểm tra điều kiện: Khách hàng PHẢI có đơn hàng hoàn thành (COMPLETED hoặc SERVED) mới được đánh giá
  const completedOrders = orders.filter((o) => ['COMPLETED', 'SERVED'].includes(o.status));
  const eligibleOrders = isCanteenReview
    ? completedOrders.filter((o) => o.canteenId === canteen?.id)
    : completedOrders.filter((o) => o.items.some((it) => it.food?.id === food?.id));

  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [customComment, setCustomComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Mock Reviews with fallback to DB
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
      ]
  );

  // Kiểm tra đơn hàng nào chưa được đánh giá
  const reviewedOrderIds = new Set(reviews.filter((r) => r.orderId).map((r) => r.orderId));
  const unreviewedOrder = eligibleOrders.find((o) => !reviewedOrderIds.has(o.id));
  const eligibleOrder = unreviewedOrder || eligibleOrders[0];

  const userExistingReview = reviews.find(
    (r) =>
      (currentUser && r.userId === currentUser.id) ||
      (r.orderId && eligibleOrders.some((o) => o.id === r.orderId))
  );

  const isAlreadyReviewed = hasSubmittedReview || (Boolean(userExistingReview) && !unreviewedOrder);

  // Load live reviews from MySQL database
  useEffect(() => {
    const fetchDbReviews = async () => {
      try {
        const targetType = isCanteenReview ? 'CANTEEN' : 'PRODUCT';
        const targetId = isCanteenReview ? (canteen?.id || 'can-1') : (food?.id || 'f1');
        const res: any = await apiClient.get('/reviews', { targetType, targetId });
        if (res && res.data && res.data.length > 0) {
          const mapped: ReviewComment[] = res.data.map((r: any) => ({
            id: r.id,
            userId: r.userId,
            userName: r.userName || 'Sinh viên',
            userRole: r.userRole || 'Đã mua hàng',
            userAvatar: r.userAvatar,
            orderId: r.orderId,
            rating: Number(r.rating) || 5,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Gần đây',
            comment: r.comment || '',
            verifiedPurchase: Boolean(r.verifiedPurchase),
            helpfulCount: Number(r.helpfulCount) || 0,
            images: r.images,
            replyText: r.replyText || r.reply,
            reply: r.replyText || r.reply,
            repliedAt: r.repliedAt,
          }));
          setReviews(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch DB reviews:', err);
      }
    };
    fetchDbReviews();
  }, [isCanteenReview, canteen?.id, food?.id]);

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

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eligibleOrder) {
      showToast('Bạn chỉ có thể đánh giá sau khi đã mua hàng và hoàn thành đơn hàng!', 'error');
      return;
    }

    if (isAlreadyReviewed) {
      showToast('Bạn đã đánh giá cho đơn hàng này rồi! Mỗi lần mua chỉ được đánh giá một lần.', 'info');
      return;
    }

    const ratingDescriptions: Record<number, string> = {
      5: 'Cực kỳ ngon & hài lòng ⭐⭐⭐⭐⭐',
      4: 'Ngon miệng & phục vụ tốt ⭐⭐⭐⭐',
      3: 'Bình thường ⭐⭐⭐',
      2: 'Tạm được ⭐⭐',
      1: 'Cần cải thiện ⭐',
    };

    const targetType = isCanteenReview ? 'CANTEEN' : 'PRODUCT';
    const targetId = isCanteenReview ? (canteen?.id || 'can-1') : (food?.id || 'f1');
    const comment = customComment.trim() || ratingDescriptions[newRating] || `Đánh giá ${newRating} sao`;

    setIsSubmitting(true);
    try {
      const res = await adminService.submitStudentReview({
        targetType,
        targetId,
        rating: newRating,
        comment,
        orderId: eligibleOrder.id,
        userId: currentUser?.id,
        userName: currentUser?.name,
      });

      const createdReview: ReviewComment = {
        id: res?.data?.id || `rev-new-${Date.now()}`,
        userId: currentUser?.id,
        userName: currentUser?.name || 'Bạn',
        userRole: `Đơn #${eligibleOrder.orderNumber} • Đã mua hàng`,
        userAvatar: currentUser?.avatar,
        orderId: eligibleOrder.id,
        rating: newRating,
        date: 'Vừa xong',
        comment,
        verifiedPurchase: true,
        helpfulCount: 0,
      };

      setReviews([createdReview, ...reviews]);
      setHasSubmittedReview(true);
      showToast(isCanteenReview ? 'Cảm ơn bạn đã gửi đánh giá cho căng tin vào hệ thống!' : 'Cảm ơn bạn đã gửi đánh giá cho món ăn vào hệ thống!', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      if (msg.includes('đã được đánh giá')) {
        setHasSubmittedReview(true);
        showToast('Đơn hàng này đã được bạn đánh giá rồi!', 'info');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <HeaderNav
        title={isCanteenReview ? 'Đánh giá Căng tin' : 'Đánh giá & Xếp hạng'}
        subtitle={isCanteenReview ? (canteen?.name || 'Căng tin sinh viên') : (food?.name || 'Món ăn')}
        onBack={() => {
          goBack(isCanteenReview ? 'home' : 'food-detail', food ? { foodId: food.id } : undefined);
        }}
      />

      {/* Mini Summary Banner (Canteen or Food) */}

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
                  className={`w-4 h-4 ${star <= Math.round(targetRating)
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
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeStarFilter === 'ALL'
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
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeStarFilter === stars
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

      {/* ĐIỀU KIỆN ĐÁNH GIÁ: Chỉ được đánh giá 1 lần sau khi hoàn thành đơn hàng */}
      {isAlreadyReviewed ? (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950">Đánh giá của bạn</h3>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {eligibleOrder ? `Đơn hàng #${eligibleOrder.orderNumber} • Đã mua hàng` : 'Đã lưu trữ trên hệ thống'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Chỉ đánh giá 1 lần
            </span>
          </div>

          {userExistingReview && (
            <div className="bg-white rounded-2xl p-4 border border-emerald-100 space-y-2.5 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s <= userExistingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'}`}
                  />
                ))}
                <span className="font-bold text-slate-800 ml-1.5">{userExistingReview.rating}/5</span>
              </div>
              {userExistingReview.comment && (
                <p className="text-slate-700 font-medium">{userExistingReview.comment}</p>
              )}

              {/* Canteen Reply to customer's review */}
              {(userExistingReview.replyText || userExistingReview.reply) ? (
                <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-600" />
                      Phản hồi từ Quản trị Căng tin:
                    </span>
                    {userExistingReview.repliedAt && (
                      <span className="text-[10px] text-amber-700 font-medium">
                        {new Date(userExistingReview.repliedAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium pl-4 border-l-2 border-amber-400">
                    {userExistingReview.replyText || userExistingReview.reply}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic pt-1">
                  ⏳ Căng tin đang tiếp nhận và sẽ sớm phản hồi đánh giá của bạn.
                </p>
              )}
            </div>
          )}
        </div>
      ) : eligibleOrders.length > 0 ? (
        /* Form for eligible completed order */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Viết đánh giá cho {isCanteenReview ? 'Căng tin' : 'Món ăn'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Áp dụng cho đơn hàng đã hoàn thành: <strong className="text-slate-700">#{eligibleOrder?.orderNumber}</strong>
              </p>
            </div>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              1 lần duy nhất
            </span>
          </div>

          <form onSubmit={handleAddReview} className="space-y-3.5">
            {/* Interactive Stars */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-2xl border border-slate-100 gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Bạn thấy chất lượng thế nào?</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95"
                    title={`${star} sao`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-600">
                {newRating === 5 && 'Cực kỳ ngon & hài lòng ⭐⭐⭐⭐⭐'}
                {newRating === 4 && 'Ngon miệng & phục vụ tốt ⭐⭐⭐⭐'}
                {newRating === 3 && 'Bình thường ⭐⭐⭐'}
                {newRating === 2 && 'Tạm được ⭐⭐'}
                {newRating === 1 && 'Cần cải thiện ⭐'}
              </span>
            </div>

            {/* Comment input */}
            <div className="space-y-1">
              <input
                type="text"
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder="Nhập cảm nhận chi tiết của bạn về bữa ăn (tuỳ chọn)..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu vào hệ thống...' : 'Gửi Đánh Giá Vào Hệ Thống'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Not eligible yet */
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4.5 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="font-extrabold text-xs text-slate-800">
            Chưa có đơn hàng hoàn thành
          </h3>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
            Để đảm bảo tính khách quan và trung thực, chỉ khách hàng đã mua và hoàn thành đơn hàng mới có thể gửi đánh giá cho {isCanteenReview ? 'căng tin' : 'món ăn'} này.
          </p>
          {!isCanteenReview && food && (
            <button
              onClick={() => navigateTo('food-detail', { foodId: food.id })}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer mt-1"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Đặt món này ngay</span>
            </button>
          )}
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
                          className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
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

                  {/* Canteen / Admin Reply if present */}
                  {(rev.replyText || rev.reply) && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 text-xs space-y-1.5 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          Phản hồi từ Quản trị Căng tin:
                        </span>
                        {rev.repliedAt && (
                          <span className="text-[10px] text-amber-700/80 font-medium">
                            {new Date(rev.repliedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <p className="text-amber-900 leading-relaxed font-medium pl-4 border-l-2 border-amber-400">
                        {rev.replyText || rev.reply}
                      </p>
                    </div>
                  )}

                  {/* Footer - Helpful Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleHelpfulToggle(rev.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${isHelpful
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
