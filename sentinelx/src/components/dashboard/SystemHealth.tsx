import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Wifi, Server, Clock } from 'lucide-react';

interface SystemHealthData {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
}

interface SystemHealthProps {
  data: SystemHealthData;
  /** wide: 4-column metrics + paired footer row (full-width dashboard band) */
  layout?: "default" | "wide";
}

export const SystemHealth: React.FC<SystemHealthProps> = React.memo(({ data, layout = "default" }) => {
  const wide = layout === "wide";
  const metrics = [
    {
      name: 'CPU',
      value: data.cpu,
      icon: <Cpu className="w-5 h-5" />,
      color: data.cpu > 80 ? 'text-red-600 dark:text-red-400' : data.cpu > 60 ? 'text-amber-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Memory',
      value: data.memory,
      icon: <Server className="w-5 h-5" />,
      color: data.memory > 80 ? 'text-red-600 dark:text-red-400' : data.memory > 60 ? 'text-amber-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Disk',
      value: data.disk,
      icon: <HardDrive className="w-5 h-5" />,
      color: data.disk > 80 ? 'text-red-600 dark:text-red-400' : data.disk > 60 ? 'text-amber-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
    },
    {
      name: 'Network',
      value: data.network,
      icon: <Wifi className="w-5 h-5" />,
      color: data.network > 80 ? 'text-red-600 dark:text-red-400' : data.network > 60 ? 'text-amber-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
    }
  ];

  const getProgressBarColor = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const metricGridClass = wide
    ? "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4"
    : "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3";

  const metricCardClass = wide
    ? "min-w-0 rounded-lg border border-border bg-card text-card-foreground p-3 lg:p-4"
    : "min-w-0 rounded-lg border border-border bg-card text-card-foreground p-2.5 sm:p-3";

  return (
    <div className="min-w-0 space-y-4">
      <div className={metricGridClass}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className={metricCardClass}
          >
            <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className={`shrink-0 ${metric.color}`}>
                  {metric.icon}
                </div>
                <span className={`truncate text-foreground ${wide ? "text-sm font-medium" : "text-xs sm:text-sm"}`}>
                  {metric.name}
                </span>
              </div>
              <span
                className={`shrink-0 font-medium tabular-nums text-foreground ${wide ? "text-sm" : "text-xs sm:text-sm"}`}
              >
                {metric.value ?? 0}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value ?? 0}%` }}
                transition={{ duration: 1, delay: index * 0.08 }}
                className={`h-2 rounded-full ${getProgressBarColor(metric.value ?? 0)}`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className={wide ? "grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4" : "space-y-3"}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className={`rounded-lg border border-border bg-card text-card-foreground ${wide ? "flex min-h-[88px] items-center p-4 lg:p-5" : "p-4"}`}
        >
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-foreground">System Uptime</span>
            </div>
            <span className="text-sm font-semibold tabular-nums text-green-600 dark:text-green-400">
              {data.uptime}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.42 }}
          className={`rounded-lg border border-green-500/25 bg-card text-card-foreground bg-gradient-to-r from-green-500/15 to-blue-500/15 dark:border-green-500/30 dark:from-green-500/20 dark:to-blue-500/20 ${wide ? "flex min-h-[88px] items-center p-4 lg:p-5" : "p-4"}`}
        >
          <div className="flex w-full items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-foreground">Overall Health</div>
              <div className="text-xs text-muted-foreground">System operating normally</div>
            </div>
            <div className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400 sm:text-3xl">
              {Math.round((100 - (data.cpu + data.memory + data.disk + data.network) / 4))}%
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

export default SystemHealth;
