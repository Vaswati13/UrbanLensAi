import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { TrendingUp, AlertTriangle, Users, Droplet, Waves } from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend
);

const Predictions = () => {
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlementId, setSelectedSettlementId] = useState('kibera_001');
  const [targetYear, setTargetYear] = useState(2030);
  const [forecast, setForecast] = useState(null);
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
      fetch(`http://127.0.0.1:8000/api/predictions/predict-risk?settlement_id=${selectedSettlementId}&target_year=${targetYear}`)
        .then(res => res.json())
        .then(data => {
          setForecast(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading prediction forecasts:", err);
          setLoading(false);
        });
    }
  }, [selectedSettlementId, targetYear]);

  // Chart styling options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94A3B8', font: { family: 'Inter', weight: '600', size: 10 } }
      },
      tooltip: {
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.05)' },
        ticks: { color: '#64748B', font: { family: 'Inter' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { family: 'Inter' } }
      }
    }
  };

  // Prepare Chart.js data
  const getRiskChartData = () => {
    if (!forecast) return { labels: [], datasets: [] };
    return {
      labels: forecast.timeline,
      datasets: [
        {
          label: 'Flooding Risk (Index 0-100)',
          data: forecast.flood_risk,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: '#EF4444',
          fill: true
        },
        {
          label: 'Water Scarcity (Index 0-100)',
          data: forecast.water_scarcity,
          borderColor: '#0EA5E9',
          backgroundColor: 'rgba(14, 165, 227, 0.1)',
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: '#0EA5E9',
          fill: true
        }
      ]
    };
  };

  const getPopulationChartData = () => {
    if (!forecast) return { labels: [], datasets: [] };
    return {
      labels: forecast.timeline,
      datasets: [
        {
          label: 'Estimated Population',
          data: forecast.population,
          backgroundColor: 'rgba(34, 197, 94, 0.75)',
          borderRadius: 6,
          barPercentage: 0.6
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Target parameters filter */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <TrendingUp size={18} className="text-sky-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-white">Predictive Model Configuration</span>
        </div>
        
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedSettlementId}
            onChange={(e) => setSelectedSettlementId(e.target.value)}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-white"
          >
            {settlements.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          
          <select
            value={targetYear}
            onChange={(e) => setTargetYear(parseInt(e.target.value))}
            className="flex-1 sm:flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer text-slate-800 dark:text-white"
          >
            <option value="2028">Target: 2028</option>
            <option value="2030">Target: 2030</option>
            <option value="2035">Target: 2035</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-500"></div>
        </div>
      ) : forecast ? (
        <div className="space-y-6">
          
          {/* Risk Summary Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Flooding summary */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center space-x-4">
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl border border-red-200 dark:border-red-800/20">
                <Waves size={22} className="glow-animation" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Predicted Flood Risk ({targetYear})</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                  {forecast.forecast.flood_risk}/100
                </span>
                <span className="text-[10px] text-red-500 font-semibold">
                  Highly Vulnerable to Slum Runoff
                </span>
              </div>
            </div>

            {/* Water summary */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center space-x-4">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl border border-sky-200 dark:border-sky-800/20">
                <Droplet size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Predicted Water Scarcity ({targetYear})</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                  {forecast.forecast.water_scarcity}/100
                </span>
                <span className="text-[10px] text-sky-500 font-semibold">
                  Borehole Replenishment Crisis
                </span>
              </div>
            </div>

            {/* Population summary */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/40 flex items-center space-x-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-xl border border-green-200 dark:border-green-800/20">
                <Users size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Forecasted Population ({targetYear})</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                  {forecast.forecast.population.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  Growth Status: Rapid Influx
                </span>
              </div>
            </div>

          </div>

          {/* Forecast Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Risk Index Line Graph */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <AlertTriangle size={16} className="text-red-500" />
                <span>Environmental Vulnerability Trajectory</span>
              </h3>
              
              <div className="h-[280px]">
                <Line data={getRiskChartData()} options={lineChartOptions} />
              </div>
            </div>

            {/* Population Growth Bar Chart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <Users size={16} className="text-green-500" />
                <span>Demographic Expansion Forecast</span>
              </h3>
              
              <div className="h-[280px]">
                <Bar data={getPopulationChartData()} options={lineChartOptions} />
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};

export default Predictions;
