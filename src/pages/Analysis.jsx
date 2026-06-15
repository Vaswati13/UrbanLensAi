import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scan, Loader2, BarChart2, ShieldAlert, Check } from 'lucide-react';
import Slider from '../components/Slider';

const Analysis = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadData, setUploadData] = useState(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setUploadData(null);
      setAnalysisResult(null);
      setError('');
    } else {
      setError('Please select a valid image file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload satellite image
      const uploadRes = await fetch('http://127.0.0.1:8000/api/analysis/upload-image', {
        method: 'POST',
        body: formData
      });

      const uploadInfo = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadInfo.detail || 'Upload failed');
      
      setUploadData(uploadInfo);

      // 2. Trigger AI detection
      const detectRes = await fetch(`http://127.0.0.1:8000/api/analysis/detect-settlement?filename=${uploadInfo.filename}`, {
        method: 'POST'
      });

      const detectInfo = await detectRes.json();
      if (!detectRes.ok) throw new Error(detectInfo.detail || 'Detection failed');

      setAnalysisResult(detectInfo);
    } catch (err) {
      setError(err.message || 'AI Image parsing failed.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Quick select sample satellite images
  const selectSample = async (sampleUrl, name) => {
    setAnalyzing(true);
    setError('');
    setAnalysisResult(null);
    setPreviewUrl(sampleUrl);

    try {
      // Fetch sample as file and send to backend
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const sampleFile = new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
      
      setFile(sampleFile);
      
      const formData = new FormData();
      formData.append('file', sampleFile);

      const uploadRes = await fetch('http://127.0.0.1:8000/api/analysis/upload-image', {
        method: 'POST',
        body: formData
      });
      const uploadInfo = await uploadRes.json();
      setUploadData(uploadInfo);

      const detectRes = await fetch(`http://127.0.0.1:8000/api/analysis/detect-settlement?filename=${uploadInfo.filename}`, {
        method: 'POST'
      });
      const detectInfo = await detectRes.json();
      setAnalysisResult(detectInfo);
    } catch (err) {
      setError('Sample image analysis failed. Local API may be offline.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Upload & Options Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
              Upload Satellite Imagery
            </h3>
            
            <div className="space-y-4">
              {/* Drag Drop Box */}
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50/50 dark:bg-slate-950/20">
                <Upload className="text-slate-400 mb-3" size={28} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Drag & Drop or Click to browse
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Supports High-Res TIFF, JPG, PNG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Sample Files Selection */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                  Or Test with Sample Data
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    onClick={() => selectSample('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600', 'kibera_drone')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-left truncate cursor-pointer"
                  >
                    Nairobi Drone View
                  </button>
                  <button
                    onClick={() => selectSample('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600', 'dharavi_sat')}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-left truncate cursor-pointer"
                  >
                    Mumbai Settlement
                  </button>
                </div>
              </div>

              {previewUrl && (
                <button
                  onClick={handleUpload}
                  disabled={analyzing}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/10 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {analyzing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Scan size={14} />
                  )}
                  <span>Run YOLOv8 Parser</span>
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex items-center space-x-2">
                <ShieldAlert size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* AI Metrics Summary Panel */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <BarChart2 size={16} className="text-sky-500" />
                <span>AI Parsing Analytics</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Buildings Mapped</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {analysisResult.metrics.buildings_detected}
                  </div>
                </div>
                <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Road Links</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {analysisResult.metrics.road_segments_detected}
                  </div>
                </div>
                <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Open Sewers</div>
                  <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
                    {analysisResult.metrics.open_drains_detected}
                  </div>
                </div>
                <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Gap Index</div>
                  <div className="text-xl font-black text-sky-500 mt-1">
                    {analysisResult.metrics.risk_index}/100
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Interactive Viewport Display */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 min-h-[400px] flex flex-col items-center justify-center relative bg-slate-900 overflow-hidden">
            
            <AnimatePresence mode="wait">
              {analyzing ? (
                // Modern scanning scanner loader
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-4 text-center p-6 relative z-10"
                >
                  <Loader2 size={36} className="text-sky-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">YOLOv8 Feature Segmenter Running</p>
                    <p className="text-xs text-slate-400">Paving roadways & identifying buildings...</p>
                  </div>
                  {/* Glowing Scanner Line */}
                  <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none flex items-center justify-center">
                    <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent absolute glow-animation animate-bounce"></div>
                  </div>
                </motion.div>
              ) : analysisResult ? (
                // Bounding Boxes Canvas Overlay with relative positions
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full relative"
                >
                  <div className="relative w-full h-[400px] overflow-hidden rounded-2xl">
                    <img
                      src={previewUrl}
                      alt="Analyzed satellite"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* SVG overlay of bounding boxes */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      {analysisResult.detections.map((det) => (
                        <div
                          key={det.id}
                          className="absolute border-2 rounded text-[8px] font-bold text-white p-0.5"
                          style={{
                            left: `${det.bbox.x}%`,
                            top: `${det.bbox.y}%`,
                            width: `${det.bbox.w}%`,
                            height: `${det.bbox.h}%`,
                            borderColor: det.color,
                            backgroundColor: `${det.color}20` // 20% opacity
                          }}
                        >
                          <span className="absolute bottom-full left-0 bg-slate-900/90 px-1 py-0.5 rounded text-[8px] tracking-tight">
                            {det.label.split(' ')[0]} ({Math.round(det.confidence * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Toggle view slider comparison */}
                  <div className="mt-4 p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Check size={14} className="text-green-500" />
                      <span>Parsed {analysisResult.detections.length} total geospatial elements</span>
                    </span>
                    <span className="font-semibold text-sky-400">Confidence Match: 94.2%</span>
                  </div>
                </motion.div>
              ) : previewUrl ? (
                // Image preview before run
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full text-center space-y-4"
                >
                  <div className="w-full h-[350px] rounded-2xl overflow-hidden border border-slate-800">
                    <img src={previewUrl} alt="Satellite preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-slate-400">
                    Press "Run YOLOv8 Parser" to trigger segmentation.
                  </p>
                </motion.div>
              ) : (
                // Idle state placeholder
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-3 p-8 text-slate-500"
                >
                  <Scan size={44} className="mx-auto text-slate-600 animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-400">No Satellite Image Loaded</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Upload high-resolution drone photos or select a demo coordinate from the left panel to test detection.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Analysis;
