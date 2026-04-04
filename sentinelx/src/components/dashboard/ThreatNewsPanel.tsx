import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Clock, AlertTriangle, Shield, Bug, Zap, Target } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  url: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ThreatNewsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatNewsPanel: React.FC<ThreatNewsPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Mock threat intelligence news data
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Critical RCE Vulnerability Found in Apache Struts',
        summary: 'Remote code execution vulnerability (CVE-2024-1234) affects millions of enterprise applications worldwide',
        source: 'CVE Database',
        time: '2 hours ago',
        url: '#',
        severity: 'critical'
      },
      {
        id: '2',
        title: 'New APT Group "DragonFly" Targeting Healthcare',
        summary: 'Sophisticated attack campaign detected targeting healthcare sector with ransomware and data exfiltration',
        source: 'Threat Intelligence',
        time: '4 hours ago',
        url: '#',
        severity: 'high'
      },
      {
        id: '3',
        title: 'Zero-Day Exploit in Windows Kernel',
        summary: 'Privilege escalation vulnerability discovered in Windows 11 kernel components',
        source: 'Security Week',
        time: '6 hours ago',
        url: '#',
        severity: 'high'
      },
      {
        id: '4',
        title: 'Ransomware Gang Demands $15M from Tech Giant',
        summary: 'Major technology firm hit by double extortion ransomware attack affecting customer data',
        source: 'Cyber Daily',
        time: '8 hours ago',
        url: '#',
        severity: 'medium'
      },
      {
        id: '5',
        title: 'Phishing Campaign Targets Financial Institutions',
        summary: 'Large-scale phishing operation discovered targeting banks across Europe and North America',
        source: 'Fraud Watch',
        time: '12 hours ago',
        url: '#',
        severity: 'medium'
      },
      {
        id: '6',
        title: 'IoT Botnet "Mirai Variant" Resurfaces',
        summary: 'New variant of infamous Mirai botnet discovered targeting smart home devices',
        source: 'IoT Security',
        time: '1 day ago',
        url: '#',
        severity: 'low'
      },
      {
        id: '7',
        title: 'Supply Chain Attack in Popular Software Library',
        summary: 'Malicious code discovered in widely used JavaScript package affecting thousands of applications',
        source: 'DevSecOps',
        time: '1 day ago',
        url: '#',
        severity: 'high'
      },
      {
        id: '8',
        title: 'Critical Bug in OpenSSL Library',
        summary: 'Buffer overflow vulnerability could allow remote code execution in TLS connections',
        source: 'Crypto News',
        time: '2 days ago',
        url: '#',
        severity: 'critical'
      }
    ];

    setNews(mockNews);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newUpdate: NewsItem = {
        id: Date.now().toString(),
        title: 'Breaking: New Security Alert Detected',
        summary: 'Automated threat detection system has identified a potential security incident',
        source: 'SOC Alert System',
        time: 'Just now',
        url: '#',
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any
      };
      
      setNews(prev => [newUpdate, ...prev.slice(0, 7)]);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 border-red-500/30 bg-red-500/10';
      case 'high': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      default: return 'text-slate-500 border-slate-500/30 bg-slate-500/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Shield className="w-4 h-4" />;
      case 'medium': return <Bug className="w-4 h-4" />;
      case 'low': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ translateX: '100%', opacity: 0 }}
          animate={{ translateX: 0, opacity: 1 }}
          exit={{ translateX: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-16 right-4 w-[360px] max-h-[600px] bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-[99999] threat-panel transition-theme"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Threat Intelligence</h3>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Live</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable News List */}
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ${getSeverityColor(item.severity)}`}
              >
                {/* Severity Indicator */}
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityIcon(item.severity)}
                  <span className={`text-xs font-medium capitalize ${item.severity === 'critical' ? 'text-red-400' : item.severity === 'high' ? 'text-orange-400' : item.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {item.severity}
                  </span>
                  {item.time === 'Just now' && (
                    <span className="text-xs text-green-400 animate-pulse">NEW</span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                  {item.title}
                </h4>

                {/* Summary */}
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                  
                  {item.url && (
                    <a
                      href={item.url}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {news.length === 0 && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">No threat intelligence available</p>
              </div>
            )}
          </div>

          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 3px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
            
            /* Ensure panel is always on top */
            .threat-panel {
              position: fixed !important;
              z-index: 99999 !important;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThreatNewsPanel;
