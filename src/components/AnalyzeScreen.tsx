import React, { useEffect, useRef, useState } from 'react';
import { Camera, SwitchCamera, X, ChevronLeft, Loader2, Plus, Trash2, Check } from 'lucide-react';
import { useI18n } from '../i18n';
import { User } from '../types';

interface AnalyzeScreenProps {
  user: User | null;
  isDemo?: boolean;
}

export default function AnalyzeScreen({ user, isDemo = false }: AnalyzeScreenProps) {
  const { t, language } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useBackCamera, setUseBackCamera] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryMode, setGalleryMode] = useState<'grid' | 'detail'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

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

  const fetchImages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/images/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Failed to fetch images', err);
    }
  };

  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleShoot = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !user) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the saved image when the front camera preview is mirrored.
    if (!useBackCamera) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    try {
      const response = await fetch(`/api/capture/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('Failed to save capture:', result.message);
      } else {
        await fetchImages();
      }
    } catch (err) {
      console.error('Capture upload failed:', err);
    }
  };

  const handleSwitchCamera = () => {
    setUseBackCamera((prev) => !prev);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const uploadImage = async (dataUrl: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/capture/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('Upload failed:', result.message);
      } else {
        await fetchImages();
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files as FileList).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl && dataUrl.startsWith('data:image/')) {
          uploadImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const openGallery = () => {
    setGalleryMode('grid');
    setSelectedImage(null);
    setAiResult(null);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setSelectedImage(null);
    setAiResult(null);
  };

  const openImageDetail = (filename: string) => {
    setSelectedImage(filename);
    setAiResult(null);
    setGalleryMode('detail');
  };

  const backToGrid = () => {
    setGalleryMode('grid');
    setSelectedImage(null);
    setAiResult(null);
  };

  const handleAiDetect = async () => {
    if (!user || !selectedImage) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`/api/analyze-image/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedImage, language })
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.result);
      } else {
        setAiResult(t('analyze.aiError'));
      }
    } catch (err) {
      setAiResult(t('analyze.aiError'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || !selectedImage) return;
    if (!window.confirm(t('analyze.deletePhotoConfirm'))) return;

    try {
      const res = await fetch(`/api/images/${user.id}/${selectedImage}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchImages();
        backToGrid();
      } else {
        console.error('Delete photo failed:', data.message);
      }
    } catch (err) {
      console.error('Delete photo error:', err);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      const next = !prev;
      if (!next) setSelectedIds(new Set());
      return next;
    });
  };

  const toggleSelection = (filename: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!window.confirm(t('analyze.deleteSelectedConfirm', { count }))) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((filename) =>
          fetch(`/api/images/${user.id}/${filename}`, { method: 'DELETE' })
        )
      );
      await fetchImages();
      setSelectMode(false);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Delete selected error:', err);
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const navigateImage = (direction: number) => {
    if (!selectedImage) return;
    const idx = images.indexOf(selectedImage);
    const newIdx = idx + direction;
    if (newIdx >= 0 && newIdx < images.length) {
      setSelectedImage(images[newIdx]);
      setAiResult(null);
    }
  };

  const handleDetailPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  const handleDetailPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handleDetailPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;
    const delta = e.clientX - dragStartX;
    const threshold = 80;
    if (delta < -threshold) {
      navigateImage(1);
    } else if (delta > threshold) {
      navigateImage(-1);
    }
    setDragStartX(null);
    setDragOffset(0);
  };

  useEffect(() => {
    if (!showGallery) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGallery();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery]);

  const imageUrl = (filename: string) => `/api/images/${user?.id}/${filename}`;
  const latestImage = images[0];

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

      {/* Bottom controls: gallery preview + shoot button + upload */}
      <div className="z-10 w-full mt-auto flex items-center justify-center gap-5 pb-8 px-4 pointer-events-none">
        {/* Latest image preview */}
        <button
          onClick={openGallery}
          className="pointer-events-auto w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
          aria-label={t('analyze.galleryTitle')}
          title={t('analyze.galleryTitle')}
        >
          {latestImage ? (
            <img
              src={imageUrl(latestImage)}
              alt={t('analyze.galleryTitle')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black" />
          )}
        </button>

        {/* Shoot button (centered) */}
        <button
          onClick={handleShoot}
          disabled={!!error || !user}
          className="pointer-events-auto w-16 h-16 bg-[#fcf9f8] text-black hover:bg-white active:scale-90 transition-all rounded-full flex items-center justify-center shadow-2xl border-4 border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Capture scan"
        >
          <Camera size={24} className="text-black" />
        </button>

        {/* Upload photo */}
        <button
          onClick={handleUploadClick}
          disabled={!user}
          className="pointer-events-auto w-14 h-14 rounded-full border-2 border-white bg-neutral-900/80 backdrop-blur-sm text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t('analyze.uploadPhoto')}
          title={t('analyze.uploadPhoto')}
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Gallery modal */}
      {showGallery && user && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-fade-in">
          {/* Modal header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            {galleryMode === 'detail' ? (
              <button
                onClick={backToGrid}
                className="flex items-center gap-1 text-[#fcf9f8] hover:text-[#00f0ff] transition-colors pointer-events-auto"
              >
                <ChevronLeft size={18} />
                <span className="text-xs font-mono">{t('analyze.back')}</span>
              </button>
            ) : selectMode ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold tracking-wider uppercase text-[#fcf9f8]">
                  {t('analyze.selectPhotos')}
                </span>
                <span className="text-xs font-mono text-[#00f0ff]">
                  {selectedIds.size}
                </span>
              </div>
            ) : (
              <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-[#fcf9f8]">
                {t('analyze.galleryTitle')}
              </h3>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUploadClick}
                className="p-1.5 text-[#fcf9f8] hover:text-[#00f0ff] transition-colors pointer-events-auto"
                aria-label={t('analyze.uploadPhoto')}
                title={t('analyze.uploadPhoto')}
              >
                <Plus size={20} />
              </button>
              {galleryMode === 'grid' && !selectMode && images.length > 0 && (
                <button
                  onClick={toggleSelectMode}
                  className="p-1.5 text-[#fcf9f8] hover:text-red-400 transition-colors pointer-events-auto"
                  aria-label={t('analyze.deletePhoto')}
                  title={t('analyze.deletePhoto')}
                >
                  <Trash2 size={20} />
                </button>
              )}
              {selectMode && (
                <button
                  onClick={exitSelectMode}
                  className="text-xs font-mono text-[#fcf9f8] hover:text-[#00f0ff] transition-colors pointer-events-auto"
                >
                  {t('analyze.cancel')}
                </button>
              )}
              {galleryMode === 'detail' && selectedImage && (
                <button
                  onClick={handleDeletePhoto}
                  className="p-1.5 text-[#fcf9f8] hover:text-red-400 transition-colors pointer-events-auto"
                  aria-label={t('analyze.deletePhoto')}
                  title={t('analyze.deletePhoto')}
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                onClick={closeGallery}
                className="p-1.5 text-[#fcf9f8] hover:text-[#00f0ff] transition-colors pointer-events-auto"
                aria-label={t('analyze.close')}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Grid view */}
          {galleryMode === 'grid' && (
            <div className="flex-1 overflow-y-auto p-4">
              {images.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                  <Camera size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-mono">{t('analyze.noPhotos')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((filename) => {
                    const isSelected = selectedIds.has(filename);
                    return (
                      <button
                        key={filename}
                        onClick={() => selectMode ? toggleSelection(filename) : openImageDetail(filename)}
                        className={`relative aspect-square rounded overflow-hidden bg-neutral-900 border transition-colors pointer-events-auto ${
                          selectMode
                            ? (isSelected ? 'border-[#00f0ff]' : 'border-neutral-800')
                            : 'border-neutral-800 hover:border-[#00f0ff]'
                        }`}
                      >
                        <img
                          src={imageUrl(filename)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {selectMode && (
                          <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#00f0ff] border-[#00f0ff]' : 'bg-black/50 border-white'
                          }`}>
                            {isSelected && <Check size={12} className="text-black" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Multi-select delete bar */}
          {galleryMode === 'grid' && selectMode && (
            <div className="border-t border-neutral-800 p-4 bg-neutral-900/95 backdrop-blur-md flex items-center justify-between pointer-events-auto">
              <button
                onClick={exitSelectMode}
                className="px-4 py-2 text-xs font-mono text-[#fcf9f8] hover:text-[#00f0ff] transition-colors"
              >
                {t('analyze.cancel')}
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded text-xs font-mono font-bold tracking-wider uppercase hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('analyze.deleteSelected', { count: selectedIds.size })}
              </button>
            </div>
          )}

          {/* Detail view */}
          {galleryMode === 'detail' && selectedImage && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div
                className="flex-1 flex items-center justify-center mb-4 touch-pan-y"
                onPointerDown={handleDetailPointerDown}
                onPointerMove={handleDetailPointerMove}
                onPointerUp={handleDetailPointerUp}
                onPointerLeave={handleDetailPointerUp}
              >
                <img
                  src={imageUrl(selectedImage)}
                  alt=""
                  className="max-w-full max-h-full object-contain rounded border border-neutral-800 select-none"
                  style={{
                    transform: `translateX(${dragOffset}px)`,
                    transition: dragStartX === null ? 'transform 200ms ease-out' : 'none',
                    cursor: dragStartX !== null ? 'grabbing' : 'grab',
                  }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAiDetect}
                  disabled={aiLoading}
                  className="w-full py-3 bg-[#00f0ff] text-black hover:bg-[#00dbe9] disabled:opacity-60 rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors pointer-events-auto flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      {t('analyze.aiDetecting')}
                    </>
                  ) : (
                    t('analyze.aiDetect')
                  )}
                </button>

                {aiResult && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-neutral-200 leading-relaxed">
                    {aiResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
