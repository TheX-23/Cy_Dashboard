"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ThreatLocation {
  id: string;
  ip: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
}

export default function RealMap() {
  const [mounted, setMounted] = useState(false);
  const [threats, setThreats] = useState<ThreatLocation[]>([]);

  // Mock threat data with real-world coordinates
  const mockThreatData: ThreatLocation[] = [
    {
      id: '1',
      ip: '8.8.8.8',
      lat: 37.4056,
      lng: -122.0775,
      city: 'Mountain View',
      country: 'United States',
      severity: 'low',
      type: 'Port Scan'
    },
    {
      id: '2',
      ip: '1.1.1.1',
      lat: -33.8688,
      lng: 151.2093,
      city: 'Sydney',
      country: 'Australia',
      severity: 'medium',
      type: 'DDoS Attack'
    },
    {
      id: '3',
      ip: '208.67.222.222',
      lat: 37.7749,
      lng: -122.4194,
      city: 'San Francisco',
      country: 'United States',
      severity: 'high',
      type: 'SQL Injection'
    },
    {
      id: '4',
      ip: '9.9.9.9',
      lat: 52.5200,
      lng: 13.4050,
      city: 'Berlin',
      country: 'Germany',
      severity: 'critical',
      type: 'Ransomware'
    },
    {
      id: '5',
      ip: '149.112.112.112',
      lat: 40.7128,
      lng: -74.0060,
      city: 'New York',
      country: 'United States',
      severity: 'medium',
      type: 'Phishing'
    }
  ];

  useEffect(() => {
    setMounted(true);
    
    // Simulate loading and use mock data
    const loadThreatData = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setThreats(mockThreatData);
      } catch (error) {
        console.error('Error loading threat data:', error);
      }
    };

    loadThreatData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const createCustomIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      className: 'custom-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Threat markers */}
      {threats.map((threat) => (
        <Marker
          key={threat.id}
          position={[threat.lat, threat.lng]}
          icon={createCustomIcon(threat.severity)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h4 className="font-semibold text-sm mb-1">{threat.type}</h4>
              <p className="text-xs text-gray-600 mb-1">IP: {threat.ip}</p>
              <p className="text-xs text-gray-600 mb-1">
                Location: {threat.city}, {threat.country}
              </p>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${getSeverityColor(threat.severity)}20`,
                    color: getSeverityColor(threat.severity)
                  }}
                >
                  {threat.severity.toUpperCase()}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
