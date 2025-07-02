// @ts-nocheck

import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { detectExercises } from "./exercise-detector.js";
import { NodeFileSystem } from "@effect/platform-node";
import { type AbsolutePath } from "@total-typescript/shared";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Exercise Detector", () => {
  describe("Numbered solution files", () => {
    it("should detect .solution.1.ts files as valid solutions", async () => {
      const tmpdir = fs.mkdtempSync(path.join(__dirname, "tmp-numbered-solutions"));
      
      try {
        // Create a section directory
        const sectionPath = path.join(tmpdir, "01-basic-types");
        fs.mkdirSync(sectionPath, { recursive: true });

        // Create exercise files with numbered solutions
        const exerciseFiles = [
          "001-type-annotations.problem.ts",
          "001-type-annotations.solution.1.ts",
          "001-type-annotations.solution.2.ts",
          "002-union-types.problem.ts", 
          "002-union-types.solution.1.ts",
          "003-generics.problem.ts",
          "003-generics.solution.ts", // Regular solution without number
        ];

        for (const file of exerciseFiles) {
          fs.writeFileSync(
            path.join(sectionPath, file),
            `// ${file}\nexport {};\n`
          );
        }

        const result = await Effect.gen(function* () {
          const { sections } = yield* detectExercises(tmpdir as AbsolutePath);
          return sections;
        }).pipe(
          Effect.provide(NodeFileSystem.layer),
          Effect.runPromise
        );

        expect(result).toHaveLength(1);
        const section = result[0]!;
        expect(section.name).toBe("basic types");
        expect(section.exercises).toHaveLength(3);

        // Find each exercise
        const exercise1 = section.exercises.find(e => e.number === 1);
        const exercise2 = section.exercises.find(e => e.number === 2); 
        const exercise3 = section.exercises.find(e => e.number === 3);

        expect(exercise1).toBeDefined();
        expect(exercise1!.problemFile).toBe("001-type-annotations.problem.ts");
        expect(exercise1!.solutionFile).toBeDefined();
        expect(exercise1!.solutionFile).toMatch(/001-type-annotations\.solution\.\d*\.ts/);
        
        expect(exercise2).toBeDefined();
        expect(exercise2!.problemFile).toBe("002-union-types.problem.ts");
        expect(exercise2!.solutionFile).toBeDefined();
        expect(exercise2!.solutionFile).toMatch(/002-union-types\.solution\.\d*\.ts/);

        expect(exercise3).toBeDefined();
        expect(exercise3!.problemFile).toBe("003-generics.problem.ts");
        expect(exercise3!.solutionFile).toBe("003-generics.solution.ts");

        // Check that no "missing solution" validation errors are present
        const missingSolutionErrors = section.exercises.flatMap(e => 
          e.validationErrors.filter(err => err.type === 'missing-solution')
        );
        expect(missingSolutionErrors).toHaveLength(0);

      } finally {
        fs.rmSync(tmpdir, { recursive: true });
      }
    });

    it("should detect numbered solution files in folder-based exercises", async () => {
      const tmpdir = fs.mkdtempSync(path.join(__dirname, "tmp-folder-numbered-solutions"));
      
      try {
        // Create a section directory
        const sectionPath = path.join(tmpdir, "02-advanced-types");
        fs.mkdirSync(sectionPath, { recursive: true });

        // Create folder-based exercise with numbered solutions
        const exercisePath = path.join(sectionPath, "001-mapped-types");
        fs.mkdirSync(exercisePath, { recursive: true });

        const exerciseFiles = [
          "mapped-types.problem.ts",
          "mapped-types.solution.1.ts",
          "mapped-types.solution.2.ts",
          "mapped-types.solution.3.ts",
        ];

        for (const file of exerciseFiles) {
          fs.writeFileSync(
            path.join(exercisePath, file),
            `// ${file}\nexport {};\n`
          );
        }

        const result = await Effect.gen(function* () {
          const { sections } = yield* detectExercises(tmpdir as AbsolutePath);
          return sections;
        }).pipe(
          Effect.provide(NodeFileSystem.layer),
          Effect.runPromise
        );

        expect(result).toHaveLength(1);
        const section = result[0]!;
        expect(section.name).toBe("advanced types");
        expect(section.exercises).toHaveLength(1);

        const exercise = section.exercises[0]!;
        expect(exercise.type).toBe("folder-based");
        expect(exercise.number).toBe(1);
        expect(exercise.problemFile).toBe("mapped-types.problem.ts");
        expect(exercise.solutionFile).toBeDefined();
        expect(exercise.solutionFile).toMatch(/mapped-types\.solution\.\d*\.ts/);

        // Check that no "missing solution" validation errors are present
        const missingSolutionErrors = exercise.validationErrors.filter(
          err => err.type === 'missing-solution'
        );
        expect(missingSolutionErrors).toHaveLength(0);

      } finally {
        fs.rmSync(tmpdir, { recursive: true });
      }
    });

    it("should still report missing solution when no solution files exist", async () => {
      const tmpdir = fs.mkdtempSync(path.join(__dirname, "tmp-missing-solutions"));
      
      try {
        // Create a section directory
        const sectionPath = path.join(tmpdir, "03-types-without-solutions");
        fs.mkdirSync(sectionPath, { recursive: true });

        // Create exercise files without any solutions
        const exerciseFiles = [
          "001-orphaned-exercise.problem.ts",
        ];

        for (const file of exerciseFiles) {
          fs.writeFileSync(
            path.join(sectionPath, file),
            `// ${file}\nexport {};\n`
          );
        }

        const result = await Effect.gen(function* () {
          const { sections } = yield* detectExercises(tmpdir as AbsolutePath);
          return sections;
        }).pipe(
          Effect.provide(NodeFileSystem.layer),
          Effect.runPromise
        );

        expect(result).toHaveLength(1);
        const section = result[0]!;
        expect(section.exercises).toHaveLength(1);

        const exercise = section.exercises[0]!;
        expect(exercise.problemFile).toBe("001-orphaned-exercise.problem.ts");
        expect(exercise.solutionFile).toBeUndefined();

        // Should have missing solution error
        const missingSolutionErrors = exercise.validationErrors.filter(
          err => err.type === 'missing-solution'
        );
        expect(missingSolutionErrors).toHaveLength(1);

      } finally {
        fs.rmSync(tmpdir, { recursive: true });
      }
    });
  });
});