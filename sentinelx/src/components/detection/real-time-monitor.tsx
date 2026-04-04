"use client";

import { useState, useEffect } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { AlertTriangle, Shield, Activity, Clock, Globe, User, Target } from 'lucide-react';
import { DetectionEvent } from '@/types/detection';
import { cn } from '@/lib/utils/cn';

interface RealTimeMonitorProps {
  events: DetectionEvent[];
  isLiveStreaming: boolean;
}

export function RealTimeMonitor({ events, isLiveStreaming }: RealTimeMonitorProps) {
  const [recentEvents, setRecentEvents] = useState<DetectionEvent[]>([]);

  useEffect(() => {
    // Show only last 10 events for real-time monitoring
    setRecentEvents(events.slice(0, 10));
  }, [events]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/20 neon-pulse';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />;
      case 'HIGH': return <Shield className="h-4 w-4" />;
      case 'MEDIUM': return <Activity className="h-4 w-4" />;
      case 'LOW': return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (recentEvents.length === 0) {
    return (
      <div className="glass-neon rounded-xl border border-green-500/30 p-6">
        <div className="text-center text-slate-400">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No Detection Events</p>
          <p className="text-sm">Detection engine is waiting for events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-neon rounded-xl border border-green-500/30 overflow-hidden">
      {/* Header */}
      <div className="border-b border-green-500/20 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-green-400">Real-Time Detection Monitor</h3>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isLiveStreaming ? "bg-green-400 animate-pulse" : "bg-slate-400"
            )}></div>
            <span className="text-sm text-slate-400">
              {isLiveStreaming ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-h-96 overflow-y-auto">
        {recentEvents.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "border-b border-green-500/10 p-4 transition-all duration-300",
              index === 0 && "bg-green-500/5"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Severity Indicator */}
              <div className="flex-shrink-0">
                {getSeverityIcon(event.severity)}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                    getSeverityColor(event.severity)
                  )}>
                    {event.severity}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>Risk: {event.riskScore}</span>
                    <span>•</span>
                    <span>{formatDistanceToNowStrict(event.timestamp, { addSuffix: true })}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Rule Name */}
                  <div>
                    <span className="text-sm font-medium text-white">{event.ruleName}</span>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs text-slate-300">{event.description}</p>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {event.ipAddress && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-400">IP:</span>
                        <span className="text-white font-mono">{event.ipAddress}</span>
                      </div>
                    )}
                    
                    {event.userId && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-400">User:</span>
                        <span className="text-white">{event.userId}</span>
                      </div>
                    )}
                    
                    {event.endpoint && (
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-400">Endpoint:</span>
                        <span className="text-white font-mono">{event.endpoint}</span>
                      </div>
                    )}
                  </div>

                  {/* Matched Conditions */}
                  {event.matchedConditions && event.matchedConditions.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-slate-400">Triggered by:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.matchedConditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-black/50 text-green-400 border border-green-500/30 rounded text-xs"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payload Preview */}
                  {event.payload && (
                    <div className="mt-2">
                      <details className="group">
                        <summary className="cursor-pointer text-xs text-green-400 hover:text-green-300 transition-colors">
                          View Payload Details
                        </summary>
                        <div className="mt-2 p-3 bg-black/50 border border-green-500/20 rounded-lg">
                          <pre className="text-xs text-green-400 overflow-x-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-green-500/20 p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <span className="text-slate-400">Total Events</span>
            <p className="text-lg font-bold text-white">{recentEvents.length}</p>
          </div>
          <div className="text-center">
            <span className="text-slate-400">Critical Events</span>
            <p className="text-lg font-bold text-red-400">
              {recentEvents.filter(e => e.severity === 'CRITICAL').length}
            </p>
          </div>
          <div className="text-center">
            <span className="text-slate-400">Avg Risk Score</span>
            <p className="text-lg font-bold text-orange-400">
              {recentEvents.length > 0 
                ? (recentEvents.reduce((sum, e) => sum + e.riskScore, 0) / recentEvents.length).toFixed(1)
                : '0'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
