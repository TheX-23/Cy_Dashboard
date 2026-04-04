import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, AlertTriangle, Server, Zap } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils/cn';

interface KPIData {
  totalThreats: number;
  activeAlerts: number;
  openIncidents: number;
  systemHealth: number;
  rps: number;
}

interface KPICardsProps {
  data: KPIData;
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const { isDarkMode } = useTheme();
  
  // Defensive check for data
  if (!data) {
    return <div className="text-muted-foreground">Loading KPI data...</div>;
  }

  const kpiCards = [
    {
      title: 'Total Threats',
      value: (data.totalThreats || 0).toLocaleString(),
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: <Shield className="w-6 h-6" />,
      color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      bgColor: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50',
      borderColor: isDarkMode ? 'border-blue-500/30' : 'border-blue-200'
    },
    {
      title: 'Active Alerts',
      value: (data.activeAlerts || 0).toString(),
      change: '+3.2%',
      changeType: 'increase' as const,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: isDarkMode ? 'text-red-400' : 'text-red-600',
      bgColor: isDarkMode ? 'bg-red-500/20' : 'bg-red-50',
      borderColor: isDarkMode ? 'border-red-500/30' : 'border-red-200'
    },
    {
      title: 'Open Incidents',
      value: (data.openIncidents || 0).toString(),
      change: '-8.1%',
      changeType: 'decrease' as const,
      icon: <Activity className="w-6 h-6" />,
      color: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
      bgColor: isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-50',
      borderColor: isDarkMode ? 'border-yellow-500/30' : 'border-yellow-200'
    },
    {
      title: 'System Health',
      value: `${data.systemHealth || 0}%`,
      change: '+0.3%',
      changeType: 'increase' as const,
      icon: <Server className="w-6 h-6" />,
      color: isDarkMode ? 'text-green-400' : 'text-green-600',
      bgColor: isDarkMode ? 'bg-green-500/20' : 'bg-green-50',
      borderColor: isDarkMode ? 'border-green-500/30' : 'border-green-200'
    },
    {
      title: 'Requests/sec',
      value: (data.rps || 0).toLocaleString(),
      change: '+18.7%',
      changeType: 'increase' as const,
      icon: <Zap className="w-6 h-6" />,
      color: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      bgColor: isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50',
      borderColor: isDarkMode ? 'border-purple-500/30' : 'border-purple-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            "p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
            isDarkMode 
              ? "bg-[#111827] border border-gray-700" 
              : "bg-white border border-gray-200"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor} ${card.borderColor} border`}>
              <div className={card.color}>
                {card.icon}
              </div>
            </div>
            <div className={`text-sm font-medium ${
              card.changeType === 'increase' 
                ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                : (isDarkMode ? 'text-red-400' : 'text-red-600')
            }`}>
              {card.change}
            </div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {card.title}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default KPICards;
