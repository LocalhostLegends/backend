import { Injectable, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new Registry();

  readonly httpRequestsTotal = new Counter({
    name: 'hrtech_backend_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status_code'],
    registers: [this.registry],
  });

  readonly httpErrorsTotal = new Counter({
    name: 'hrtech_backend_http_errors_total',
    help: 'Total number of HTTP error responses',
    labelNames: ['method', 'path', 'status_code'],
    registers: [this.registry],
  });

  readonly httpRequestDurationSeconds = new Histogram({
    name: 'hrtech_backend_http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [this.registry],
  });

  onModuleInit(): void {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'hrtech_backend_',
    });
  }

  recordHttpRequest(input: {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
  }): void {
    const labels = {
      method: input.method,
      path: input.path,
      status_code: String(input.statusCode),
    };

    this.httpRequestsTotal.inc(labels);

    this.httpRequestDurationSeconds.observe(labels, input.durationMs / 1000);

    if (input.statusCode >= 400) {
      this.httpErrorsTotal.inc(labels);
    }
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
