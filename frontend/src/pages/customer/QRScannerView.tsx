import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Flashlight, Camera, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import jsQR from 'jsqr';

export const QRScannerView: React.FC = () => {
  const { navigateTo, handleScannedQR } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

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

      // Check flashlight support
      const track = stream.getVideoTracks()[0];
      const capabilities = (track?.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities && 'torch' in capabilities) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Vui lòng cho phép quyền truy cập Camera trên thiết bị để quét mã QR.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('Không tìm thấy thiết bị Camera.');
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
    if (!hasPermission) return;

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
  }, [hasPermission, handleScannedQR]);

  // Start camera on mount, stop on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-[82vh] flex flex-col justify-between py-2 sm:py-4">
      {/* Hidden Canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            navigateTo('home');
          }}
          className="p-2 -ml-2 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <h1 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">
          Quét mã bàn
        </h1>

        <div className="w-9 flex justify-end">
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                torchOn ? 'bg-amber-100 text-amber-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Đèn Flash"
            >
              <Flashlight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Center Main Frame Only - Pure White Aesthetic */}
      <div className="my-auto flex flex-col items-center justify-center py-6">
        {/* Scanner Viewport */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
          {/* Live Camera Stream */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${hasPermission ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Scanner Viewfinder Framing - Pure White Theme */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 4 Crisp White Corner Markers */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-tl-xl" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-tr-xl" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-bl-xl" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] rounded-br-xl" />

            {/* Subtle Scanning Laser */}
            {hasPermission && (
              <motion.div
                animate={{ y: [-110, 110] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_10px_#ffffff]"
              />
            )}
          </div>

          {/* Camera Permission Denied / Error State */}
          {hasPermission === false && (
            <div className="absolute inset-0 p-5 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center text-center space-y-3 z-10">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <Camera className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">Cần cấp quyền Camera</p>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {permissionError || 'Vui lòng cho phép truy cập Camera để quét mã QR bàn.'}
                </p>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Cấp quyền lại
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

        {/* Minimalist Subtext */}
        <p className="text-xs text-slate-400 text-center mt-4 font-normal">
          Hướng camera vào mã QR dán trên bàn
        </p>
      </div>

      {/* Bottom Spacer */}
      <div className="pb-4" />
    </div>
  );
};
