"use client";

import { useState, useEffect, useMemo } from 'react';
import ThreatMap from "@/components/maps/ThreatMap";

interface Threat {
  id: string;
  ip: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  timestamp: number;
}

interface AttackLine {
  id: string;
  from: [number, number];
  to: [number, number];
  severity: string;
}

const ATTACK_TYPES = [
  'SQL Injection', 'XSS Attack', 'DDoS Attack', 'Brute Force', 
  'Malware', 'Phishing', 'Ransomware', 'Zero-day Exploit',
  'APT Attack', 'Botnet Activity', 'Port Scanning', 'Data Breach'
];

const COUNTRIES = [
  { name: 'United States', lat: 40.7128, lng: -74.0060, city: 'New York' },
  { name: 'Russia', lat: 55.7558, lng: 37.6173, city: 'Moscow' },
  { name: 'China', lat: 39.9042, lng: 116.4074, city: 'Beijing' },
  { name: 'North Korea', lat: 39.0392, lng: 125.7625, city: 'Pyongyang' },
  { name: 'Iran', lat: 35.6961, lng: 51.4231, city: 'Tehran' },
  { name: 'Germany', lat: 52.5200, lng: 13.4050, city: 'Berlin' },
  { name: 'United Kingdom', lat: 51.5074, lng: -0.1278, city: 'London' },
  { name: 'France', lat: 48.8566, lng: 2.3522, city: 'Paris' },
  { name: 'Japan', lat: 35.6762, lng: 139.6503, city: 'Tokyo' },
  { name: 'South Korea', lat: 37.5665, lng: 126.9780, city: 'Seoul' },
  { name: 'India', lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
  { name: 'Brazil', lat: -23.5505, lng: -46.6333, city: 'São Paulo' },
  { name: 'Australia', lat: -33.8688, lng: 151.2093, city: 'Sydney' },
  { name: 'Canada', lat: 43.6532, lng: -79.3832, city: 'Toronto' },
  { name: 'Israel', lat: 31.7683, lng: 35.2137, city: 'Tel Aviv' }
];

export default function IntelPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [attackLines, setAttackLines] = useState<AttackLine[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Generate random IP address
  const generateRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  // Generate random threat
  const generateThreat = (): Threat => {
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const severity = ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as Threat['severity'];
    const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    
    return {
      id: `threat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ip: generateRandomIP(),
      lat: country.lat + (Math.random() - 0.5) * 5, // Add some randomness
      lng: country.lng + (Math.random() - 0.5) * 5,
      country: country.name,
      city: country.city,
      type,
      severity,
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };
  };

  // Simulate live threat data
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newThreat = generateThreat();
      
      setThreats(prev => {
        const updated = [newThreat, ...prev.slice(0, 49)]; // Keep only last 50
        return updated;
      });

      // Occasionally create attack lines between threats
      if (Math.random() > 0.7 && threats.length > 1) {
        const recentThreats = threats.slice(0, 3);
        if (recentThreats.length >= 2) {
          const from = recentThreats[0];
          const to = recentThreats[Math.floor(Math.random() * (recentThreats.length - 1)) + 1];
          
          const newLine: AttackLine = {
            id: `line-${Date.now()}`,
            from: [from.lat, from.lng],
            to: [to.lat, to.lng],
            severity: newThreat.severity
          };
          
          setAttackLines(prev => [...prev.slice(0, 19), newLine]); // Keep only last 20
        }
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isLive, threats.length]);

  // Calculate AI insights
  const insights = useMemo(() => {
    if (threats.length === 0) {
      return {
        mostFrequentAttack: 'No data',
        mostAttackedCountry: 'No data',
        trend: 'Waiting for threat data...'
      };
    }

    const attackCounts = threats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryCounts = threats.reduce((acc, threat) => {
      acc[threat.country] = (acc[threat.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentAttack = Object.entries(attackCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    const mostAttackedCountry = Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    const recentCritical = threats.filter(t => t.severity === 'critical').length;
    const trend = recentCritical > 5 
      ? `⚠️ Critical spike: ${recentCritical} critical attacks detected`
      : recentCritical > 2
      ? `🔴 Elevated threat level: ${recentCritical} critical attacks`
      : `📊 Monitoring ${threats.length} active threats`;

    return {
      mostFrequentAttack,
      mostAttackedCountry,
      trend
    };
  }, [threats]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Threat Intelligence Dashboard</h1>
          <p className="text-muted-foreground">Real-time cyber attack monitoring and analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isLive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        {/* Attack Map - col-span-7 */}
        <div className="col-span-7">
          <div className="bg-card border border-border rounded-xl p-4 h-[600px] transition-theme">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Global Attack Map</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span>Critical</span>
                <div className="w-2 h-2 bg-orange-400 rounded-full ml-2"></div>
                <span>High</span>
                <div className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></div>
                <span>Medium</span>
                <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                <span>Low</span>
              </div>
            </div>
            <div className="h-[520px] rounded-lg overflow-hidden">
              <ThreatMap threats={threats} attackLines={attackLines} />
            </div>
          </div>
        </div>

        {/* Live Feed Panel - col-span-5 */}
        <div className="col-span-5">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-[600px] transition-theme">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Threat Feed</h3>
              <div className="text-sm text-gray-400">
                {threats.length} active threats
              </div>
            </div>
            <div className="h-[520px] overflow-y-auto space-y-2">
              {threats.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p>Waiting for threat data...</p>
                  {isLive && <p className="text-sm text-gray-600 mt-1">Monitoring global threats</p>}
                </div>
              ) : (
                threats.map((threat) => (
                  <div
                    key={threat.id}
                    className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                            {threat.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">{threat.time}</span>
                        </div>
                        <h4 className="text-white font-medium text-sm">{threat.type}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{threat.ip}</span>
                          <span>•</span>
                          <span>{threat.city}, {threat.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Panel - col-span-12 */}
        <div className="col-span-12">
          <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-theme">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Threat Insights</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Most Frequent Attack</div>
                <div className="text-lg font-semibold text-orange-400">{insights.mostFrequentAttack}</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Most Attacked Country</div>
                <div className="text-lg font-semibold text-red-400">{insights.mostAttackedCountry}</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Active Threats</div>
                <div className="text-lg font-semibold text-yellow-400">{threats.length}</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Critical Attacks</div>
                <div className="text-lg font-semibold text-red-400">
                  {threats.filter(t => t.severity === 'critical').length}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <p className="text-blue-400 font-medium">{insights.trend}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
