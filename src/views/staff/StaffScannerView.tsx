import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useCinema } from '../../context/CinemaContext';
import { Booking, ScanLog } from '../../types';
import {
  Camera,
  Upload,
  Zap,
  ZapOff,
  SwitchCamera,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  X,
  User,
  Ticket,
  Calendar,
  Clock,
  Film,
  MapPin,
  RefreshCw,
  Sparkles,
  FileText,
  UserCheck
} from 'lucide-react';

export const StaffScannerView: React.FC = () => {
  const {
    processTicketScan,
    admitCustomer,
    showToast,
    staffUser
  } = useCinema();

  const [scanMode, setScanMode] = useState<'camera' | 'upload'>('camera');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);

  // Scan Result Modal
  const [scanResultState, setScanResultState] = useState<{
    open: boolean;
    result: 'valid' | 'invalid' | 'already_used';
    booking?: Booking;
    message: string;
    previousScan?: ScanLog;
    scannedCode?: string;
  }>({
    open: false,
    result: 'invalid',
    message: ''
  });

  const [admitting, setAdmitting] = useState(false);

  // Upload State
  const [dragOver, setDragOver] = useState(false);
  const [uploadProcessing, setUploadProcessing] = useState(false);

  // Initialize and run Camera Stream
  useEffect(() => {
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    if (scanMode === 'camera' && !scanResultState.open) {
      const startCamera = async () => {
        try {
          setCameraError(null);
          const constraints: MediaStreamConstraints = {
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };

          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setCameraActive(true);

            // Check torch capabilities
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : {};
            if (capabilities.torch) {
              setTorchSupported(true);
            }
          }

          // Frame scanner loop
          const scanFrame = () => {
            if (
              videoRef.current &&
              videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
              canvasRef.current
            ) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              const video = videoRef.current;

              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;

              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: 'dontInvert'
                });

                if (code && code.data) {
                  handleQrCodeDetected(code.data, 'camera');
                  return; // Pause scanning while modal is up
                }
              }
            }
            animationFrameId = requestAnimationFrame(scanFrame);
          };

          animationFrameId = requestAnimationFrame(scanFrame);

        } catch (err: any) {
          console.warn('Camera access error:', err);
          setCameraError('Unable to access device camera. Please allow camera permissions or try Upload Ticket Image mode.');
          setCameraActive(false);
        }
      };

      startCamera();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanMode, facingMode, scanResultState.open]);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as any]
      });
      setTorchOn(!torchOn);
    } catch (e) {
      showToast('Flashlight control not supported on this device', 'warning');
    }
  };

  // Handle detected QR code
  const handleQrCodeDetected = async (codeData: string, method: 'camera' | 'upload' | 'manual') => {
    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    const res = await processTicketScan(codeData, method);
    setScanResultState({
      open: true,
      result: res.result,
      booking: res.booking,
      message: res.message,
      previousScan: res.previousScan,
      scannedCode: codeData
    });
  };

  // Process File Upload Image
  const handleImageFileUpload = (file: File) => {
    if (!file) return;
    setUploadProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          setUploadProcessing(false);
          if (code && code.data) {
            handleQrCodeDetected(code.data, 'upload');
          } else {
            // Fallback check if filename or barcode text matches
            handleQrCodeDetected(file.name, 'upload');
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Execute Admission
  const handleAdmit = async () => {
    if (!scanResultState.booking) return;
    setAdmitting(true);
    try {
      await admitCustomer(scanResultState.booking.id, 'camera');
      setScanResultState({ open: false, result: 'valid', message: '' });
    } catch (err) {
      showToast('Admission failed. Try manual check-in.', 'error');
    } finally {
      setAdmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header Mode Selector */}
      <div className="bg-[#0D0E16] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold font-serif text-amber-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D4AF37]" />
            <span>High-Speed Gate Ticket Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time WebRTC QR detection & Instant Supabase ticket verification
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center gap-1.5 bg-[#141522] p-1 rounded-xl border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              scanMode === 'camera'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Device Camera</span>
          </button>

          <button
            onClick={() => setScanMode('upload')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              scanMode === 'upload'
                ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Ticket Image</span>
          </button>
        </div>
      </div>

      {/* CAMERA SCANNER VIEWPORT */}
      {scanMode === 'camera' && (
        <div className="relative bg-[#06060A] border-2 border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
          
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Scanning Frame Overlay */}
          {cameraActive && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
              
              {/* Top Bar Indicators */}
              <div className="w-full flex items-center justify-between pointer-events-auto">
                <span className="bg-black/60 backdrop-blur-md border border-white/10 text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Scanning Active</span>
                </span>

                <div className="flex items-center gap-2">
                  {torchSupported && (
                    <button
                      onClick={toggleTorch}
                      className={`p-2.5 rounded-full border transition-all ${
                        torchOn
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                          : 'bg-black/60 text-white border-white/20 hover:bg-black'
                      }`}
                      title="Toggle Flashlight"
                    >
                      {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                    className="p-2.5 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black transition-all"
                    title="Switch Front/Back Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Centered QR Viewfinder Frame */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl border-2 border-dashed border-[#D4AF37] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                {/* Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl" />

                {/* Laser Scanning Line Animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] animate-pulse" />
              </div>

              {/* Bottom Instruction */}
              <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-medium text-amber-200">
                Align ticket QR code inside the frame for automatic entry validation
              </div>

            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {cameraError && (
            <div className="p-8 text-center max-w-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-lg text-white">Camera Access Required</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
              <button
                onClick={() => setScanMode('upload')}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs"
              >
                Switch to Ticket Image Upload
              </button>
            </div>
          )}

        </div>
      )}

      {/* UPLOAD TICKET IMAGE VIEWPORT */}
      {scanMode === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleImageFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className={`bg-[#0C0D15] border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
            dragOver ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/20 hover:border-[#D4AF37]/50'
          }`}
        >
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-lg">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-white">
                Upload or Drag Ticket Screenshot / PDF Image
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload customer's e-ticket screenshot, photo of printed ticket, or digital pass
              </p>
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-black font-extrabold text-xs cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
                <span>Select Image File</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[10px] text-slate-500 font-mono">
              Supported Formats: JPG, PNG, WEBP, PDF Ticket Capture
            </p>

            {uploadProcessing && (
              <div className="pt-4 flex items-center justify-center gap-2 text-xs text-[#D4AF37]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting QR code data...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCAN RESULT OVERLAY MODAL */}
      {scanResultState.open && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0D0E17] border-2 rounded-3xl shadow-2xl overflow-hidden my-auto border-white/20">
            
            {/* Modal Header Banner */}
            <div
              className={`p-6 text-center text-white relative ${
                scanResultState.result === 'valid'
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-950 border-b border-emerald-500'
                  : scanResultState.result === 'already_used'
                  ? 'bg-gradient-to-b from-rose-600 to-rose-950 border-b border-rose-500'
                  : 'bg-gradient-to-b from-amber-600 to-amber-950 border-b border-amber-500'
              }`}
            >
              <button
                onClick={() => setScanResultState({ ...scanResultState, open: false })}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-2xl border border-white/20">
                {scanResultState.result === 'valid' && (
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 animate-bounce" />
                )}
                {scanResultState.result === 'already_used' && (
                  <XCircle className="w-10 h-10 text-rose-300 animate-pulse" />
                )}
                {scanResultState.result === 'invalid' && (
                  <AlertOctagon className="w-10 h-10 text-amber-300 animate-pulse" />
                )}
              </div>

              <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-black/40 border border-white/20">
                {scanResultState.result === 'valid'
                  ? 'VERIFIED TICKET'
                  : scanResultState.result === 'already_used'
                  ? 'FRAUD / ALREADY USED'
                  : 'UNRECOGNIZED CODE'}
              </span>

              <h2 className="text-xl font-black font-serif uppercase tracking-wide mt-2">
                {scanResultState.result === 'valid'
                  ? 'VALID TICKET'
                  : scanResultState.result === 'already_used'
                  ? 'TICKET ALREADY USED'
                  : 'BOOKING NOT FOUND'}
              </h2>
              <p className="text-xs text-white/80 mt-1 font-medium">{scanResultState.message}</p>
            </div>

            {/* Modal Ticket Content Details */}
            {scanResultState.booking ? (
              <div className="p-6 space-y-4 text-xs">
                
                <div className="flex gap-3 items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                  <img
                    src={scanResultState.booking.moviePoster}
                    alt={scanResultState.booking.movieTitle}
                    className="w-14 h-20 object-cover rounded-xl border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase">
                      {scanResultState.booking.hallName}
                    </span>
                    <h3 className="font-bold text-sm text-white truncate font-serif">
                      {scanResultState.booking.movieTitle}
                    </h3>
                    <p className="text-slate-400 mt-1">
                      {scanResultState.booking.date} • <span className="text-white font-bold">{scanResultState.booking.time}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#141522] p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-medium">Seats</span>
                    <span className="text-base font-black text-[#D4AF37] font-mono">
                      {scanResultState.booking.seatIds.join(', ')}
                    </span>
                  </div>

                  <div className="bg-[#141522] p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block font-medium">Customer</span>
                    <span className="text-xs font-bold text-white truncate block">
                      {scanResultState.booking.customerName}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded-xl space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Booking ID:</span>
                    <span className="text-amber-300">{scanResultState.booking.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="text-emerald-400 font-bold">PAID ({scanResultState.booking.paymentMethod})</span>
                  </div>
                </div>

                {/* If Already Used Warning Banner */}
                {scanResultState.result === 'already_used' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
                    <p className="font-bold text-xs">Previous Entry Details:</p>
                    <p>Scanned By: {scanResultState.booking.scannedByName || scanResultState.booking.scannedBy || 'Gate Staff'}</p>
                    <p>Scanned At: {scanResultState.booking.scannedAt ? new Date(scanResultState.booking.scannedAt).toLocaleString() : 'Earlier today'}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex gap-3">
                  {scanResultState.result === 'valid' ? (
                    <button
                      onClick={handleAdmit}
                      disabled={admitting}
                      className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 transition-transform"
                    >
                      {admitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5" />
                          <span>ADMIT CUSTOMER</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setScanResultState({ ...scanResultState, open: false })}
                      className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                    >
                      Close Alert
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-6 text-center space-y-4">
                <p className="text-slate-400 text-xs">
                  The scanned QR code <code className="text-amber-300 font-mono">{scanResultState.scannedCode}</code> does not correspond to any active booking in the Gajuri database.
                </p>
                <button
                  onClick={() => setScanResultState({ ...scanResultState, open: false })}
                  className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  Try Again
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
