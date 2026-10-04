import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Clock,
  User,
  Store,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { getSocket } from '../services/socket.client';

export interface OrderChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'STAFF' | 'KITCHEN';
  message: string;
  timestamp: string;
}

interface OrderChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode?: string;
  currentUserRole: 'CUSTOMER' | 'STAFF';
  currentUserName: string;
  currentUserId: string;
  targetUserName?: string;
  canteenName?: string;
}

export const OrderChatModal: React.FC<OrderChatModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
  currentUserRole,
  currentUserName,
  currentUserId,
  targetUserName = 'Nhân viên Căn tin',
  canteenName = 'Căn tin Trường',
}) => {
  const [messages, setMessages] = useState<OrderChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestions based on role
  const quickTemplates =
    currentUserRole === 'CUSTOMER'
      ? [
          'Quán cho mình xin thêm ớt / tương cà nha',
          'Đơn của mình khoảng mấy phút nữa xong ạ?',
          'Mình đã tới trước quầy nhận món rồi ạ',
          'Đổi giúp mình cơm sườn sang ít cơm được không?',
        ]
      : [
          'Dạ căn tin đã nhận ghi chú và chuẩn bị cho bạn rồi nhé!',
          'Bếp đang hoàn tất món cho bạn trong khoảng 2 phút nữa!',
          'Món ăn đã sẵn sàng, mời bạn qua quầy xuất trình mã để nhận nhé!',
          'Căn tin cảm ơn bạn nhiều nhé, chúc bạn ngon miệng!',
        ];

  // Sound ping for chat
  const playChatPing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Audio allowed upon interaction
    }
  };

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const socket = getSocket();
    if (!socket) {
      setIsConnected(false);
      return;
    }

    setIsConnected(socket.connected);

    // Join room for this specific order
    socket.emit('order:join', orderId);

    // Initial message history from server
    const handleHistory = (payload: { orderId: string; messages: OrderChatMessage[] }) => {
      if (payload.orderId === orderId && Array.isArray(payload.messages)) {
        setMessages(payload.messages);
      }
    };

    // New incoming message (Deduplication against local optimistic messages)
    const handleNewMessage = (msg: OrderChatMessage) => {
      if (msg.orderId === orderId) {
        setMessages((prev) => {
          // 1. Kiểm tra nếu ID đã có trong danh sách
          if (prev.some((m) => m.id === msg.id)) return prev;

          // 2. Kiểm tra nếu trùng với tin nhắn tạm gửi từ client (cùng người gửi và nội dung)
          const localIdx = prev.findIndex(
            (m) =>
              (m.id.startsWith('msg-local-') || m.id === msg.id) &&
              m.senderId === msg.senderId &&
              m.message === msg.message
          );

          if (localIdx !== -1) {
            const updated = [...prev];
            updated[localIdx] = msg;
            return updated;
          }

          return [...prev, msg];
        });

        if (msg.senderId !== currentUserId) {
          playChatPing();
        }
      }
    };

    socket.on('order:messages:history', handleHistory);
    socket.on('order:message:received', handleNewMessage);

    return () => {
      socket.emit('order:leave', orderId);
      socket.off('order:messages:history', handleHistory);
      socket.off('order:message:received', handleNewMessage);
    };
  }, [isOpen, orderId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const socket = getSocket();
    const timeNow = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const localId = `msg-local-${Date.now()}`;

    const localMsg: OrderChatMessage = {
      id: localId,
      orderId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      message: text,
      timestamp: timeNow,
    };

    // Optimistic append
    setMessages((prev) => [...prev, localMsg]);
    setInputMessage('');

    if (socket) {
      socket.emit('order:message:send', {
        clientMsgId: localId,
        orderId,
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        message: text,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg h-[85vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <header className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#22c3d3]/15 text-[#22c3d3] flex items-center justify-center font-bold text-lg shrink-0 border border-[#22c3d3]/30">
              {currentUserRole === 'CUSTOMER' ? (
                <Store className="w-5 h-5 text-[#22c3d3]" />
              ) : (
                <User className="w-5 h-5 text-[#22c3d3]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold text-white tracking-tight">
                  {currentUserRole === 'CUSTOMER' ? canteenName : `Khách: ${targetUserName}`}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Trực tuyến
                </span>
              </div>
              <p className="text-[12px] text-slate-300 flex items-center gap-1.5">
                <span>Đơn #{orderCode || orderId}</span>
                <span>•</span>
                <span className="text-slate-400">Giao tiếp Realtime Socket</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ chat"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/50">
          {/* Welcome Announcement */}
          <div className="bg-[#22c3d3]/10 border border-[#22c3d3]/20 rounded-2xl p-3 text-center space-y-1">
            <p className="text-[12px] font-bold text-[#0891b2] dark:text-[#22c3d3] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Kênh trao đổi trực tiếp đơn hàng #{orderCode || orderId}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {currentUserRole === 'CUSTOMER'
                ? 'Nhân viên quầy và bếp sẽ nhận tin nhắn của bạn ngay lập tức trên màn hình làm việc.'
                : 'Tin nhắn sẽ hiển thị tức thì trên màn hình điện thoại của khách hàng.'}
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-[13px]">Chưa có tin nhắn nào trong đơn hàng này.</p>
              <p className="text-[11px] text-slate-400">
                Hãy gửi tin nhắn hoặc chọn gợi ý bên dưới để trao đổi nhé!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId || msg.senderRole === currentUserRole;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isMe ? 'Bạn' : msg.senderName}
                    </span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-[#22c3d3] text-white rounded-tr-xs font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {quickTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(template)}
              className="text-[11px] whitespace-nowrap bg-slate-100 dark:bg-slate-800 hover:bg-[#22c3d3]/15 hover:text-[#0891b2] dark:hover:text-[#22c3d3] text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
            >
              {template}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              currentUserRole === 'CUSTOMER'
                ? 'Gửi yêu cầu hoặc nhắn hỏi nhân viên căn tin...'
                : 'Nhắn phản hồi cho khách đặt đơn...'
            }
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-2xl text-[13px] outline-none focus:ring-2 focus:ring-[#22c3d3] transition-all"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-10 h-10 rounded-2xl bg-[#22c3d3] hover:bg-[#1eb0bf] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0"
            aria-label="Gửi tin nhắn"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
