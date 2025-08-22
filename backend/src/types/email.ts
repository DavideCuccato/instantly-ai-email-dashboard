import { z } from "zod";

export const EmailSchema = z.object({
  id: z.number().optional(),
  to: z.string().min(1),
  cc: z.string().nullable().optional(),
  bcc: z.string().nullable().optional(),
  subject: z.string(),
  body: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateEmailSchema = EmailSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type Email = z.infer<typeof EmailSchema>;
export type CreateEmailDto = z.infer<typeof CreateEmailSchema>;
