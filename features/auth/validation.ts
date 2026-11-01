import { z } from "zod";

const email = z.string().trim().toLowerCase().max(320).pipe(z.email());

export const signInSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email,
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(512),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});
