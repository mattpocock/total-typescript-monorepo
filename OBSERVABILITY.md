# OpenTelemetry Observability for Total TypeScript Internal CLI

This repository includes a complete observability stack for tracing Effect applications using OpenTelemetry. The setup provides distributed tracing capabilities to monitor and debug the internal CLI operations.

## Overview

The observability stack includes:

- **OpenTelemetry Collector**: Receives and processes telemetry data
- **Jaeger**: Distributed tracing visualization
- **Prometheus**: Metrics collection and storage
- **Grafana**: Unified dashboard for metrics and traces
- **Tempo**: Distributed tracing backend
- **Loki**: Log aggregation

All components are bundled in the `grafana/otel-lgtm` Docker image for easy deployment.

## Quick Start

### 1. Start the Observability Stack

```bash
# Using Docker Compose (recommended)
docker compose -f docker-compose.observability.yml up -d

# Or using Docker directly
docker run -d \
  --name effect-observability \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 9090:9090 \
  -p 3000:3000 \
  grafana/otel-lgtm:latest
```

### 2. Verify the Stack

Once running, you can access:

- **Jaeger UI**: http://localhost:16686 - View distributed traces
- **Prometheus**: http://localhost:9090 - Query metrics
- **Grafana**: http://localhost:3000 - Unified dashboards

### 3. Run the Internal CLI

The internal CLI is now instrumented with OpenTelemetry tracing:

```bash
# Navigate to the internal CLI
cd apps/internal-cli

# Install dependencies (if not already done)
pnpm install

# Build the CLI
pnpm build

# Run any CLI command - traces will be automatically sent to the observability stack
pnpm tt queue-status
pnpm tt create-auto-edited-video
pnpm tt process-queue
```

## Configuration

### Environment Variables

You can configure the observability setup using environment variables:

```bash
# OpenTelemetry endpoint (defaults to http://localhost:4318/v1/traces)
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318/v1/traces"

# Service name (defaults to "total-typescript-internal-cli") 
export OTEL_SERVICE_NAME="total-typescript-internal-cli"

# Enable/disable tracing (defaults to enabled)
export OTEL_TRACES_EXPORTER="otlp"
```

### Docker Compose Configuration

The `docker-compose.observability.yml` file provides a complete setup:

```yaml
version: '3.8'

services:
  observability:
    image: grafana/otel-lgtm:latest
    container_name: effect-observability
    ports:
      - "16686:16686"  # Jaeger UI
      - "4317:4317"    # OTLP gRPC
      - "4318:4318"    # OTLP HTTP
      - "9090:9090"    # Prometheus
      - "3000:3000"    # Grafana
    environment:
      - OTEL_SERVICE_NAME=effect-internal-cli
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:16686"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Architecture

### Component Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Internal CLI  │───▶│ OpenTelemetry    │───▶│ Observability   │
│   (Effect App)  │    │ Collector        │    │ Stack (LGTM)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │                         │
                               ▼                         ▼
                       ┌──────────────┐         ┌─────────────────┐
                       │ Jaeger Traces│         │ Prometheus      │
                       │ Grafana      │         │ Tempo           │
                       │ Loki Logs    │         │ Loki            │
                       └──────────────┘         └─────────────────┘
```

### Effect Integration

The internal CLI integrates OpenTelemetry using Effect's built-in tracing capabilities:

1. **OpenTelemetry Layer**: Configured in `apps/internal-cli/src/tracing.ts`
2. **Effect Integration**: Uses `@effect/opentelemetry` for seamless tracing
3. **Automatic Instrumentation**: All Effect operations are automatically traced
4. **Structured Logging**: Console logs are correlated with traces

### Tracing Setup

The tracing setup follows Effect best practices:

```typescript
// apps/internal-cli/src/tracing.ts
export const OpenTelemetryLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "total-typescript-internal-cli",
    serviceVersion: "1.0.0",
  },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: getOtelEndpoint(),
      headers: {},
    })
  ),
}))

// apps/internal-cli/src/bin.ts  
const MainLayerLive = Layer.provide(AppLayerLive, OpenTelemetryLive);
```

## Using the Observability Tools

### Jaeger - Distributed Tracing

Access Jaeger at http://localhost:16686

**Key Features:**
- View end-to-end request traces
- Analyze service dependencies
- Identify performance bottlenecks
- Debug error propagation

**Usage:**
1. Select service: `total-typescript-internal-cli`
2. Choose operation (e.g., `queue-status`, `create-auto-edited-video`)
3. Set time range and click "Find Traces"
4. Click on traces to view detailed span information

### Prometheus - Metrics

Access Prometheus at http://localhost:9090

**Useful Queries:**
```promql
# Trace span metrics
traces_spanmetrics_calls_total
traces_spanmetrics_latency_bucket
traces_spanmetrics_latency_count

# Service health
up{job="jaeger"}
```

### Grafana - Unified Dashboard

Access Grafana at http://localhost:3000

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Pre-configured Data Sources:**
- Prometheus (metrics)
- Tempo (traces)  
- Loki (logs)

## CLI Command Tracing

Each CLI command is automatically instrumented:

### Example: Video Processing Trace

```bash
pnpm tt create-auto-edited-video --upload --generate-article
```

This creates a trace showing:
1. **Root Span**: `create-auto-edited-video` command
2. **Child Spans**: 
   - OBS video retrieval
   - User input collection
   - Queue item creation
   - File operations
   - Article generation workflow

### Example: Queue Processing Trace

```bash
pnpm tt process-queue
```

This creates traces for:
1. Queue state retrieval
2. Individual item processing
3. FFmpeg operations
4. File system operations
5. External API calls

## Troubleshooting

### Common Issues

**1. No traces appearing in Jaeger**

Check that the observability stack is running:
```bash
docker ps | grep effect-observability
curl http://localhost:16686/api/services
```

**2. Connection refused errors**

Verify the OTLP endpoint is correct:
```bash
curl http://localhost:4318/v1/traces
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318/v1/traces"
```

**3. CLI not sending traces**

Ensure dependencies are installed:
```bash
cd apps/internal-cli
pnpm install
pnpm build
```

### Health Checks

The observability stack includes health checks:

```bash
# Check container health
docker inspect effect-observability | grep Health -A 10

# Manual health check
curl -f http://localhost:16686 && echo "Jaeger OK"
curl -f http://localhost:9090 && echo "Prometheus OK"  
curl -f http://localhost:3000 && echo "Grafana OK"
```

### Logs

View container logs for debugging:

```bash
# View all logs
docker logs effect-observability

# Follow logs in real-time
docker logs -f effect-observability

# View specific component logs
docker logs effect-observability | grep jaeger
docker logs effect-observability | grep prometheus
```

## Advanced Configuration

### Custom OTLP Endpoint

To send traces to a different endpoint:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-otel-endpoint.com/v1/traces"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer your-token"
```

### Sampling Configuration

Configure trace sampling in the tracing setup:

```typescript
// Reduce trace volume in production
export const OpenTelemetryLive = NodeSdk.layer(() => ({
  resource: { serviceName: "total-typescript-internal-cli" },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({ url: getOtelEndpoint() })
  ),
  sampler: TraceIdRatioBasedSampler(0.1), // 10% sampling
}))
```

### Production Deployment

For production use:

1. **Use external observability service** (e.g., Grafana Cloud, Datadog)
2. **Configure authentication** and secure endpoints
3. **Set up proper sampling** to manage data volume
4. **Monitor resource usage** of the observability stack
5. **Configure data retention** policies

## Dependencies

The observability setup uses these key dependencies:

```json
{
  "@effect/opentelemetry": "^0.40.0",
  "@opentelemetry/exporter-trace-otlp-http": "^0.54.2",
  "@opentelemetry/sdk-trace-base": "^1.28.0",
  "@opentelemetry/sdk-trace-node": "^1.28.0",
  "@opentelemetry/sdk-metrics": "^1.28.0",
  "@opentelemetry/semantic-conventions": "^1.28.0",
  "@opentelemetry/resources": "^1.28.0"
}
```

## Contributing

When adding new CLI commands or modifying existing ones:

1. **Use Effect patterns** - All operations automatically get traced
2. **Add meaningful span names** using `Effect.withSpan("operation-name")`
3. **Include context** in span attributes for debugging
4. **Test tracing** by running commands and checking Jaeger
5. **Document new traces** in this README

## Support

For issues with the observability setup:

1. Check the [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
2. Review [Effect Tracing Guide](https://effect.website/docs/observability/tracing/)
3. Examine container logs for specific error messages
4. Verify network connectivity between components

The observability stack provides powerful insights into the Total TypeScript internal CLI operations, helping with debugging, performance optimization, and understanding application behavior.