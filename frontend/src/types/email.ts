export interface Email {
  id: number;
  to: string;
  cc: string | null;
  bcc: string | null;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailDto {
  to: string;
  cc?: string | null;
  bcc?: string | null;
  subject: string;
  body: string;
}

export interface AiGenerateRequest {
  prompt: string;
  to?: string;
}

export interface AiGenerateResponse {
  assistant_type?: 'sales' | 'followup';
  subject?: string;
  body?: string;
  type?: 'subject' | 'body' | 'final';
  wordCount?: number;
  error?: string;
}