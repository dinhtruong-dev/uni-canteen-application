import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Users,
  Utensils,
  Store,
  RefreshCw,
  Sparkles,
  QrCode,
  Check,
} from 'lucide-react';
import jsQR from 'jsqr';
import { tableService } from '../../services/api/shared/table.service';

interface TableQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableUpdated?: () => void;
}

export const TableQRScannerModal: React.FC<TableQRScannerModalProps> = ({
  isOpen,
  onClose,
  onTableUpdated,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [scannedTable, setScannedTable] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        setCameraError('Trình duyệt không hỗ trợ truy cập Camera.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setHasPermission(false);
      setCameraError('Không thể mở Camera hoặc người dùng từ chối quyền.');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) { }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Continuous Camera scanning
  useEffect(() => {
    if (!isOpen || !hasPermission) return;

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qr && qr.data) {
            isScanning = false;
            handleLookup(qr.data);
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, hasPermission]);

  useEffect(() => {
    if (isOpen) {
      setScannedTable(null);
      setMessage(null);
      setInputCode('');
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  // Lookup Table by QR data, ID, or Table Number from MySQL Database
  const handleLookup = async (code: string) => {
    const query = code.trim();
    if (!query) return;

    try {
      setSearching(true);
      setMessage(null);
      const res = await tableService.scanQr(query);
      if (res?.success && res.data) {
        setScannedTable(res.data);
        setMessage({ text: `Tìm thấy dữ liệu từ MySQL: ${res.data.tableNumber}`, type: 'success' });
      } else {
        // Fallback getTableByQr
        const table = await tableService.getTableByQr(query);
        if (table) {
          setScannedTable(table);
          setMessage({ text: `Tìm thấy bàn: ${table.tableNumber || table.tableName}`, type: 'success' });
        } else {
          setScannedTable(null);
          setMessage({ text: `Không tìm thấy bàn ăn nào khớp với mã "${query}"`, type: 'error' });
        }
      }
    } catch (err: any) {
      setMessage({ text: err?.message || 'Lỗi tra cứu mã bàn từ CSDL', type: 'error' });
    } finally {
      setSearching(false);
    }
  };

  // Image Upload Scanner
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qr = jsQR(imgData.data, imgData.width, imgData.height);
          if (qr && qr.data) {
            handleLookup(qr.data);
          } else {
            setMessage({ text: 'Không phát hiện thấy mã QR hợp lệ trong hình ảnh tải lên.', type: 'error' });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick Change Status in MySQL DB
  const handleChangeStatus = async (newStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE') => {
    if (!scannedTable) return;
    try {
      setStatusUpdating(true);
      const res = await tableService.updateTable(scannedTable.id, { status: newStatus });
      if (res) {
        setScannedTable({ ...scannedTable, status: newStatus });
        setMessage({ text: `Đã cập nhật trạng thái bàn sang "${newStatus}" trong MySQL CSDL!`, type: 'success' });
        if (onTableUpdated) onTableUpdated();
      }
    } catch (err: any) {
      setMessage({ text: 'Lỗi cập nhật trạng thái bàn', type: 'error' });
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>Quét & Tra Cứu Mã Bàn Ăn</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/20">
                  Live MySQL CSDL
                </span>
              </h3>
              <p className="text-xs text-slate-400">Admin & Nhân viên quét QR để kiểm tra vị trí và quản lý bàn</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group shadow-inner">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Overlay Framing */}
          {hasPermission && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative animate-pulse shadow-lg shadow-emerald-500/20">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-sm" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/60 shadow-sm shadow-emerald-400 animate-bounce" />
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
              <Camera className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-400 max-w-xs">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
              >
                Thử lại Camera
              </button>
            </div>
          )}
        </div>

        {/* Manual Code Input & Image Upload */}
        <div className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(inputCode);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Nhập số bàn (vd: Bàn 01) hoặc dán link mã QR..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={searching || !inputCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {searching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Tìm bàn</span>
            </button>

            <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer shrink-0" title="Tải ảnh QR từ máy">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </form>

          {message && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : message.type === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* Scanned Table Result Card */}
        {scannedTable && (
          <div className="bg-slate-850 border border-slate-700/80 rounded-2xl p-4 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-sm font-mono">
                  {scannedTable.tableNumber?.replace(/[^0-9A-Za-z]/g, '').slice(-2) || 'TB'}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-100">{scannedTable.tableNumber}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Store className="w-3 h-3 text-emerald-400" />
                    <span>{scannedTable.canteenName || 'Căng tin A2'}</span>
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${scannedTable.status === 'AVAILABLE' || scannedTable.status === 'EMPTY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : scannedTable.status === 'OCCUPIED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : scannedTable.status === 'RESERVED'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700/40 text-slate-400 border border-slate-600'
                  }`}
              >
                {scannedTable.status === 'AVAILABLE' || scannedTable.status === 'EMPTY'
                  ? 'Bàn trống'
                  : scannedTable.status === 'OCCUPIED'
                    ? 'Có khách'
                    : scannedTable.status === 'RESERVED'
                      ? 'Đã đặt'
                      : 'Bảo trì'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Khu vực: {scannedTable.area || 'Khu chính'}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Sức chứa: {scannedTable.capacity || 4} chỗ</span>
              </div>
            </div>

            {/* Quick Status Buttons for Staff/Admin */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 mb-2">
                Thao tác nhanh trạng thái bàn (Đồng bộ MySQL):
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'AVAILABLE', label: 'Trống', color: 'hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 bg-emerald-500/10' },
                  { key: 'OCCUPIED', label: 'Có khách', color: 'hover:bg-rose-500 hover:text-slate-950 text-rose-400 bg-rose-500/10' },
                  { key: 'RESERVED', label: 'Đặt trước', color: 'hover:bg-amber-500 hover:text-slate-950 text-amber-400 bg-amber-500/10' },
                  { key: 'MAINTENANCE', label: 'Bảo trì', color: 'hover:bg-slate-600 hover:text-white text-slate-400 bg-slate-800' },
                ].map((item) => (
                  <button
                    key={item.key}
                    disabled={statusUpdating || scannedTable.status === item.key}
                    onClick={() => handleChangeStatus(item.key as any)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border border-transparent ${item.color} ${scannedTable.status === item.key ? 'ring-2 ring-emerald-400 font-black' : ''
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
