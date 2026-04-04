import type { Threat } from "@/types/security";

export const kpis = [
  { title: "Active Threats", value: "128", delta: "+12%", tone: "danger" },
  { title: "Open Incidents", value: "42", delta: "+4%", tone: "warning" },
  { title: "Alerts/Hour", value: "1,284", delta: "-3%", tone: "neutral" },
  { title: "Risk Score", value: "74/100", delta: "+6%", tone: "danger" },
] as const;

export const threatSeries = [
  { time: "00:00", threats: 12, mitigated: 8 },
  { time: "04:00", threats: 30, mitigated: 20 },
  { time: "08:00", threats: 55, mitigated: 31 },
  { time: "12:00", threats: 80, mitigated: 44 },
  { time: "16:00", threats: 63, mitigated: 58 },
  { time: "20:00", threats: 48, mitigated: 36 },
];

export const liveFeed: Threat[] = [
  {
    id: "c50ef8d6-f5f5-44ae-a016-6ac3ffd20a98",
    severity: "CRITICAL",
    score: 95,
    sourceIp: "185.221.87.14",
    location: "RU",
    vector: "Brute Force",
    detectedAt: new Date().toISOString(),
  },
  {
    id: "ffadf95c-f62f-4cd9-bf3c-f4140dce6f4f",
    severity: "HIGH",
    score: 81,
    sourceIp: "43.229.53.201",
    location: "CN",
    vector: "Suspicious IP",
    detectedAt: new Date(Date.now() - 120_000).toISOString(),
  },
  {
    id: "274f25be-8ef9-4f95-9bca-212f7be16b26",
    severity: "MEDIUM",
    score: 63,
    sourceIp: "77.91.72.103",
    location: "IR",
    vector: "Impossible Travel",
    detectedAt: new Date(Date.now() - 320_000).toISOString(),
  },
];
