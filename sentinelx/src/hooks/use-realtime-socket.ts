"use client";

import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "@/types/security";

interface UseRealtimeSocketOptions {
  endpoint: string;
  onEvent: (event: RealtimeEvent) => void;
}

export function useRealtimeSocket({ endpoint, onEvent }: UseRealtimeSocketOptions) {
  const onEventRef = useRef(onEvent);
  const retryRef = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let active = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const toWsUrl = (path: string) => {
      const base = process.env.NEXT_PUBLIC_DETECTION_ENGINE_WS_URL;
      if (base) {
        return `${base.replace(/\/$/, "")}${path}`;
      }
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.hostname}:8001${path}`;
    };

    const connect = () => {
      if (!active) return;
      const socket = new WebSocket(toWsUrl(endpoint));
      socketRef.current = socket;

      socket.onopen = () => {
        retryRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as RealtimeEvent;
          onEventRef.current(parsed);
        } catch {
          // Ignore malformed messages to keep the stream resilient.
        }
      };

      socket.onclose = () => {
        if (!active) return;
        const delay = Math.min(10_000, 1000 * 2 ** retryRef.current);
        retryRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [endpoint]);
}
