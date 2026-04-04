import { z } from "zod";

export const ingestLogSchema = z.object({
  logs: z.array(
    z.object({
      ip: z.ipv4(),
      timestamp: z.string().datetime(),
      type: z.string().min(1),
      severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      rawData: z.record(z.string(), z.unknown()).default({}),
    }),
  ),
});

export const parseLogSchema = z.object({
  payload: z.string().min(3),
  format: z.enum(["json", "csv"]),
});

export const alertCreateSchema = z.object({
  threatId: z.string().uuid(),
  status: z.enum(["open", "investigating", "resolved"]),
  assignedTo: z.string().uuid().nullable(),
});

export const incidentCreateSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  status: z.enum(["new", "active", "contained", "resolved"]).default("new"),
});
