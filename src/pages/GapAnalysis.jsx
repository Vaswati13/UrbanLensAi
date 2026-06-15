import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { 
  ShieldAlert, 
  Map, 
  Droplet, 
  Activity, 
  TrendingDown, 
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const severityColors = {
  2: { border: '#EF4444', fill: '#EF4444', label: 'Critical', bgClass: 'bg-red-500/10 text-red-500 border-red-500/20' },
  1: { border: '#F59E0B', fill: '#F59E0B', label: 'Medium Deficiency', bgClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  0: { border: '#10B981', fill: '#10B981', label: 'Good Accessibility', bgClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
};

const GapAnalysis = () => {
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlementId, setSelectedSettlementId] = useState('kibera_001');
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch settlements list
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

  useEffect(() => {
    if (selectedSettlementId) {
      setLoading(true);
      fetch(`http://127.0.0.1:8000/api/gaps/gap-analysis?settlement_id=${selectedSettlementId}`)
        .then(res => res.json())
        .then(data => {
          setGapData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error running gap analysis:", err);
          setLoading(false);
        });
    }
  }, [selectedSettlementId]);

  const getMapCenter = () => {
    if (selectedSettlementId === 'kibera_001') return [-1.3133, 36.7888];
    if (selectedSettlementId === 'mathare_002') return [-1.2588, 36.8582];
    if (selectedSettlementId === 'mukuru_003') return [-1.3204, 36.8851];
    return [-1.3133, 36.7888];
  };

  const handleExportPDF = () => {
    window.open(`http://127.0.0.1:8000/api/reports/export-pdf?settlement_id=${selectedSettlementId}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <Filter size={18} className="text-sky-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">Analysis Filters</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSettlementId}
            onChange={(e) => setSelectedSettlementId(e.target.value)}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-white"
          >
            {settlements.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          
          <button
            onClick={handleExportPDF}
            className="w-full sm:w-auto px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/10 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
          >
            <FileSpreadsheet size={14} />
            <span>Download PDF Analysis</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        </div>
      ) : gapData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: GIS Heatmap Visualizer */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="glass-panel p-2 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 h-[480px] overflow-hidden relative">
              <MapContainer
                center={getMapCenter()}
                zoom={14}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  className="dark:invert dark:opacity-90 dark:hue-rotate-180"
                />

                {/* Heatmap Grid Circles */}
                {gapData.heatmap.map((pt, idx) => {
                  const style = severityColors[pt.severity];
                  return (
                    <Circle
                      key={idx}
                      center={[pt.coordinates[1], pt.coordinates[0]]}
                      radius={120} // 120m radius coverage representing grid pixel
                      pathOptions={{
                        color: style.border,
                        fillColor: style.fill,
                        fillOpacity: pt.intensity * 0.55,
                        weight: 1,
                        opacity: 0.7
                      }}
                    >
                      <Popup>
                        <div className="text-slate-800 p-1">
                          <h5 className="font-bold text-xs">Sector {idx + 1}</h5>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${style.bgClass}`}>
                            {style.label}
                          </span>
                          <p className="text-[11px] mt-2">
                            Water Distance: <strong>{pt.distance_to_water_meters}m</strong>
                          </p>
                          <p className="text-[11px]">
                            Healthcare Distance: <strong>{pt.distance_to_health_meters}m</strong>
                          </p>
                        </div>
                      </Popup>
                    </Circle>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Right Side: Gap Analysis details */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            
            {/* Metric Overview */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <ShieldAlert size={16} className="text-sky-500" />
                <span>Severity Distribution</span>
              </h3>
              
              <div className="space-y-3">
                {[
                  { label: 'Critical Gap Sectors', count: gapData.critical_sectors_count, total: gapData.total_analyzed_sectors, color: 'bg-red-500', textClass: 'text-red-500 font-bold' },
                  { label: 'Medium Deficit Sectors', count: gapData.medium_sectors_count, total: gapData.total_analyzed_sectors, color: 'bg-amber-500', textClass: 'text-amber-500 font-semibold' },
                  { label: 'Fully Serviced Sectors', count: gapData.good_sectors_count, total: gapData.total_analyzed_sectors, color: 'bg-emerald-500', textClass: 'text-emerald-500' }
                ].map((item, idx) => {
                  const pct = gapData.total_analyzed_sectors > 0 
                    ? Math.round((item.count / gapData.total_analyzed_sectors) * 100) 
                    : 0;
                  return (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-400">{item.label}</span>
                        <span className={item.textClass}>{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Calculations Summary */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex-1 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Map size={16} className="text-sky-500" />
                <span>AI Infrastructure Audit</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/30 text-sky-500 mt-0.5">
                    <Droplet size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Water Access Deficit</h4>
                    <p className="text-slate-400 dark:text-slate-500 mt-0.5">
                      Avg walk distance is <strong>{gapData.averages.water_access_distance_meters}m</strong>. 
                      Deficit level: <span className="font-bold text-amber-500">{gapData.gaps_summary.water_deficit_level}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 mt-0.5">
                    <Activity size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Healthcare Deficit</h4>
                    <p className="text-slate-400 dark:text-slate-500 mt-0.5">
                      Avg walk distance is <strong>{gapData.averages.healthcare_access_distance_meters}m</strong>. 
                      Deficit level: <span className="font-bold text-red-500">{gapData.gaps_summary.healthcare_deficit_level}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 mt-0.5">
                    <TrendingDown size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Sanitation & Drainage</h4>
                    <p className="text-slate-400 dark:text-slate-500 mt-0.5">
                      {gapData.gaps_summary.sanitation_gaps}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-500 mt-0.5">
                    <Map size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">Road Network Coverage</h4>
                    <p className="text-slate-400 dark:text-slate-500 mt-0.5">
                      {gapData.gaps_summary.road_gaps}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};

export default GapAnalysis;
