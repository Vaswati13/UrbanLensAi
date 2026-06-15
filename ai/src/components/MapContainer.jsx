import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet markers image paths in React build - we override with custom SVG/CSS DivIcons
const createGlowIcon = (colorClass) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-5 h-5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${colorClass}"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-${colorClass} border-2 border-white dark:border-slate-900"></span>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const icons = {
  water_point: createGlowIcon('sky-500'),
  healthcare: createGlowIcon('rose-500'),
  school: createGlowIcon('amber-500'),
  street_light: createGlowIcon('yellow-400')
};

// Component to dynamically fit map boundary when active settlement changes
const MapBoundsSetter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const GISMapContainer = ({ 
  settlements = [], 
  infrastructure = [], 
  activeSettlement = null,
  layersVisibility = {
    settlements: true,
    roads: true,
    water: true,
    schools: true,
    hospitals: true,
    drainage: true,
    lights: true
  },
  onMapClick = null
}) => {
  const center = activeSettlement 
    ? [activeSettlement.center[1], activeSettlement.center[0]] 
    : [-1.3133, 36.7888]; // default Kibera

  // Filter infrastructure by toggles
  const visibleInfra = infrastructure.filter(item => {
    if (item.type === 'road' && !layersVisibility.roads) return false;
    if (item.type === 'water_point' && !layersVisibility.water) return false;
    if (item.type === 'school' && !layersVisibility.schools) return false;
    if (item.type === 'healthcare' && !layersVisibility.hospitals) return false;
    if (item.type === 'drainage' && !layersVisibility.drainage) return false;
    if (item.type === 'street_light' && !layersVisibility.lights) return false;
    return true;
  });

  return (
    <div className="w-full h-full relative" style={{ minHeight: '450px' }}>
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={true}
        className="w-full h-full shadow-inner border border-slate-200 dark:border-slate-800"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="dark:invert dark:opacity-90 dark:hue-rotate-180" // Dark mode effect
        />
        
        <MapBoundsSetter center={center} />

        {/* 1. Settlements Boundaries */}
        {layersVisibility.settlements && settlements.map(settlement => {
          // GeoJSON polygon coordinate conversion: Leaflet requires [lat, lng] instead of [lng, lat]
          const leafletCoords = settlement.boundary.coordinates[0].map(coord => [coord[1], coord[0]]);
          const isActive = activeSettlement && activeSettlement._id === settlement._id;
          
          return (
            <Polygon
              key={settlement._id}
              positions={leafletCoords}
              pathOptions={{
                color: isActive ? '#0EA5E9' : '#94A3B8',
                fillColor: isActive ? '#0EA5E9' : '#64748B',
                fillOpacity: isActive ? 0.15 : 0.08,
                weight: isActive ? 3 : 1.5,
                dashArray: isActive ? '' : '5, 5'
              }}
            >
              <Popup>
                <div className="text-slate-800 p-1">
                  <h4 className="font-bold text-sm">{settlement.name}</h4>
                  <p className="text-xs">Pop: {settlement.population.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-sky-600">Infrastructure Gaps: {settlement.risk_indices.infrastructure_gap}%</p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 2. Infrastructure Layer */}
        {visibleInfra.map(item => {
          const geomType = item.coordinates.type;
          
          if (geomType === 'Point') {
            const coord = [item.coordinates.coordinates[1], item.coordinates.coordinates[0]];
            const icon = icons[item.type] || createGlowIcon('sky-500');
            
            return (
              <Marker key={item._id} position={coord} icon={icon}>
                <Popup>
                  <div className="text-slate-800 p-1">
                    <h5 className="font-bold text-xs capitalize">{item.type.replace('_', ' ')}</h5>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'functional' ? 'bg-green-100 text-green-800' :
                      item.status === 'damaged' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          } else if (geomType === 'LineString') {
            const coords = item.coordinates.coordinates.map(c => [c[1], c[0]]);
            const isRoad = item.type === 'road';
            
            return (
              <Polyline
                key={item._id}
                positions={coords}
                pathOptions={{
                  color: isRoad 
                    ? (item.status === 'functional' ? '#22C55E' : '#F59E0B') 
                    : '#EF4444', // Sewers/drainage
                  weight: isRoad ? 4 : 3.5,
                  dashArray: isRoad && item.status === 'damaged' ? '5,5' : '',
                  opacity: 0.85
                }}
              >
                <Popup>
                  <div className="text-slate-800 p-1">
                    <h5 className="font-bold text-xs capitalize">{item.type}</h5>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'functional' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </Popup>
              </Polyline>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

export default GISMapContainer;
