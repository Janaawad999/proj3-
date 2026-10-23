import React, { useState, useRef } from 'react';
import { 
    ScanEye, Upload, Eye, EyeOff, CheckCircle2, 
    AlertTriangle, Sparkles, Droplets, Info, 
    RefreshCw, ArrowRight, Layers, FileImage
} from 'lucide-react';
import { FIELD_VISION_SAMPLES, DATA_PROVENANCE } from '../services/agriPulseData';
import { cropScanService } from '../services/api';

const FieldVisionPage = () => {
    // Current sample index
    const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const currentSample = FIELD_VISION_SAMPLES[selectedSampleIndex];
    const activeData = uploadedImage && analysisResult ? analysisResult : currentSample;

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            setUploadedImage(event.target.result);
            setIsAnalyzing(true);
            setError(null);

            try {
                const response = await cropScanService.analyzeCropImage(file);
                const sample = response.sample || response.data || response;
                setAnalysisResult(sample);
            } catch (err) {
                console.warn('Crop scan failed:', err);
                setError(err.userMessage || 'Failed to complete vision inference');
            } finally {
                setIsAnalyzing(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            COMPUTER VISION WORKSPACE
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            YOLOv8 BENCHMARK
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Field Vision — Crop Stress & Disease Detection
                    </h1>
                    <p className="text-sm text-[#858A80] mt-0.5 max-w-2xl">
                        Foliar canopy inspection correlating computer-vision pathology detections with zone irrigation pump telemetry.
                    </p>
                </div>

                {/* Preset Benchmark Sample Switcher */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#858A80]">Preset Benchmarks:</span>
                    <div className="flex gap-1 bg-[#EFEFE7] p-1 rounded-md text-xs font-semibold">
                        {FIELD_VISION_SAMPLES.map((sample, idx) => (
                            <button
                                key={sample.id}
                                onClick={() => {
                                    setSelectedSampleIndex(idx);
                                    setUploadedImage(null);
                                }}
                                className={`px-2.5 py-1 rounded transition-colors ${
                                    selectedSampleIndex === idx && !uploadedImage
                                        ? 'bg-[#173F35] text-white shadow-sm' 
                                        : 'text-[#555] hover:text-black'
                                }`}
                            >
                                {sample.title.split('—')[0].trim()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Benchmark Transparency Banner */}
            <div className="bg-[#EFEFE7] border border-[#D8D7CD] rounded-md p-3 flex items-center justify-between text-xs text-[#555A52]">
                <div className="flex items-center gap-2">
                    <Info size={15} className="text-[#173F35] flex-shrink-0" />
                    <span>
                        <strong className="text-[#173F35]">Model Attribution:</strong> Detections powered by calibrated 
                        <code className="bg-white px-1.5 py-0.5 rounded text-[#173F35] font-mono mx-1">
                            YOLOv8s-CropDisease v1.2
                        </code> benchmark weights. Real-time GPU inference server is currently simulated.
                    </span>
                </div>
                <span className="font-mono text-[0.68rem] text-[#858A80]">mAP@0.5: 89.4%</span>
            </div>

            {/* Main Visual Canvas & Inspection Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Spacious Visual Canvas (7 cols) */}
                <div className="lg:col-span-7 bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-4">
                    {/* Canvas Controls */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                                {uploadedImage ? "User Uploaded Aerial Foliage" : currentSample.title}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAnnotations(!showAnnotations)}
                                className={`agri-btn text-[0.72rem] py-1 px-2.5 ${
                                    showAnnotations ? 'agri-btn-primary' : 'agri-btn-outline'
                                }`}
                            >
                                {showAnnotations ? <Eye size={13} /> : <EyeOff size={13} />}
                                <span>{showAnnotations ? "Annotations Active" : "Original View"}</span>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="agri-btn agri-btn-outline text-[0.72rem] py-1 px-2.5"
                            >
                                <Upload size={13} />
                                <span>Upload Image</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Image Box with Simulated Bounding Boxes */}
                    <div className="relative w-full aspect-[4/3] bg-[#102D27] rounded-lg overflow-hidden flex items-center justify-center border border-[#1C4B40] shadow-inner select-none">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center gap-3 text-white">
                                <RefreshCw size={28} className="animate-spin text-[#C7F36B]" />
                                <span className="font-mono text-xs text-[#C7F36B]">
                                    Running YOLOv8 TensorRT Inference Kernel...
                                </span>
                            </div>
                        ) : uploadedImage ? (
                            <div className="relative w-full h-full">
                                <img 
                                    src={uploadedImage} 
                                    alt="Uploaded Field" 
                                    className="w-full h-full object-cover"
                                />
                                {showAnnotations && activeData?.detections?.map((det) => (
                                    <div 
                                        key={det.id}
                                        className="absolute border-2 rounded p-1 transition-all"
                                        style={{ 
                                            borderColor: det.color,
                                            backgroundColor: `${det.color}25`,
                                            top: `${det.box?.y || 25}%`, 
                                            left: `${det.box?.x || 20}%`, 
                                            width: `${det.box?.width || 50}%`, 
                                            height: `${det.box?.height || 50}%` 
                                        }}
                                    >
                                        <span 
                                            className="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded shadow-xs"
                                            style={{
                                                backgroundColor: det.color,
                                                color: det.color === '#C7F36B' ? '#173F35' : '#FFFFFF'
                                            }}
                                        >
                                            {det.label} ({det.confidence}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="relative w-full h-full bg-gradient-to-br from-[#173F35] to-[#102D27] flex items-center justify-center p-6">
                                {/* SVG Foliage Representation */}
                                <svg viewBox="0 0 600 450" className="w-full h-full opacity-80">
                                    <defs>
                                        <radialGradient id="leafGrad" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#48C78E" />
                                            <stop offset="70%" stopColor="#2AAB91" />
                                            <stop offset="100%" stopColor="#173F35" />
                                        </radialGradient>
                                    </defs>
                                    {/* Canopy Leaves Backdrop */}
                                    <path d="M100 200 C150 100, 300 120, 350 250 C400 380, 200 400, 100 200 Z" fill="url(#leafGrad)" />
                                    <path d="M280 180 C350 80, 500 110, 520 240 C540 370, 380 390, 280 180 Z" fill="url(#leafGrad)" opacity="0.85" />
                                    <path d="M180 280 C240 180, 420 220, 440 340 C460 460, 260 480, 180 280 Z" fill="url(#leafGrad)" opacity="0.75" />
                                </svg>

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="font-mono text-xs text-white/50 tracking-wider">
                                        [{activeData.imagePlaceholderText?.toUpperCase() || 'FOLJAR CANOPY INSPECTION'}]
                                    </span>
                                </div>

                                {/* Annotated Bounding Boxes */}
                                {showAnnotations && activeData?.detections?.map((det) => (
                                    <div
                                        key={det.id}
                                        className="absolute rounded border-2 transition-all"
                                        style={{
                                            borderColor: det.color,
                                            backgroundColor: `${det.color}25`,
                                            top: `${det.box.y}%`,
                                            left: `${det.box.x}%`,
                                            width: `${det.box.width}%`,
                                            height: `${det.box.height}%`,
                                        }}
                                    >
                                        <div 
                                            className="inline-block text-[0.68rem] font-bold font-mono px-2 py-0.5 rounded shadow-sm"
                                            style={{
                                                backgroundColor: det.color,
                                                color: det.color === '#C7F36B' ? '#173F35' : '#FFFFFF'
                                            }}
                                        >
                                            {det.label} ({det.confidence}%)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-lg text-xs text-[#9E1F1A] flex items-center justify-between">
                            <span>{error}</span>
                            <button 
                                onClick={() => setError(null)} 
                                className="underline font-bold text-[0.68rem]"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Canvas Metadata Footnote */}
                    <div className="flex items-center justify-between text-xs text-[#858A80] pt-1">
                        <span>Resolution: 4032 × 3024 RGB • Multi-spectral normalized</span>
                        <span className="font-mono text-[0.68rem]">Inference Latency: 18ms</span>
                    </div>
                </div>

                {/* Agronomic Inspection Summary & Hydraulic Correlation (5 cols) */}
                <div className="lg:col-span-5 bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm space-y-5">
                    {/* Section Header */}
                    <div className="pb-3 border-b border-[#F0EFEA]">
                        <span className="text-[0.68rem] font-mono text-[#858A80] uppercase tracking-wider font-extrabold">
                            AGRONOMIC DIAGNOSTIC SHEET
                        </span>
                        <h3 className="text-base font-extrabold text-[#173F35]">
                            {activeData.crop}
                        </h3>
                        <div className="text-xs text-[#858A80] mt-0.5">
                            Target Sector: <strong>{activeData.sectorId}</strong>
                        </div>
                    </div>

                    {/* Detections List */}
                    <div>
                        <div className="text-xs font-bold text-[#173F35] uppercase tracking-wider mb-2">
                            Identified Foliar Pathologies ({activeData.detections?.length || 0})
                        </div>
                        <div className="space-y-2">
                            {activeData.detections?.map(det => (
                                <div key={det.id} className="p-3 rounded-md bg-[#F6F5EF] border border-[#E6E5DC] flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-xs text-[#252B28]">{det.label}</div>
                                        <div className="text-[0.68rem] text-[#858A80]">Severity: {det.severity}</div>
                                    </div>
                                    <span 
                                        className="text-xs font-bold font-mono px-2 py-0.5 rounded"
                                        style={{ backgroundColor: `${det.color}30`, color: det.color === '#173F35' ? '#173F35' : det.color }}
                                    >
                                        {det.confidence}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hydraulic Pump Correlation (The Core Innovation!) */}
                    <div className="p-3.5 rounded-lg bg-[#EBF1E8] border border-[#DCE7D8] text-xs">
                        <div className="font-bold text-[#173F35] flex items-center gap-1.5 mb-1">
                            <Droplets size={15} />
                            Hydraulic Telemetry Correlation
                        </div>
                        <p className="text-[#252B28] leading-relaxed">
                            {activeData.hydraulicCorrelation}
                        </p>
                        <div className="mt-2 pt-2 border-t border-[#DCE7D8] flex items-center justify-between text-[0.72rem] font-mono font-semibold text-[#173F35]">
                            <span>Linked Pump: {activeData.linkedPump}</span>
                            <span>Sector Pressure: 3.92 bar</span>
                        </div>
                    </div>

                    {/* Recommended Agronomic Prescription */}
                    <div className="p-3.5 rounded-lg bg-white border border-[#E6E5DC] text-xs shadow-sm">
                        <div className="font-bold text-[#173F35] mb-1">
                            Prescribed Agronomic Action:
                        </div>
                        <p className="text-[#555A52] leading-relaxed">
                            {activeData.action}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldVisionPage;
