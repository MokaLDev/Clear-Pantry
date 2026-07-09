import React, { useEffect, useRef, useState } from 'react';
import { Camera, SwitchCamera } from 'lucide-react';
import { useI18n } from '../i18n';

interface AnalyzeScreenProps {
  isDemo?: boolean;
}

export default function AnalyzeScreen({ isDemo = false }: AnalyzeScreenProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useBackCamera, setUseBackCamera] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const startCamera = async (back = useBackCamera) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t('analyze.cameraError'));
      return;
    }

    stopStream();
    setError(null);

    try {
      const constraints = back
        ? { video: { facingMode: { exact: 'environment' } } as MediaTrackConstraints, audio: false }
        : { video: { facingMode: 'user' } as MediaTrackConstraints, audio: false };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback if the requested facing mode is unavailable
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError(t('analyze.cameraError'));
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        setHasMultipleCameras(false);
      }
    };
    if (navigator.mediaDevices) {
      checkCameras();
    }
  }, []);

  useEffect(() => {
    if (stream) {
      startCamera(useBackCamera);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useBackCamera]);

  const handleShoot = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);
  };

  const handleSwitchCamera = () => {
    setUseBackCamera((prev) => !prev);
  };

  return (
    <div className="w-full flex-1 bg-black text-[#fcf9f8] flex flex-col font-sans overflow-hidden select-none relative">
      {/* Live camera feed fills the entire content area behind the overlays */}
      <div className="absolute inset-0 z-0 bg-[#0d0d0d]">
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center">
            <Camera size={40} className="text-neutral-600 mb-3" />
            <p className="text-sm text-neutral-300 mb-1">{t('analyze.cameraOffline')}</p>
            <p className="text-xs text-neutral-500 max-w-xs">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${useBackCamera ? '' : 'scale-x-[-1]'}`}
          />
        )}

        {shutterFlash && (
          <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 animate-flash-shutter pointer-events-none" />
        )}
      </div>

      {/* Top overlay bar */}
      <div className="p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#00f0ff]"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-widest text-[#00f0ff]">{t('analyze.aiActive')}</span>
        </div>

        {hasMultipleCameras && (
          <button
            onClick={handleSwitchCamera}
            className="pointer-events-auto flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded px-2.5 py-1.5 text-[10px] font-mono font-semibold text-[#fcf9f8] hover:bg-neutral-800 transition-colors"
            aria-label={t('analyze.switchCamera')}
            title={t('analyze.switchCamera')}
          >
            <SwitchCamera size={12} />
            {t('analyze.switchCamera')}
          </button>
        )}
      </div>

      {/* Bottom shoot button overlay */}
      <div className="z-10 w-full mt-auto flex items-center justify-center pb-8 px-4 pointer-events-none">
        <button
          onClick={handleShoot}
          disabled={!!error}
          className="pointer-events-auto w-14 h-14 bg-[#fcf9f8] text-black hover:bg-white active:scale-90 transition-all rounded-full flex items-center justify-center shadow-2xl border-4 border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Capture scan"
        >
          <Camera size={22} className="text-black" />
        </button>
      </div>
    </div>
  );
}
