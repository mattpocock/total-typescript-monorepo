import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { validateCreateVideoFlags, FlagValidationError, CreateVideoOptions } from "./validate-cli-flags.js";

describe("validateCreateVideoFlags", () => {
  describe("alongside flag validation", () => {
    it("should fail when alongside is true but generateArticle is false", async () => {
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: false,
        upload: false,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(FlagValidationError);
        expect(result.left.errorMessage).toBe(
          "❌ The --alongside flag can only be used with --generate-article."
        );
        expect(result.left.helpMessages).toEqual([
          "💡 Use: pnpm cli create-auto-edited-video --generate-article --alongside"
        ]);
      }
    });

    it("should fail when alongside is true but generateArticle is undefined", async () => {
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: undefined,
        upload: false,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(FlagValidationError);
        expect(result.left.errorMessage).toBe(
          "❌ The --alongside flag can only be used with --generate-article."
        );
      }
    });

    it("should pass when alongside is true and generateArticle is true", async () => {
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: true,
        upload: false,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass when alongside is false", async () => {
      const options: CreateVideoOptions = {
        alongside: false,
        generateArticle: false,
        upload: true,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass when alongside is undefined", async () => {
      const options: CreateVideoOptions = {
        alongside: undefined,
        generateArticle: false,
        upload: true,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });
  });

  describe("alongside and upload flags conflict validation", () => {
    it("should fail when both alongside and upload are true", async () => {
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: true,
        upload: true,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(FlagValidationError);
        expect(result.left.errorMessage).toBe(
          "❌ The --alongside and --upload flags cannot be used together."
        );
        expect(result.left.helpMessages).toEqual([
          "💡 Use either: pnpm cli create-auto-edited-video --generate-article --alongside",
          "💡 Or: pnpm cli create-auto-edited-video --generate-article --upload"
        ]);
      }
    });

    it("should pass when alongside is true and upload is false", async () => {
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: true,
        upload: false,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass when alongside is true and upload is undefined", async () => {
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: true,
        upload: undefined,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass when alongside is false and upload is true", async () => {
      const options: CreateVideoOptions = {
        alongside: false,
        generateArticle: true,
        upload: true,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass when alongside is undefined and upload is true", async () => {
      const options: CreateVideoOptions = {
        alongside: undefined,
        generateArticle: true,
        upload: true,
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });
  });

  describe("validation precedence", () => {
    it("should fail with alongside/generateArticle error when both violations exist", async () => {
      // This tests that the first validation (alongside without generateArticle) takes precedence
      const options: CreateVideoOptions = {
        alongside: true,
        generateArticle: false, // This violation comes first
        upload: true,           // This would also be a violation, but shouldn't be reached
        subtitles: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(FlagValidationError);
        expect(result.left.errorMessage).toBe(
          "❌ The --alongside flag can only be used with --generate-article."
        );
        // Should NOT be the upload/alongside conflict error
        expect(result.left.errorMessage).not.toContain("upload");
      }
    });
  });

  describe("valid combinations", () => {
    it("should pass with all valid flags set", async () => {
      const options: CreateVideoOptions = {
        alongside: false,
        generateArticle: true,
        upload: true,
        subtitles: false,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass with minimal flags", async () => {
      const options: CreateVideoOptions = {};

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass with generateArticle and alongside only", async () => {
      const options: CreateVideoOptions = {
        generateArticle: true,
        alongside: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });

    it("should pass with generateArticle and upload only", async () => {
      const options: CreateVideoOptions = {
        generateArticle: true,
        upload: true,
      };

      const result = await validateCreateVideoFlags(options).pipe(
        Effect.either,
        Effect.runPromise
      );

      expect(result._tag).toBe("Right");
    });
  });
});