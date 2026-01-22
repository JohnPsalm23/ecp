/**
 * Application Metrics Collection
 * 
 * Collects and exposes metrics for monitoring dashboards
 */

import { logger } from './logger';

interface MetricPoint {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  help: string;
  points: MetricPoint[];
}

class MetricsCollector {
  private metrics = new Map<string, Metric>();
  private histogramBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1, labels?: Record<string, string>) {
    const metric = this.getOrCreateMetric(name, 'counter', '');
    metric.points.push({
      value,
      timestamp: Date.now(),
      labels,
    });
  }

  /**
   * Set a gauge value
   */
  gauge(name: string, value: number, labels?: Record<string, string>) {
    const metric = this.getOrCreateMetric(name, 'gauge', '');
    // For gauges, we replace the latest value
    const key = this.labelKey(labels);
    const existingIndex = metric.points.findIndex(
      p => this.labelKey(p.labels) === key
    );
    
    if (existingIndex >= 0) {
      metric.points[existingIndex] = { value, timestamp: Date.now(), labels };
    } else {
      metric.points.push({ value, timestamp: Date.now(), labels });
    }
  }

  /**
   * Record a histogram observation
   */
  histogram(name: string, value: number, labels?: Record<string, string>) {
    const metric = this.getOrCreateMetric(name, 'histogram', '');
    metric.points.push({
      value,
      timestamp: Date.now(),
      labels,
    });
  }

  /**
   * Create a timer for measuring duration
   */
  timer(name: string, labels?: Record<string, string>): () => void {
    const start = performance.now();
    return () => {
      const duration = (performance.now() - start) / 1000; // Convert to seconds
      this.histogram(name, duration, labels);
    };
  }

  private getOrCreateMetric(
    name: string,
    type: Metric['type'],
    help: string
  ): Metric {
    let metric = this.metrics.get(name);
    
    if (!metric) {
      metric = { name, type, help, points: [] };
      this.metrics.set(name, metric);
    }
    
    return metric;
  }

  private labelKey(labels?: Record<string, string>): string {
    if (!labels) return '';
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
  }

  /**
   * Get all metrics in Prometheus format
   */
  toPrometheus(): string {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      for (const point of metric.points) {
        const labels = point.labels ? `{${this.labelKey(point.labels)}}` : '';
        lines.push(`${metric.name}${labels} ${point.value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Get all metrics as JSON
   */
  toJSON(): Record<string, Metric> {
    const result: Record<string, Metric> = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = metric;
    }
    return result;
  }

  /**
   * Clear old points (for memory management)
   */
  cleanup(maxAgeMs: number = 3600000) {
    const cutoff = Date.now() - maxAgeMs;
    
    for (const metric of this.metrics.values()) {
      if (metric.type !== 'gauge') {
        metric.points = metric.points.filter(p => p.timestamp >= cutoff);
      }
    }
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Periodic cleanup
setInterval(() => metrics.cleanup(), 300000); // Every 5 minutes

/**
 * Pre-defined application metrics
 */
export const appMetrics = {
  // HTTP metrics
  httpRequestsTotal: (method: string, path: string, status: number) =>
    metrics.increment('http_requests_total', 1, { method, path, status: String(status) }),
  
  httpRequestDuration: (method: string, path: string) =>
    metrics.timer('http_request_duration_seconds', { method, path }),

  // Database metrics
  dbQueryDuration: (operation: string, table: string) =>
    metrics.timer('db_query_duration_seconds', { operation, table }),
  
  dbConnectionsActive: (count: number) =>
    metrics.gauge('db_connections_active', count),

  // Business metrics
  ordersCreated: (marketId: string) =>
    metrics.increment('orders_created_total', 1, { market_id: marketId }),
  
  ordersCompleted: (marketId: string) =>
    metrics.increment('orders_completed_total', 1, { market_id: marketId }),
  
  qcJobsProcessed: (result: 'passed' | 'failed' | 'warning') =>
    metrics.increment('qc_jobs_processed_total', 1, { result }),
  
  qcScore: (score: number, marketId: string) =>
    metrics.histogram('qc_score', score, { market_id: marketId }),

  // AI metrics
  aiRequestsTotal: (model: string, operation: string) =>
    metrics.increment('ai_requests_total', 1, { model, operation }),
  
  aiRequestDuration: (model: string, operation: string) =>
    metrics.timer('ai_request_duration_seconds', { model, operation }),
  
  aiTokensUsed: (model: string, tokens: number) =>
    metrics.increment('ai_tokens_used_total', tokens, { model }),

  // External service metrics
  stripeRequestsTotal: (operation: string, success: boolean) =>
    metrics.increment('stripe_requests_total', 1, { 
      operation, 
      success: String(success) 
    }),
  
  webhookDeliveries: (event: string, success: boolean) =>
    metrics.increment('webhook_deliveries_total', 1, { 
      event, 
      success: String(success) 
    }),

  // Cache metrics
  cacheHits: (key: string) =>
    metrics.increment('cache_hits_total', 1, { key_prefix: key.split(':')[0] }),
  
  cacheMisses: (key: string) =>
    metrics.increment('cache_misses_total', 1, { key_prefix: key.split(':')[0] }),
};
