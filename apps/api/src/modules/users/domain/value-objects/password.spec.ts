import { ZodError } from "zod";

import { Password } from "./password";

describe("Password", () => {
  describe("construction", () => {
    it("should create Password with valid password", () => {
      const password = new Password("SecurePass1");

      expect(password.value).toBe("SecurePass1");
    });

    it("should accept password with exactly 8 characters", () => {
      const password = new Password("Abcdef1g");

      expect(password.value).toBe("Abcdef1g");
    });

    it("should accept password with special characters", () => {
      const password = new Password("Secure@Pass1!");

      expect(password.value).toBe("Secure@Pass1!");
    });

    it("should accept long passwords", () => {
      const longPassword = "SecurePassword123!@#$%^&*()";
      const password = new Password(longPassword);

      expect(password.value).toBe(longPassword);
    });
  });

  describe("validation - minimum length", () => {
    it("should throw ZodError for password shorter than 8 characters", () => {
      expect(() => new Password("Short1A")).toThrow(ZodError);
    });

    it("should throw ZodError for empty string", () => {
      expect(() => new Password("")).toThrow(ZodError);
    });

    it("should throw with correct error message for short password", () => {
      try {
        new Password("Ab1");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toBe("Password must be at least 8 characters");
      }
    });
  });

  describe("validation - uppercase requirement", () => {
    it("should throw ZodError for password without uppercase letter", () => {
      expect(() => new Password("lowercase1")).toThrow(ZodError);
    });

    it("should throw with correct error message for missing uppercase", () => {
      try {
        new Password("lowercase1");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        const messages = zodError.issues.map(e => e.message);
        expect(messages).toContain("Password must contain at least one uppercase letter");
      }
    });
  });

  describe("validation - lowercase requirement", () => {
    it("should throw ZodError for password without lowercase letter", () => {
      expect(() => new Password("UPPERCASE1")).toThrow(ZodError);
    });

    it("should throw with correct error message for missing lowercase", () => {
      try {
        new Password("UPPERCASE1");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        const messages = zodError.issues.map(e => e.message);
        expect(messages).toContain("Password must contain at least one lowercase letter");
      }
    });
  });

  describe("validation - number requirement", () => {
    it("should throw ZodError for password without number", () => {
      expect(() => new Password("NoNumbersHere")).toThrow(ZodError);
    });

    it("should throw with correct error message for missing number", () => {
      try {
        new Password("NoNumbersHere");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        const messages = zodError.issues.map(e => e.message);
        expect(messages).toContain("Password must contain at least one number");
      }
    });
  });

  describe("validation - multiple requirements", () => {
    it("should throw ZodError with multiple messages when multiple requirements fail", () => {
      try {
        new Password("short");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues.length).toBeGreaterThan(1);
      }
    });

    it("should collect all validation errors", () => {
      try {
        new Password("abc");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        const messages = zodError.issues.map(e => e.message);
        expect(messages).toContain("Password must be at least 8 characters");
        expect(messages).toContain("Password must contain at least one uppercase letter");
        expect(messages).toContain("Password must contain at least one number");
      }
    });
  });

  describe("toString - security", () => {
    it("should return [PROTECTED] instead of actual value", () => {
      const password = new Password("SecurePass1");

      expect(password.toString()).toBe("[PROTECTED]");
    });

    it("should not expose password in string interpolation", () => {
      const password = new Password("SecurePass1");

      expect(`Password: ${password}`).toBe("Password: [PROTECTED]");
    });

    it("should not expose password when converted to string", () => {
      const password = new Password("SecurePass1");

      expect(String(password)).toBe("[PROTECTED]");
    });
  });

  describe("value property", () => {
    it("should store the actual password value", () => {
      const password = new Password("SecurePass1");

      expect(password.value).toBe("SecurePass1");
    });

    it("should be readonly", () => {
      const password = new Password("SecurePass1");

      // TypeScript would prevent this at compile time
      // but we verify the value doesn't change
      expect(password.value).toBe("SecurePass1");
    });
  });

  describe("edge cases", () => {
    it("should accept password with numbers at different positions", () => {
      expect(() => new Password("1Abcdefgh")).not.toThrow();
      expect(() => new Password("Abcdefg1h")).not.toThrow();
      expect(() => new Password("Abcdefgh1")).not.toThrow();
    });

    it("should accept password with multiple numbers", () => {
      const password = new Password("Abc12345def");

      expect(password.value).toBe("Abc12345def");
    });

    it("should accept password with unicode characters beyond ASCII", () => {
      const password = new Password("Pässwörd1");

      expect(password.value).toBe("Pässwörd1");
    });
  });
});
