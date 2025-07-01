import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

/**
 * Configuration for OpenTelemetry endpoint
 */
const otelEndpoint = "http://localhost:4318/v1/traces";

/**
 * Configuration for service name
 */
const serviceName = "total-typescript-internal-cli";

/**
 * OpenTelemetry Layer for the internal CLI
 * Configures tracing to send data to the observability stack
 */
export const OpenTelemetryLive = NodeSdk.layer(() => ({
  resource: {
    serviceName,
    serviceVersion: "1.0.0",
  },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: otelEndpoint,
      headers: {},
    })
  ),
}));
