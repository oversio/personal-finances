import { ZodError } from "zod";

import { Email } from "./email";

describe("Email", () => {
  describe("construction", () => {
    it("should create Email with valid email address", () => {
      const email = new Email("user@example.com");

      expect(email.value).toBe("user@example.com");
    });

    it("should accept various valid email formats", () => {
      const validEmails = [
        "simple@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user@subdomain.example.com",
        "user@example.co.uk",
      ];

      for (const emailStr of validEmails) {
        const email = new Email(emailStr);
        expect(email.value).toBe(emailStr.toLowerCase());
      }
    });
  });

  describe("normalization", () => {
    it("should convert uppercase to lowercase", () => {
      const email = new Email("USER@EXAMPLE.COM");

      expect(email.value).toBe("user@example.com");
    });

    it("should convert mixed case to lowercase", () => {
      const email = new Email("User.Name@Example.COM");

      expect(email.value).toBe("user.name@example.com");
    });

    it("should trim leading whitespace", () => {
      const email = new Email("  user@example.com");

      expect(email.value).toBe("user@example.com");
    });

    it("should trim trailing whitespace", () => {
      const email = new Email("user@example.com  ");

      expect(email.value).toBe("user@example.com");
    });

    it("should trim both leading and trailing whitespace", () => {
      const email = new Email("  user@example.com  ");

      expect(email.value).toBe("user@example.com");
    });

    it("should apply both lowercase and trim", () => {
      const email = new Email("  USER@EXAMPLE.COM  ");

      expect(email.value).toBe("user@example.com");
    });
  });

  describe("validation", () => {
    it("should throw ZodError for empty string", () => {
      expect(() => new Email("")).toThrow(ZodError);
    });

    it("should throw ZodError for string without @", () => {
      expect(() => new Email("userexample.com")).toThrow(ZodError);
    });

    it("should throw ZodError for string without domain", () => {
      expect(() => new Email("user@")).toThrow(ZodError);
    });

    it("should throw ZodError for string without local part", () => {
      expect(() => new Email("@example.com")).toThrow(ZodError);
    });

    it("should throw ZodError for plain text", () => {
      expect(() => new Email("not-an-email")).toThrow(ZodError);
    });

    it("should throw with correct error message", () => {
      try {
        new Email("invalid");
        fail("Expected ZodError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0].message).toBe("Invalid email format");
      }
    });

    it("should throw ZodError for whitespace only", () => {
      expect(() => new Email("   ")).toThrow(ZodError);
    });
  });

  describe("equals", () => {
    it("should return true for emails with same value", () => {
      const email1 = new Email("user@example.com");
      const email2 = new Email("user@example.com");

      expect(email1.equals(email2)).toBe(true);
    });

    it("should return true for emails that normalize to same value", () => {
      const email1 = new Email("USER@example.com");
      const email2 = new Email("user@EXAMPLE.COM");

      expect(email1.equals(email2)).toBe(true);
    });

    it("should return false for different emails", () => {
      const email1 = new Email("user1@example.com");
      const email2 = new Email("user2@example.com");

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return the normalized email value", () => {
      const email = new Email("USER@EXAMPLE.COM");

      expect(email.toString()).toBe("user@example.com");
    });

    it("should work with string interpolation", () => {
      const email = new Email("user@example.com");

      expect(`Contact: ${email}`).toBe("Contact: user@example.com");
    });
  });
});
