import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, AlertTriangle } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  time: string;
  url: string;
  severity: 'high' | 'medium' | 'low';
}

export const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Mock news data
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Critical RCE Vulnerability Found in Popular Web Framework',
        summary: 'Security researchers discover remote code execution vulnerability affecting millions of websites',
        source: 'CyberSecurity News',
        time: '2 hours ago',
        url: '#',
        severity: 'high'
      },
      {
        id: '2',
        title: 'New APT Group Targeting Financial Institutions',
        summary: 'Sophisticated attack campaign detected targeting banking sector across multiple countries',
        source: 'Threat Intelligence',
        time: '4 hours ago',
        url: '#',
        severity: 'high'
      },
      {
        id: '3',
        title: 'Ransomware Gang Demands $10M Payment from Tech Company',
        summary: 'Major technology firm hit by double extortion ransomware attack',
        source: 'Security Week',
        time: '6 hours ago',
        url: '#',
        severity: 'medium'
      },
      {
        id: '4',
        title: 'Zero-Day Exploit Used in Targeted Attacks',
        summary: 'Previously unknown vulnerability being exploited in the wild',
        source: 'Zero Day Initiative',
        time: '8 hours ago',
        url: '#',
        severity: 'high'
      },
      {
        id: '5',
        title: 'Phishing Campaign Impersonates Cloud Providers',
        summary: 'Attackers sending sophisticated phishing emails claiming to be from major cloud services',
        source: 'PhishTank',
        time: '12 hours ago',
        url: '#',
        severity: 'medium'
      }
    ];
    setNews(mockNews);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'high' ? <AlertTriangle className="w-3 h-3" /> : null;
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {news.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`p-3 rounded-lg border ${getSeverityColor(item.severity)} hover:opacity-80 transition-opacity cursor-pointer`}
          onClick={() => window.open(item.url, '_blank')}
        >
          <div className="flex items-start gap-2 mb-2">
            {getSeverityIcon(item.severity)}
            <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">
              {item.title}
            </h4>
          </div>
          
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">
            {item.summary}
          </p>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.time}</span>
            </div>
            <ExternalLink className="w-3 h-3" />
          </div>
        </motion.div>
      ))}
      
      {news.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No news available</p>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
