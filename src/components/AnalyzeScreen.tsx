import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  SwitchCamera,
  X,
  ChevronLeft,
  Loader2,
  Plus,
  Trash2,
  Check,
  ChevronUp,
  ChevronDown,
  Send,
  Save
} from 'lucide-react';
import { useI18n } from '../i18n';
import {
  User,
  Ingredient,
  RefillRecord,
  ChatMessage,
  AiAssistantResponse,
  DetectedRefill,
  DetectedIngredient
} from '../types';

interface AnalyzeScreenProps {
  user: User | null;
  isDemo?: boolean;
  ingredients?: Ingredient[];
  refills?: RefillRecord[];
  onApplyDetections?: (payload: {
    refills?: DetectedRefill[];
    ingredients?: DetectedIngredient[];
  }) => void;
}

export default function AnalyzeScreen({
  user,
  isDemo = false,
  ingredients = [],
  refills = [],
  onApplyDetections
}: AnalyzeScreenProps) {
  const { t, language } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useBackCamera, setUseBackCamera] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryMode, setGalleryMode] = useState<'grid' | 'detail'>('grid');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // AI conversation state
  const [conversationOpen, setConversationOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [pendingDetections, setPendingDetections] = useState<DetectedRefill[] | null>(null);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

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
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
    setSelectedImage(null);
    setPendingDetections(null);
    setShowDetectionModal(false);
  };

  const openImageDetail = (filename: string) => {
    setSelectedImage(filename);
    setGalleryMode('detail');
    setConversationOpen(false);
  };

  const backToGrid = () => {
    setGalleryMode('grid');
    setSelectedImage(null);
    setPendingDetections(null);
    setShowDetectionModal(false);
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

  // ---------------------------------------------------------------------------
  // AI conversation helpers
  // ---------------------------------------------------------------------------

  const conversationIdForImage = (filename: string) =>
    `conv-${filename.replace(/\.[^.]+$/, '')}`;

  const loadConversation = async (filename: string) => {
    if (!user) return;
    const conversationId = conversationIdForImage(filename);
    try {
      const res = await fetch(`/api/conversations/${user.id}/${conversationId}`);
      const data = await res.json();
      if (data.success && data.conversation?.messages) {
        setMessages(data.conversation.messages);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedImage && galleryMode === 'detail') {
      loadConversation(selectedImage);
      setPendingDetections(null);
      setShowDetectionModal(false);
      setSaveStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, galleryMode]);

  useEffect(() => {
    if (conversationOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, conversationOpen]);

  const saveConversation = async () => {
    if (!user || !selectedImage || messages.length === 0) return;
    const conversationId = conversationIdForImage(selectedImage);
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/conversations/${user.id}/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageFilename: selectedImage, messages })
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const handleClearConversation = async () => {
    if (!user || !selectedImage) return;
    const conversationId = conversationIdForImage(selectedImage);
    setMessages([]);
    try {
      await fetch(`/api/conversations/${user.id}/${conversationId}`, { method: 'DELETE' });
    } catch {
      // ignore cleanup errors
    }
  };

  const buildKitchenContext = () => ({
    ingredients: ingredients.map((i) => ({
      name: i.name,
      currentQty: i.currentQty,
      maxQty: i.maxQty,
      unit: i.unit,
      category: i.category
    })),
    refills: refills.slice(0, 20).map((r) => ({
      ingredientName: r.ingredientName,
      qtyAdded: r.qtyAdded,
      method: r.method,
      timestamp: r.timestamp
    }))
  });

  const callAiConversation = async (
    mode: 'chat' | 'refill',
    outgoingMessages: ChatMessage[]
  ): Promise<AiAssistantResponse | null> => {
    if (!user || !selectedImage) return null;
    try {
      const res = await fetch(`/api/ai-conversation/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedImage,
          mode,
          language,
          messages: outgoingMessages,
          kitchenContext: buildKitchenContext()
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        return data.message as AiAssistantResponse;
      }
      // Server returned success:false with a specific message.
      return {
        version: '1.0.0',
        reply: data.message || t('analyze.aiError'),
        requiresConfirmation: false
      };
    } catch {
      return { version: '1.0.0', reply: t('analyze.aiError'), requiresConfirmation: false };
    }
  };

  const appendAssistantMessage = (reply: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
    ]);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading || !user) return;
    const userText = chatInput.trim();
    setChatInput('');
    const userMessage: ChatMessage = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setChatLoading(true);

    const response = await callAiConversation('chat', nextMessages);
    setChatLoading(false);
    if (response) {
      appendAssistantMessage(response.reply);
      if (response.requiresConfirmation) {
        const normalized = normalizeDetections(
          response.detectedRefills || [],
          response.detectedIngredients || []
        );
        if (normalized.length > 0) {
          setPendingDetections(normalized);
          setShowDetectionModal(true);
        }
      }
    }
  };

  const handleDetectRefill = async () => {
    if (chatLoading || !user) return;
    const userMessage: ChatMessage = {
      role: 'user',
      content: t('analyze.detectRefill'),
      timestamp: new Date().toISOString()
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setChatLoading(true);

    const response = await callAiConversation('refill', nextMessages);
    setChatLoading(false);
    if (response) {
      appendAssistantMessage(response.reply);
      const normalized = normalizeDetections(
        response.detectedRefills || [],
        response.detectedIngredients || []
      );
      if (normalized.length > 0) {
        setPendingDetections(normalized);
        setShowDetectionModal(true);
      }
    }
  };

  const handleApproveDetections = () => {
    if (!pendingDetections || !onApplyDetections) return;
    onApplyDetections({ refills: pendingDetections });
    appendAssistantMessage(t('analyze.refillAdded'));
    setPendingDetections(null);
    setShowDetectionModal(false);
  };

  const handleCancelDetections = () => {
    setPendingDetections(null);
    setShowDetectionModal(false);
  };

  const findExistingIngredient = (name: string) =>
    ingredients.find((i) => i.name.toLowerCase() === name.trim().toLowerCase());

  const normalizeDetections = (
    refills: DetectedRefill[],
    ingredientsList: DetectedIngredient[]
  ): DetectedRefill[] => {
    const mappedRefills = refills.map((r) => {
      const existing = findExistingIngredient(r.ingredientName);
      return {
        ...r,
        ingredientName: existing ? existing.name : r.ingredientName,
        isNewIngredient: existing ? false : (r.isNewIngredient ?? true),
        category: existing ? existing.category : (r.category || 'Pantry'),
        unit: existing ? existing.unit : (r.unit || 'g')
      };
    });

    const mappedIngredients = ingredientsList.map((i) => ({
      ingredientName: i.name,
      quantity: i.currentQty,
      unit: i.unit || 'g',
      maxQty: i.maxQty,
      confidence: i.confidence,
      category: i.category || 'Pantry',
      notes: i.notes || '',
      isNewIngredient: true
    }));

    return [...mappedRefills, ...mappedIngredients];
  };

  const updatePendingRefill = (index: number, field: keyof DetectedRefill, value: unknown) => {
    setPendingDetections((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleCreateToggle = (index: number, isNew: boolean) => {
    setPendingDetections((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const item = { ...next[index] };
      item.isNewIngredient = isNew;
      if (isNew) {
        // Reset to a new-container default.
        item.hasThreshold = false;
        item.maxQty = item.quantity;
      } else {
        // Default to the first existing ingredient if any.
        const existing = ingredients[0];
        if (existing) {
          item.ingredientName = existing.name;
          item.category = existing.category;
          item.unit = existing.unit;
        }
      }
      next[index] = item;
      return next;
    });
  };

  const handleThresholdToggle = (index: number, enabled: boolean) => {
    setPendingDetections((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const item = { ...next[index] };
      item.hasThreshold = enabled;
      item.maxQty = enabled ? Math.max(item.quantity, item.maxQty ?? item.quantity) : item.quantity;
      next[index] = item;
      return next;
    });
  };

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
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div
                className="flex-1 min-h-0 flex items-center justify-center mb-4 touch-pan-y"
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

              {/* Foldable AI conversation drawer */}
              <div className="shrink-0 border-t border-neutral-800 bg-neutral-900/60 backdrop-blur-sm rounded-lg overflow-hidden">
                <button
                  onClick={() => setConversationOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[#fcf9f8] hover:bg-neutral-800/50 transition-colors pointer-events-auto"
                >
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">
                    {t('analyze.aiAssistant')}
                  </span>
                  {conversationOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                {conversationOpen && (
                  <div className="flex flex-col max-h-[45vh]">
                    <div className="flex items-center justify-between px-3 py-1 border-b border-neutral-800/50">
                      <span className="text-[10px] font-mono text-neutral-400">
                        {messages.length} {messages.length === 1 ? t('analyze.message') : t('analyze.messages')}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleClearConversation}
                          disabled={messages.length === 0}
                          className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-red-400 disabled:opacity-50 transition-colors pointer-events-auto"
                        >
                          <X size={12} />
                          {t('analyze.clearChat')}
                        </button>
                        <button
                          onClick={saveConversation}
                          disabled={saveStatus === 'saving' || messages.length === 0}
                          className="flex items-center gap-1 text-[10px] font-mono text-[#00f0ff] hover:text-white disabled:opacity-50 transition-colors pointer-events-auto"
                        >
                          {saveStatus === 'saving' ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Save size={12} />
                          )}
                          {saveStatus === 'saved'
                            ? t('analyze.conversationSaved')
                            : t('analyze.saveConversation')}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
                      {messages.length === 0 && (
                        <p className="text-xs text-neutral-500 text-center py-4 font-mono">
                          {t('analyze.askAi')}
                        </p>
                      )}
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                              msg.role === 'user'
                                ? 'bg-[#00f0ff] text-black'
                                : 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin text-[#00f0ff]" />
                            <span className="text-xs text-neutral-300 font-mono">
                              {t('analyze.aiDetecting')}
                            </span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-neutral-800/50 space-y-2">
                      <button
                        onClick={handleDetectRefill}
                        disabled={chatLoading}
                        className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-[#00f0ff] rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors pointer-events-auto flex items-center justify-center gap-2"
                      >
                        {chatLoading ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : null}
                        {t('analyze.detectRefill')}
                      </button>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendChat();
                          }}
                          placeholder={t('analyze.askAi')}
                          disabled={chatLoading}
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-xs text-[#fcf9f8] placeholder:text-neutral-500 focus:outline-none focus:border-[#00f0ff] transition-colors"
                        />
                        <button
                          onClick={handleSendChat}
                          disabled={chatLoading || !chatInput.trim()}
                          className="p-2 bg-[#00f0ff] text-black rounded hover:bg-[#00dbe9] disabled:opacity-50 transition-colors pointer-events-auto"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detection confirmation modal */}
      {showDetectionModal && pendingDetections && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-md max-h-[80vh] bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-[#fcf9f8]">
                {t('analyze.detectedRefills')}
              </h3>
              <button
                onClick={handleCancelDetections}
                className="text-neutral-400 hover:text-[#00f0ff] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pendingDetections.length === 0 && (
                <p className="text-xs text-neutral-400 text-center font-mono">
                  {t('analyze.noDetections')}
                </p>
              )}

              {pendingDetections.map((item, idx) => {
                const isNew = item.isNewIngredient !== false;
                return (
                  <div
                    key={idx}
                    className="bg-neutral-800/50 border border-neutral-700 rounded p-3 space-y-3"
                  >
                    {/* Create-new toggle */}
                    <label className="inline-flex items-center cursor-pointer pointer-events-auto">
                      <input
                        type="checkbox"
                        checked={isNew}
                        onChange={(e) => handleCreateToggle(idx, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00f0ff]" />
                      <span className="ml-2 text-xs font-mono text-neutral-300">
                        {t('analyze.createNewContainer')}
                      </span>
                    </label>

                    {isNew ? (
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                          {t('analyze.newIngredient')}
                        </label>
                        <input
                          type="text"
                          value={item.ingredientName}
                          onChange={(e) =>
                            updatePendingRefill(idx, 'ingredientName', e.target.value)
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                          {t('analyze.existingContainer')}
                        </label>
                        <select
                          value={item.ingredientName}
                          onChange={(e) => {
                            const existing = ingredients.find((i) => i.name === e.target.value);
                            if (existing) {
                              setPendingDetections((prev) => {
                                if (!prev) return prev;
                                const next = [...prev];
                                next[idx] = {
                                  ...next[idx],
                                  ingredientName: existing.name,
                                  category: existing.category,
                                  unit: existing.unit
                                };
                                return next;
                              });
                            }
                          }}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.name}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                          {t('inventory.table.qtyAdded')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) =>
                            updatePendingRefill(idx, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                          {t('analyze.labelUnit')}
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => updatePendingRefill(idx, 'unit', e.target.value)}
                          disabled={!isNew}
                          className="w-full bg-neutral-900 border border-neutral-700 disabled:bg-neutral-900/50 disabled:text-neutral-300 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                        >
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                          <option value="%">%</option>
                        </select>
                      </div>
                    </div>

                    {isNew && (
                      <>
                        {/* Capacity threshold toggle */}
                        <label className="inline-flex items-center cursor-pointer pointer-events-auto">
                          <input
                            type="checkbox"
                            checked={item.hasThreshold === true}
                            onChange={(e) => handleThresholdToggle(idx, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00f0ff]" />
                          <span className="ml-2 text-xs font-mono text-neutral-300">
                            {t('analyze.setCapacity')}
                          </span>
                        </label>

                        {item.hasThreshold === true && (
                          <div>
                            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                              {t('analyze.capacity')}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={item.maxQty ?? item.quantity}
                              onChange={(e) =>
                                updatePendingRefill(
                                  idx,
                                  'maxQty',
                                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                                )
                              }
                              className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                            {t('analyze.labelCategory')}
                          </label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={(e) => updatePendingRefill(idx, 'category', e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
                        {t('analyze.labelNotes')}
                      </label>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updatePendingRefill(idx, 'notes', e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-[#fcf9f8] focus:border-[#00f0ff] focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-neutral-800 flex items-center justify-end gap-2">
              <button
                onClick={handleCancelDetections}
                className="px-4 py-2 text-xs font-mono text-[#fcf9f8] hover:text-[#00f0ff] transition-colors"
              >
                {t('analyze.cancelDetections')}
              </button>
              <button
                onClick={handleApproveDetections}
                disabled={pendingDetections.length === 0}
                className="px-4 py-2 bg-[#00f0ff] text-black rounded text-xs font-mono font-bold tracking-wider uppercase hover:bg-[#00dbe9] disabled:opacity-50 transition-colors"
              >
                {t('analyze.approve')}
              </button>
            </div>
          </div>
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
