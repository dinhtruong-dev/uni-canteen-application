import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, Flashlight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsQR from 'jsqr';

export const QRScannerModal: React.FC = () => {
  const { qrScannerOpen, setQrScannerOpen, handleScannedQR, diningTables } = useApp();
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [showQuickSelect, setShowQuickSelect] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  // Start camera stream
  const startCamera = async () => {
    setPermissionError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        setPermissionError('Trình duyệt không hỗ trợ truy cập Camera.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
      }

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities && 'torch' in capabilities) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Vui lòng cho phép quyền truy cập Camera để quét mã QR bàn.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('Không tìm thấy thiết bị Camera trên máy.');
      } else {
        setPermissionError('Không thể mở Camera. Vui lòng kiểm tra quyền thiết bị.');
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (_) {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  };

  // Toggle Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn('Cannot toggle torch:', e);
      }
    }
  };

  // Continuous frame scanning loop with jsQR
  useEffect(() => {
    if (!qrScannerOpen || !hasPermission) return;

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

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const raw = code.data.trim();
            // Handle URL or plain code (e.g., https://unieat.vn/?table=QR001 -> QR001)
            let parsedCode = raw;
            if (raw.includes('table=')) {
              parsedCode = raw.split('table=')[1].split('&')[0];
            } else if (raw.includes('/')) {
              const parts = raw.split('/');
              parsedCode = parts[parts.length - 1];
            }

            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            const success = handleScannedQR(parsedCode);
            if (success) {
              isScanning = false;
              stopCamera();
              return;
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      isScanning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [qrScannerOpen, hasPermission, handleScannedQR]);

  // Manage modal open/close lifecycle
  useEffect(() => {
    if (qrScannerOpen) {
      setShowQuickSelect(false);
      setManualCode('');
      startCamera();
    } else {
      stopCamera();
      setHasPermission(null);
      setPermissionError(null);
    }

    return () => {
      stopCamera();
    };
  }, [qrScannerOpen]);

  if (!qrScannerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        {/* Hidden Canvas for QR parsing */}
        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white text-slate-900 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative border border-slate-100"
        >
          {/* Top Bar - Minimalist White Design */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm text-slate-800">Quét mã bàn</span>
            </div>

            <div className="flex items-center gap-1.5">
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    torchOn ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Bật đèn Flash"
                >
                  <Flashlight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setQrScannerOpen(false)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scanner Viewport - Only Frame & White Theme */}
          <div className="p-5 flex flex-col items-center">
            {/* The Live Scanner Frame */}
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
              {/* Real Video Camera Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* White Aesthetic Scanning Overlay & Viewfinder Corners */}
              <div className="absolute inset-0 pointer-events-none">
                {/* 4 Crisp White/Slate Corner Markers */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-br-lg" />

                {/* Animated Crisp White Scanning Laser */}
                {hasPermission && (
                  <motion.div
                    animate={{ y: [-110, 110] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_12px_#ffffff]"
                  />
                )}
              </div>

              {/* Camera State: Requesting / Permission Denied Prompt */}
              {hasPermission === false && (
                <div className="absolute inset-0 p-4 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center text-center space-y-3 z-10">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Cần quyền Camera</p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {permissionError || 'Vui lòng cấp quyền Camera trên trình duyệt để quét mã QR bàn ăn.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Mở Camera
                  </button>
                </div>
              )}

              {/* Camera Initializing */}
              {hasPermission === null && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Đang khởi động Camera...</p>
                </div>
              )}
            </div>

            {/* Instruction */}
            <p className="text-xs text-slate-400 text-center mt-3 font-medium">
              Hướng camera vào mã QR dán trên bàn
            </p>

            {/* Quick Demo / Manual input toggle for quick preview */}
            <div className="w-full mt-3 pt-3 border-t border-slate-100 text-center">
              {!showQuickSelect ? (
                <button
                  type="button"
                  onClick={() => setShowQuickSelect(true)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer transition-colors"
                >
                  Hoặc chọn nhanh bàn mẫu / nhập mã
                </button>
              ) : (
                <div className="space-y-2.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">Chọn bàn nhanh:</span>
                    <button
                      type="button"
                      onClick={() => setShowQuickSelect(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {(diningTables || []).slice(0, 4).map((table: any) => {
                      const code = table.tableCode || table.id || 'TBL-01';
                      const name = table.tableName || table.tableNumber || 'Bàn ăn';
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            handleScannedQR(code);
                            stopCamera();
                          }}
                          className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 rounded-xl text-left transition-colors cursor-pointer"
                        >
                          <span className="font-bold text-xs text-slate-900 block">{code}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (manualCode.trim()) {
                        handleScannedQR(manualCode.trim());
                        stopCamera();
                      }
                    }}
                    className="flex gap-1.5 pt-1"
                  >
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Nhập mã bàn (VD: QR001)..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      OK
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
