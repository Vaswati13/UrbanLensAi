import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Sparkles, Check, X, ShieldAlert, MapPin, Eye } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom gold pulsing divicon for recommendations
const createRecIcon = (approved) => {
  const color = approved ? 'emerald-500' : 'amber-500';
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-${color}"></span>
        <span class="relative inline-flex rounded-full h-4.5 w-4.5 bg-${color} border-2 border-white dark:border-slate-900 shadow flex items-center justify-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        </span>
      </div>
    `,
    className: 'rec-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const Recommendations = () => {
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlementId, setSelectedSettlementId] = useState('kibera_001');
  const [recommendations, setRecommendations] = useState([]);
  const [activeRec, setActiveRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasApproveRights = ['admin', 'government'].includes(currentUser.role);

  useEffect(() => {
    // 1. Fetch settlements
    fetch('http://127.0.0.1:8000/api/gaps/settlements')
      .then(res => res.json())
      .then(data => {
        setSettlements(data);
        if (data.length > 0) {
          setSelectedSettlementId(data[0]._id);
        }
      })
      .catch(err => console.error("Error loading settlements:", err));
  }, []);

  const loadRecommendations = () => {
    if (selectedSettlementId) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/recommendations/list?settlement_id=${selectedSettlementId}`)
        .then(res => res.json())
        .then(data => {
          setRecommendations(data);
          if (data.length > 0) {
            setActiveRec(data[0]);
          } else {
            setActiveRec(null);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading recommendations:", err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedSettlementId]);

  const handleApprove = async (recId, approveBool) => {
    setActionMessage('');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/recommendations/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendation_id: recId,
          approved: approveBool
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authorization failed');

      setActionMessage(data.message);
      // Reload recommendations
      loadRecommendations();
    } catch (err) {
      setActionMessage(err.message || 'Operation failed.');
    }
  };

  const getMapCenter = () => {
    if (selectedSettlementId === 'kibera_001') return [-1.3133, 36.7888];
    if (selectedSettlementId === 'mathare_002') return [-1.2588, 36.8582];
    if (selectedSettlementId === 'mukuru_003') return [-1.3204, 36.8851];
    return [-1.3133, 36.7888];
  };

  return (
    <div className="space-y-6">
      
      {/* Selector bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <Sparkles size={18} className="text-sky-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">AI Location Recommendation Engine</span>
        </div>
        
        <select
          value={selectedSettlementId}
          onChange={(e) => setSelectedSettlementId(e.target.value)}
          className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-white"
        >
          {settlements.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: Map showing recommendation pins */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="glass-panel p-2 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 h-[480px] overflow-hidden relative">
              <MapContainer
                center={getMapCenter()}
                zoom={14.5}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  className="dark:invert dark:opacity-90 dark:hue-rotate-180"
                />

                {recommendations.map(rec => {
                  const coord = [rec.proposed_coordinates.coordinates[1], rec.proposed_coordinates.coordinates[0]];
                  const isApproved = rec.approved;
                  const icon = createRecIcon(isApproved);

                  return (
                    <Marker 
                      key={rec._id} 
                      position={coord} 
                      icon={icon}
                      eventHandlers={{
                        click: () => setActiveRec(rec)
                      }}
                    >
                      <Popup>
                        <div className="text-slate-800 p-1">
                          <h5 className="font-bold text-xs capitalize">{rec.facility_type.replace('_', ' ')}</h5>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                            isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-250' : 'bg-amber-50 text-amber-600 border-amber-250'
                          }`}>
                            {isApproved ? 'APPROVED' : 'PROPOSED'}
                          </span>
                          <p className="text-[10px] mt-2 font-semibold">Click details panel for rationale</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Right Side: Recommendation Pin Detail Inspector */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            
            {/* List selector */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Proposed Placements</h3>
              <div className="space-y-2">
                {recommendations.map(rec => (
                  <button
                    key={rec._id}
                    onClick={() => setActiveRec(rec)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-semibold ${
                      activeRec && activeRec._id === rec._id
                        ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                        : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="capitalize">{rec.facility_type.replace('_', ' ')}</span>
                    <span className="text-[10px] font-bold text-slate-400">Score: {rec.confidence_score}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation detail panel */}
            {activeRec ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      activeRec.approved 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {activeRec.approved ? 'APPROVED BY PLANNERS' : 'PENDING EVALUATION'}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white capitalize mt-2">
                      New {activeRec.facility_type.replace('_', ' ')} Location
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-400 font-bold block">Proposed Coordinates:</span>
                    <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                      <MapPin size={12} className="text-sky-500" />
                      <span>
                        Lng: {activeRec.proposed_coordinates.coordinates[0].toFixed(5)}, Lat: {activeRec.proposed_coordinates.coordinates[1].toFixed(5)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-400 font-bold block">AI Confidence Score:</span>
                    <span className="text-2xl font-black text-sky-500">{activeRec.confidence_score}%</span>
                  </div>

                  <div className="space-y-1.5 text-xs leading-relaxed">
                    <span className="text-slate-400 font-bold block">Placement Rationale:</span>
                    <p className="text-slate-600 dark:text-slate-400">{activeRec.rationale}</p>
                  </div>
                </div>

                {/* Approve/Decline controls */}
                <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/60 space-y-3">
                  {actionMessage && (
                    <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl text-[10px] font-semibold text-center">
                      {actionMessage}
                    </div>
                  )}
                  
                  {hasApproveRights ? (
                    <div className="flex space-x-2">
                      {!activeRec.approved ? (
                        <button
                          onClick={() => handleApprove(activeRec._id, true)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Check size={14} />
                          <span>Approve Location</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(activeRec._id, false)}
                          className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <X size={14} />
                          <span>Decline Location</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium bg-slate-100 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                      <ShieldAlert size={14} className="text-slate-500" />
                      <span>Role restricts approval authority to Government/Admin users.</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex-1 flex items-center justify-center text-slate-400 text-xs font-semibold">
                No location selected. Click a pin.
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Recommendations;
