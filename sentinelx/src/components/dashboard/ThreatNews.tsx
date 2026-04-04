import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, AlertTriangle, Shield, Bug, Zap, Target } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  url: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export const ThreatNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

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
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          Threat Intelligence News
        </h3>
        <div className="flex items-center gap-1 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Scrollable News List */}
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
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
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${getSeverityColor(item.severity)}`}
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
            <h4 className="text-sm font-medium text-white mb-2 line-clamp-2 leading-tight">
              {item.title}
            </h4>

            {/* Summary */}
            <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
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
                  className="text-slate-400 hover:text-white transition-colors"
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
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No threat intelligence available</p>
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
      `}</style>
    </div>
  );
};

export default ThreatNews;
