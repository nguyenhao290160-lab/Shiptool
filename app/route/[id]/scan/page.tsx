"use client";

import React, { useEffect, useState, use, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MobilePageShell } from "@/components/MobilePageShell";
import { BigActionButton } from "@/components/BigActionButton";
import { getRouteById, saveRoute } from "@/lib/storage";
import { RoutePlan, OrderStop } from "@/lib/types";
import { parseOcrOrderText } from "@/lib/ocrParser";
import { recognize } from "tesseract.js";

interface OcrResult {
  id: string;
  imageUrl: string;
  rawText: string;
  confidence: number;
  status: "pending" | "processing" | "done" | "error";
  statusText: string;
  parsedData: Partial<OrderStop>;
  isExpandedRaw: boolean;
  isSaved: boolean;
  isDiscarded: boolean;
}

export default function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [route, setRoute] = useState<RoutePlan | null>(null);
  
  const [results, setResults] = useState<OcrResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [quickResult, setQuickResult] = useState<OrderStop | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const r = getRouteById(resolvedParams.id);
      if (r) {
        setRoute(r);
      } else {
        router.replace("/home");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [resolvedParams.id, router]);

  if (!isMounted) return <MobilePageShell><div className="p-5"></div></MobilePageShell>;
  if (!route) return <MobilePageShell><p>Loading...</p></MobilePageShell>;

  const handleQuickSearch = (q: string) => {
    setQuickSearch(q);
    if (!q.trim()) {
      setQuickResult(null);
      return;
    }
    const found = route.stops.find((s) => s.id === q || (s.phone && s.phone.includes(q)) || (s.receiverName && s.receiverName.toLowerCase().includes(q.toLowerCase())) || (s.label && s.label.toLowerCase().includes(q.toLowerCase())));
    setQuickResult(found || null);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newResults: OcrResult[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      imageUrl: URL.createObjectURL(file),
      rawText: "",
      confidence: 0,
      status: "pending",
      statusText: "Đang chờ quét...",
      parsedData: { receiverName: "", phone: "", address: "", note: "", codAmount: 0 },
      isExpandedRaw: false,
      isSaved: false,
      isDiscarded: false,
    }));

    setResults(prev => [...prev, ...newResults]);
    processImages(newResults);
  };

  const processImages = async (items: OcrResult[]) => {
    setIsProcessing(true);

    for (const item of items) {
      setResults(prev => prev.map(r => r.id === item.id ? { ...r, status: "processing", statusText: "Đang chuẩn bị ảnh..." } : r));
      
      try {
        const result = await recognize(
          item.imageUrl,
          'vie+eng', // Try Vietnamese and English
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                setResults(prev => prev.map(r => r.id === item.id ? { ...r, statusText: `Đang quét chữ... ${Math.round(m.progress * 100)}%` } : r));
              }
            }
          }
        );

        setResults(prev => prev.map(r => r.id === item.id ? { ...r, statusText: "Đang tách thông tin..." } : r));

        const rawText = result.data.text;
        const confidence = result.data.confidence;
        const parsedData = parseOcrOrderText(rawText);

        setResults(prev => prev.map(r => r.id === item.id ? { 
          ...r, 
          status: "done", 
          statusText: "Quét xong", 
          rawText, 
          confidence, 
          parsedData: {
            ...r.parsedData,
            ...parsedData
          }
        } : r));

      } catch (error) {
        console.error("OCR Error", error);
        setResults(prev => prev.map(r => r.id === item.id ? { 
          ...r, 
          status: "error", 
          statusText: "Không đọc được rõ" 
        } : r));
      }
    }

    setIsProcessing(false);
  };

  const updateParsedData = (id: string, field: keyof OrderStop, value: string | number) => {
    setResults(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          parsedData: {
            ...r.parsedData,
            [field]: value
          }
        };
      }
      return r;
    }));
  };

  const toggleRawText = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, isExpandedRaw: !r.isExpandedRaw } : r));
  };

  const discardResult = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, isDiscarded: true } : r));
  };

  const saveResult = (item: OcrResult) => {
    if (!item.parsedData.address?.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return false;
    }

    const newOrder: OrderStop = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      label: item.parsedData.receiverName ? item.parsedData.receiverName : `Khách ${route.stops.length + 1}`,
      receiverName: item.parsedData.receiverName,
      phone: item.parsedData.phone,
      address: item.parsedData.address,
      note: item.parsedData.note,
      codAmount: item.parsedData.codAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRoute = { ...route, stops: [...route.stops, newOrder] };
    saveRoute(updatedRoute);
    setRoute(updatedRoute);

    setResults(prev => prev.map(r => r.id === item.id ? { ...r, isSaved: true } : r));
    return true;
  };

  const saveAllValid = () => {
    let savedCount = 0;
    const newStops = [...route.stops];
    
    const updatedResults = results.map(item => {
      if (item.status === 'done' && !item.isSaved && !item.isDiscarded && item.parsedData.address?.trim()) {
        const newOrder: OrderStop = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          label: item.parsedData.receiverName ? item.parsedData.receiverName : `Khách ${newStops.length + 1}`,
          receiverName: item.parsedData.receiverName,
          phone: item.parsedData.phone,
          address: item.parsedData.address,
          note: item.parsedData.note,
          codAmount: item.parsedData.codAmount,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newStops.push(newOrder);
        savedCount++;
        return { ...item, isSaved: true };
      }
      return item;
    });

    if (savedCount > 0) {
      const updatedRoute = { ...route, stops: newStops };
      saveRoute(updatedRoute);
      setRoute(updatedRoute);
      setResults(updatedResults);
      alert(`Đã lưu ${savedCount} đơn hàng thành công!`);
    } else {
      alert("Không có đơn hàng nào hợp lệ (cần có địa chỉ) để lưu.");
    }
  };

  const activeResults = results.filter(r => !r.isSaved && !r.isDiscarded);

  return (
    <MobilePageShell title="Quét ảnh đơn hàng" showBack>
      <div className="mb-32">
        <div className="px-4 py-3 bg-blue-50 text-blue-800 text-xs rounded-xl mb-4 flex items-start mx-2 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p>Ảnh được quét trực tiếp trên thiết bị bằng OCR offline. Không gửi ảnh lên server. Thời gian xử lý có thể lâu tùy vào cấu hình máy.</p>
        </div>

        {/* Input Triggers */}
        <div className="px-4 mb-4">
          <label className="text-xs font-bold text-slate-600 mb-1 block">Tìm nhanh (mã đơn / SĐT / tên)</label>
          <div className="flex gap-2">
            <input value={quickSearch} onChange={(e) => handleQuickSearch(e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white" placeholder="Nhập mã đơn, SĐT, hoặc tên khách..." />
            <button onClick={() => handleQuickSearch(quickSearch)} className="px-3 py-2 bg-slate-100 rounded-xl">Tìm</button>
          </div>

          {quickResult ? (
            <div className="mt-3 bg-white p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{quickResult.receiverName || quickResult.label}</div>
                  <div className="text-sm text-slate-500">{quickResult.address}</div>
                </div>
                <div className="text-sm">
                  <div className="mb-2"><strong>Trạng thái:</strong> {quickResult.status}</div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      const now = new Date().toISOString();
                      const updated = { ...quickResult, status: 'delivering', updatedAt: now } as OrderStop;
                      const updatedStops = route.stops.map(s => s.id === quickResult.id ? updated : s);
                      saveRoute({ ...route, stops: updatedStops });
                      setRoute({ ...route, stops: updatedStops });
                      setQuickResult(updated);
                    }} className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl">Bắt đầu</button>
                    <button onClick={() => {
                      const recipient = window.prompt('Tên người nhận (tùy chọn)') || undefined;
                      const note = window.prompt('Ghi chú giao (tùy chọn)') || undefined;
                      const now = new Date().toISOString();
                      const updated = { ...quickResult, status: 'delivered', deliveredAt: now, recipientName: recipient, deliveryNote: note, updatedAt: now } as OrderStop;
                      const updatedStops = route.stops.map(s => s.id === quickResult.id ? updated : s);
                      saveRoute({ ...route, stops: updatedStops });
                      setRoute({ ...route, stops: updatedStops });
                      setQuickResult(updated);
                    }} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl">Đã giao</button>
                    <button onClick={() => {
                      const reason = window.prompt('Lý do thất bại') || undefined;
                      const now = new Date().toISOString();
                      const updated = { ...quickResult, status: 'failed', failedAt: now, failureReason: reason, updatedAt: now } as OrderStop;
                      const updatedStops = route.stops.map(s => s.id === quickResult.id ? updated : s);
                      saveRoute({ ...route, stops: updatedStops });
                      setRoute({ ...route, stops: updatedStops });
                      setQuickResult(updated);
                    }} className="px-3 py-2 bg-red-50 text-red-700 rounded-xl">Giao thất bại</button>
                  </div>
                </div>
              </div>
            </div>
          ) : quickSearch.trim() ? (
            <div className="mt-3 text-sm text-slate-500">Không tìm thấy đơn phù hợp trong tuyến.</div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 mb-6">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={cameraInputRef} 
            onChange={(e) => handleFiles(e.target.files)} 
          />
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => handleFiles(e.target.files)} 
          />
          
          <button 
            onClick={() => cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="font-bold text-slate-700 text-sm">Chụp ảnh mới</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-700 text-sm">Tải ảnh từ máy</span>
          </button>
        </div>

        {/* Results List */}
        <div className="px-2 flex flex-col gap-4">
          {activeResults.map((item, index) => (
            <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 relative">
              <div className="flex gap-4 mb-4">
                <Image src={item.imageUrl} alt="Scan preview" width={96} height={96} className="w-24 h-24 object-cover rounded-xl bg-slate-100" />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="font-bold text-slate-800">Ảnh {index + 1}</div>
                  <div className={`text-sm mt-1 font-medium ${
                    item.status === 'done' ? 'text-emerald-600' :
                    item.status === 'error' ? 'text-red-600' : 'text-blue-600 animate-pulse'
                  }`}>
                    {item.statusText}
                  </div>
                  {item.status === 'done' && item.confidence < 60 && (
                    <div className="text-xs text-orange-600 mt-1 bg-orange-50 p-1 rounded">
                      ⚠️ Ảnh có thể bị mờ, vui lòng kiểm tra lại.
                    </div>
                  )}
                  {item.status === 'done' && !item.parsedData.address?.trim() && (
                    <div className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded">
                      ❌ Cần nhập lại địa chỉ
                    </div>
                  )}
                </div>
              </div>

              {item.status === 'done' && (
                <div className="flex flex-col gap-3 mt-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Địa chỉ giao hàng *</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      rows={2}
                      value={item.parsedData.address || ""}
                      onChange={(e) => updateParsedData(item.id, 'address', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Tên khách</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.parsedData.receiverName || ""}
                        onChange={(e) => updateParsedData(item.id, 'receiverName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Số điện thoại</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.parsedData.phone || ""}
                        onChange={(e) => updateParsedData(item.id, 'phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Thu hộ (VNĐ)</label>
                      <input 
                        type="number"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.parsedData.codAmount || ""}
                        onChange={(e) => updateParsedData(item.id, 'codAmount', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Ghi chú</label>
                      <input 
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={item.parsedData.note || ""}
                        onChange={(e) => updateParsedData(item.id, 'note', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <button 
                      onClick={() => toggleRawText(item.id)}
                      className="text-xs text-blue-600 font-bold"
                    >
                      {item.isExpandedRaw ? 'Ẩn văn bản gốc' : 'Xem văn bản gốc (OCR)'}
                    </button>
                    {item.isExpandedRaw && (
                      <div className="mt-2 p-2 bg-slate-50 text-xs text-slate-600 rounded-xl whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {item.rawText || "Không có văn bản"}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => saveResult(item)}
                      className="flex-1 bg-orange-500 text-white font-bold py-2 rounded-xl text-sm active:bg-orange-600"
                    >
                      Lưu thành đơn
                    </button>
                    <button 
                      onClick={() => discardResult(item.id)}
                      className="px-4 bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm active:bg-slate-200"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </div>
              )}

              {item.status === 'error' && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <p className="text-sm text-slate-600">Không quét rõ ảnh này. Bạn có thể nhập tay thay thế.</p>
                  <button 
                    onClick={() => router.push(`/route/${route.id}/orders?edit=new`)}
                    className="w-full bg-slate-800 text-white font-bold py-2 rounded-xl text-sm"
                  >
                    Nhập tay thay thế
                  </button>
                  <button 
                    onClick={() => discardResult(item.id)}
                    className="w-full bg-slate-100 text-slate-600 font-bold py-2 rounded-xl text-sm"
                  >
                    Bỏ qua ảnh này
                  </button>
                </div>
              )}
            </div>
          ))}

          {results.length > 0 && activeResults.length === 0 && (
            <div className="text-center py-10 px-4 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Đã xử lý xong tất cả ảnh!</h3>
              <p className="text-sm text-slate-500 mb-6">Bạn có thể tiếp tục quét thêm ảnh hoặc quay lại danh sách đơn hàng.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => router.push(`/route/${route.id}/orders`)}
                  className="bg-orange-500 text-white font-bold py-3 px-6 rounded-full"
                >
                  Về danh sách đơn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeResults.filter(r => r.status === 'done').length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-40 pb-safe-offset-4 md:left-64">
          <div className="max-w-2xl mx-auto w-full">
            <BigActionButton onClick={saveAllValid}>
              Lưu tất cả đơn hợp lệ ({activeResults.filter(r => r.status === 'done' && r.parsedData.address?.trim()).length})
            </BigActionButton>
          </div>
        </div>
      )}
    </MobilePageShell>
  );
}
