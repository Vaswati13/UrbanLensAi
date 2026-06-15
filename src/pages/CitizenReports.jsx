import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  MapPin, 
  Camera, 
  Mic, 
  MicOff,
  User, 
  Loader2, 
  CheckCircle2, 
  FolderSync,
  Volume2
} from 'lucide-react';

const CitizenReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [reporterName, setReporterName] = useState('');
  const [category, setCategory] = useState('Water Problem');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(-1.3135);
  const [longitude, setLongitude] = useState(36.7892);
  
  // Media simulation
  const [photoPreview, setPhotoPreview] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordedVoice, setRecordedVoice] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  const [formSubmitState, setFormSubmitState] = useState(''); // 'submitting', 'success'

  const categories = [
    "Water Problem", 
    "Waste Management", 
    "Drainage", 
    "Healthcare", 
    "Roads", 
    "Street Lights"
  ];

  const loadReports = () => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/reports/list')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading citizen reports:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Simulates browser geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // Fallback to random offset near Kibera if rejected
          const randomLat = -1.313 - (Math.random() * 0.005);
          const randomLng = 36.788 + (Math.random() * 0.005);
          setLatitude(randomLat);
          setLongitude(randomLng);
        }
      );
    }
  };

  // Simulates photo file upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Simulates microphone recording
  const handleToggleVoice = () => {
    if (isRecording) {
      clearInterval(timerInterval);
      setIsRecording(false);
      setRecordedVoice(true);
    } else {
      setRecordedVoice(false);
      setRecordDuration(0);
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitState('submitting');

    const reportPayload = {
      reporter_name: reporterName,
      category: category,
      description: description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      photo_url: photoPreview ? 'mock_photo_uploaded.jpg' : '',
      voice_url: recordedVoice ? 'mock_voice_uploaded.mp3' : ''
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/reports/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportPayload)
      });

      if (!res.ok) throw new Error('Submission failed');

      setFormSubmitState('success');
      setTimeout(() => {
        setFormSubmitState('');
        // Reset form
        setReporterName('');
        setDescription('');
        setPhotoPreview('');
        setRecordedVoice(false);
        loadReports();
      }, 1500);

    } catch (err) {
      console.error(err);
      setFormSubmitState('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Report Submission Form */}
      <div className="lg:col-span-5">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <span>Report Infrastructure Crisis</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Submit infrastructure blockages, water pipe bursts, or hazards</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Your Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-850 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Geotag Coordinates</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                >
                  <MapPin size={12} className="text-sky-500" />
                  <span>Get GPS Location</span>
                </button>
              </div>
            </div>

            {/* Coordinate display */}
            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 bg-slate-100/40 dark:bg-slate-950/20 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40 font-semibold">
              <div>Lat: {latitude.toFixed(5)}</div>
              <div>Lng: {longitude.toFixed(5)}</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-850 dark:text-white focus:outline-none resize-none"
              />
            </div>

            {/* Media Upload Mock Rows */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Photo Upload Simulator */}
              <label className="border border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/25 relative overflow-hidden h-[72px]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera size={16} className="text-slate-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-500">Capture Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>

              {/* Voice Note Simulator */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`border border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all h-[72px] ${
                  isRecording 
                    ? 'border-red-500 bg-red-500/10 text-red-500' 
                    : recordedVoice 
                    ? 'border-sky-500 bg-sky-500/10 text-sky-500' 
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/25 text-slate-500'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={16} className="animate-pulse mb-1" />
                    <span className="text-[10px] font-extrabold">Recording... {recordDuration}s</span>
                  </>
                ) : recordedVoice ? (
                  <>
                    <Volume2 size={16} className="mb-1" />
                    <span className="text-[10px] font-extrabold">Voice Note Attached</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} className="mb-1" />
                    <span className="text-[10px] font-extrabold">Record Voice</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={formSubmitState === 'submitting'}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/10 flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              {formSubmitState === 'submitting' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : formSubmitState === 'success' ? (
                <CheckCircle2 size={12} className="text-emerald-400" />
              ) : (
                <FolderSync size={12} />
              )}
              <span>
                {formSubmitState === 'submitting' ? 'Submitting Report...' : formSubmitState === 'success' ? 'Report Logged!' : 'Submit Issue'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Live Reports List */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Active Field Reports</h3>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-sky-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-semibold">
              No active citizen reports logged.
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              <AnimatePresence>
                {reports.map((report) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-xl space-y-2.5 relative overflow-hidden"
                  >
                    {/* Status side stripe */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      report.status === 'pending' ? 'bg-amber-500' :
                      report.status === 'investigating' ? 'bg-sky-500' :
                      'bg-emerald-500'
                    }`} />

                    <div className="flex items-center justify-between text-xs pl-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 dark:text-white capitalize">{report.category}</span>
                        <span className="text-[10px] text-slate-400">• By {report.reporter_name}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border capitalize ${
                        report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        report.status === 'investigating' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-450 pl-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pl-2 font-semibold">
                      <span className="flex items-center space-x-1">
                        <MapPin size={10} className="text-sky-500" />
                        <span>
                          {report.coordinates.coordinates[0].toFixed(5)}, {report.coordinates.coordinates[1].toFixed(5)}
                        </span>
                      </span>
                      <span>
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CitizenReports;
