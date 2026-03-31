// src/components/TradingChart.jsx - Real-time Binance WebSocket Feed (EUR & BTC)
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';

export default function TradingChart({ 
  pair = "EURUSD", 
  height = 420, 
  theme = "dark" 
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const wsRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);

  const symbolName = pair === "BTCUSD" ? "BTC/USDT" : "EUR/USD";
  const isBTC = pair === "BTCUSD";
  const binanceSymbol = isBTC ? "btcusdt" : "eurusdt";   // Binance uses lowercase + USDT for EUR too

  const chartOptions = useMemo(() => ({
    width: chartContainerRef.current?.clientWidth || 900,
    height: height,
    layout: {
      backgroundColor: theme === 'dark' ? '#020408' : '#ffffff',
      textColor: theme === 'dark' ? '#d1d5db' : '#111111',
    },
    grid: {
      vertLines: { color: '#2a2a2a' },
      horzLines: { color: '#2a2a2a' },
    },
    crosshair: { mode: CrosshairMode.Normal },
    rightPriceScale: { borderColor: '#2a2a2a' },
    timeScale: {
      borderColor: '#2a2a2a',
      timeVisible: true,
      secondsVisible: false,
    },
  }), [height, theme]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const series = isBTC 
      ? chart.addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        })
      : chart.addLineSeries({
          color: '#eab308',
          lineWidth: 2,
        });

    seriesRef.current = series;

    // Connect to Binance WebSocket
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_1m`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Connected to Binance ${symbolName} stream`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      const kline = response.k; // kline data

      if (kline && seriesRef.current) {
        const candle = {
          time: Math.floor(kline.t / 1000), // Unix timestamp in seconds
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
        };

        if (isBTC) {
          seriesRef.current.update(candle);
        } else {
          // For EUR/USD we use line series (close price)
          seriesRef.current.update({ time: candle.time, value: candle.close });
        }
      }
    };

    ws.onclose = () => {
      console.log(`[WS] Disconnected from ${symbolName}`);
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error(`[WS Error] ${symbolName}`, err);
      setIsConnected(false);
    };

    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [pair, height, chartOptions, isBTC, binanceSymbol, symbolName]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black uppercase tracking-widest">
            {symbolName} Live Chart
          </h2>
          <p className="text-xs text-gray-500">Real-time • 1m candles • Binance Feed</p>
        </div>
        <div className={`px-3 py-1 text-xs font-mono rounded-full ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {isConnected ? 'LIVE' : 'DISCONNECTED'}
        </div>
      </div>

      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
