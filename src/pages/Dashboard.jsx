import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Layers, 
  MapPin, 
  Eye, 
  FileJson,
  FolderOpen,
  Info,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import GISMapContainer from '../components/MapContainer';
import MetricCard from '../components/MetricCard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_settlements: 0,
    population_covered: 0,
    high_risk_zones: 0,
    active_citizen_reports: 0,
    infrastructure_gaps: 0,
    recent_activity: []
  });
  
  const [settlements, setSettlements] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  
  // GIS layer visibility toggles
  const [layersVisibility, setLayersVisibility] = useState({
    settlements: true,
    roads: true,
    water: true,
    schools: true,
    hospitals: true,
    drainage: true,
    lights: true
  });

  // Simulator for drawing polygon area
  const [drawingCoords, setDrawingCoords] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState(null);

  useEffect(() => {
    // 1. Fetch dashboard stats
    fetch('http://127.0.0.1:8000/api/stats/dashboard-stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));

    // 2. Fetch settlements
    fetch('http://127.0.0.1:8000/api/gaps/settlements')
      .then(res => res.json())
      .then(data => {
        setSettlements(data);
        if (data.length > 0) {
          setSelectedSettlement(data[0]);
        }
      })
      .catch(err => console.error("Error fetching settlements:", err));
  }, []);

  useEffect(() => {
    if (selectedSettlement) {
      // 3. Fetch infrastructure for selected settlement
      fetch(`http://127.0.0.1:8000/api/gaps/infrastructure?settlement_id=${selectedSettlement._id}`)
        .then(res => res.json())
        .then(data => setInfrastructure(data))
        .catch(err => console.error("Error fetching infrastructure:", err));
    }
  }, [selectedSettlement]);

  const toggleLayer = (layerName) => {
    setLayersVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const handleSimulateDrawing = () => {
    // Simulate drawing a polygon on Kibera
    const points = [
      [36.782, -1.312],
      [36.786, -1.312],
      [36.786, -1.315],
      [36.782, -1.315],
      [36.782, -1.312]
    ];
    setDrawingCoords(points);
    // Area of a 400m x 330m rectangle = 132,000 sq meters
    setCalculatedArea(132000);
  };

  const handleExportGeoJSON = () => {
    if (!selectedSettlement) return;
    window.open(`http://127.0.0.1:8000/api/reports/export-geojson?settlement_id=${selectedSettlement._id}`);
  };

  const handleExportPDF = () => {
    if (!selectedSettlement) return;
    window.open(`http://127.0.0.1:8000/api/reports/export-pdf?settlement_id=${selectedSettlement._id}`);
  };

  return (
    <div className="space-y-6">
      {/* 4 Animated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Settlements"
          value={stats.total_settlements}
          icon={Home}
          subtext="Mapped areas in database"
          color="sky"
          delay={0}
        />
        <MetricCard
          title="Population Covered"
          value={stats.population_covered}
          icon={FolderOpen}
          subtext="Residents documented"
          color="emerald"
          delay={0.1}
        />
        <MetricCard
          title="Infrastructure Gaps"
          value={stats.infrastructure_gaps}
          icon={AlertCircle}
          subtext="Unpaved roads / clogged sewers"
          color="amber"
          delay={0.2}
        />
        <MetricCard
          title="Active Citizen Reports"
          value={stats.active_citizen_reports}
          icon={Eye}
          subtext="Pending action items"
          color="rose"
          delay={0.3}
        />
      </div>

      {/* Main Mapping UI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Map Controls & Layers */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
              <Layers size={16} className="text-sky-500" />
              <span>Select Settlement Area</span>
            </h3>
            <div className="space-y-2">
              {settlements.map(settlement => (
                <button
                  key={settlement._id}
                  onClick={() => setSelectedSettlement(settlement)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${
                    selectedSettlement && selectedSettlement._id === settlement._id
                      ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400'
                      : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-800 dark:text-white">{settlement.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{settlement.district} • Pop: {settlement.population.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
              <Layers size={16} className="text-sky-500" />
              <span>GIS Layer Toggle</span>
            </h3>
            
            <div className="space-y-2.5">
              {[
                { key: 'settlements', label: 'Settlement Boundary', color: 'border-slate-300 dark:border-slate-700 bg-slate-400' },
                { key: 'roads', label: 'Road Networks', color: 'border-green-300 dark:border-green-800 bg-green-500' },
                { key: 'water', label: 'Water Sources', color: 'border-sky-300 dark:border-sky-800 bg-sky-500' },
                { key: 'schools', label: 'Schools', color: 'border-amber-300 dark:border-amber-800 bg-amber-500' },
                { key: 'hospitals', label: 'Hospitals / Clinics', color: 'border-rose-300 dark:border-rose-800 bg-rose-500' },
                { key: 'drainage', label: 'Open Drainage / Sewers', color: 'border-red-300 dark:border-red-800 bg-red-500' },
                { key: 'lights', label: 'Street Lighting', color: 'border-yellow-200 dark:border-yellow-700 bg-yellow-400' },
              ].map((layer) => (
                <label 
                  key={layer.key} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <span className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${layer.color}`} />
                    <span>{layer.label}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={layersVisibility[layer.key]}
                    onChange={() => toggleLayer(layer.key)}
                    className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Map & Drawing Panel */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          <div className="glass-panel p-2 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 h-[480px] overflow-hidden relative">
            <GISMapContainer
              settlements={settlements}
              infrastructure={infrastructure}
              activeSettlement={selectedSettlement}
              layersVisibility={layersVisibility}
            />

            {/* Float Overlay Actions */}
            <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
              <button
                onClick={handleSimulateDrawing}
                className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl border border-slate-700 backdrop-blur shadow-md flex items-center space-x-1.5 cursor-pointer transition-all"
              >
                <MapPin size={12} />
                <span>Simulate Drawing Tool</span>
              </button>
            </div>
          </div>

          {/* Bottom GIS inspector stats and exports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Draw Polygon Tool Inspector */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1">
                  <Info size={12} />
                  <span>Polygon Drawing Area Calculator</span>
                </h4>
                {calculatedArea ? (
                  <div className="space-y-1.5">
                    <div className="text-slate-800 dark:text-white font-extrabold text-lg">
                      Estimated Area: {calculatedArea.toLocaleString()} m²
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Coordinates Captured: {drawingCoords.length} path points. 
                      Based on standard densities, this outlines a capacity of ~<strong>920 residents</strong>.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">
                    Click the "Simulate Drawing Tool" on the map overlay to draw a polygon and measure settlement density.
                  </p>
                )}
              </div>
              
              {calculatedArea && (
                <button
                  onClick={() => { setCalculatedArea(null); setDrawingCoords([]); }}
                  className="mt-4 text-left text-xs font-bold text-sky-500 hover:text-sky-600 underline"
                >
                  Clear Drawing Layer
                </button>
              )}
            </div>

            {/* Export Actions Panel */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Export GIS Analysis Report
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Export parsed settlement shapes, clinics, borehole coordinates, and AI risk reports in standard formats.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleExportGeoJSON}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <FileJson size={14} />
                  <span>Export GeoJSON</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/10 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export PDF Report</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
