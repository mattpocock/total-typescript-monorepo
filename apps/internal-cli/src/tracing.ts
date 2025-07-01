import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { Config, Effect, Layer } from "effect"

/**
 * Configuration for OpenTelemetry endpoint
 */
const otelEndpointConfig = Config.string("OTEL_EXPORTER_OTLP_ENDPOINT").pipe(
  Config.withDefault("http://localhost:4318/v1/traces")
)

/**
 * Configuration for service name
 */
const serviceNameConfig = Config.string("OTEL_SERVICE_NAME").pipe(
  Config.withDefault("total-typescript-internal-cli")
)

/**
 * OpenTelemetry Layer for the internal CLI
 * Configures tracing to send data to the observability stack
 */
export const OpenTelemetryLive = Layer.unwrapEffect(
  Effect.all({
    endpoint: otelEndpointConfig,
    serviceName: serviceNameConfig
  }).pipe(
    Effect.map(({ endpoint, serviceName }) =>
      NodeSdk.layer(() => ({
        resource: {
          serviceName,
          serviceVersion: "1.0.0",
        },
        spanProcessor: new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: endpoint,
            headers: {},
          })
        ),
      }))
    )
  )
)