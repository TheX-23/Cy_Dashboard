import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface Incident {
  id: number;
  title: string;
  status: 'active' | 'investigating' | 'contained' | 'resolved';
  severity: 'critical' | 'high' | 'medium' | 'low';
  time: string;
}

interface IncidentsListProps {
  incidents: Incident[];
}

export const IncidentsList: React.FC<IncidentsListProps> = ({ incidents }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 dark:text-red-400';
      case 'investigating': return 'text-amber-600 dark:text-yellow-400';
      case 'contained': return 'text-blue-600 dark:text-blue-400';
      case 'resolved': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertCircle className="w-4 h-4" />;
      case 'investigating': return <Clock className="w-4 h-4" />;
      case 'contained': return <Shield className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/20';
      case 'high': return 'bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 border-green-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {incidents.map((incident, index) => (
        <motion.div
          key={incident.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-accent/70 dark:hover:bg-gray-800/80 ${getSeverityColor(incident.severity)}`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 mt-1 ${getStatusColor(incident.status)}`}>
              {getStatusIcon(incident.status)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="mb-1 truncate text-sm font-medium text-foreground">
                {incident.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="capitalize">{incident.status}</span>
                <span>{incident.time}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {incidents.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No incidents at this time</p>
        </div>
      )}
    </div>
  );
};

export default IncidentsList;
