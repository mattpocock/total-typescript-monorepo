import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

/**
 * Get OpenTelemetry endpoint from environment or default
 */
const getOtelEndpoint = (): string => {
  return process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces"
}

/**
 * OpenTelemetry Layer for the internal CLI
 * Configures tracing to send data to the observability stack
 */
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

export const getServiceName = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.OTEL_SERVICE_NAME || "total-typescript-internal-cli"
  }
  return "total-typescript-internal-cli"
}