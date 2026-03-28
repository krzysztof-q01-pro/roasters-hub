import { z } from "zod";
import { CERTIFICATIONS, ROAST_STYLES } from "./certifications";

// --- ActionResult: standardowy typ zwrotny dla Server Actions ---

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// --- Zod Schemas ---

export const CreateRoasterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().max(2000).optional().or(z.literal("")),
  country: z.string().min(2, "Country is required").max(60),
  city: z.string().min(2, "City is required").max(100),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  instagram: z
    .string()
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Invalid Instagram handle")
    .optional()
    .or(z.literal("")),
  shopUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  certifications: z.array(z.enum(CERTIFICATIONS)).max(10).default([]),
  origins: z.array(z.string().min(2).max(50)).max(20).default([]),
  roastStyles: z.array(z.enum(ROAST_STYLES)).max(5).default([]),
});

export type CreateRoasterInput = z.infer<typeof CreateRoasterSchema>;

export const UpdateRoasterSchema = z.object({
  description: z.string().max(2000).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  instagram: z
    .string()
    .regex(/^@?[a-zA-Z0-9._]{1,30}$/, "Invalid Instagram handle")
    .optional()
    .or(z.literal("")),
  shopUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  certifications: z.array(z.enum(CERTIFICATIONS)).max(10).default([]),
  origins: z.array(z.string().min(2).max(50)).max(20).default([]),
  roastStyles: z.array(z.enum(ROAST_STYLES)).max(5).default([]),
});

export type UpdateRoasterInput = z.infer<typeof UpdateRoasterSchema>;
