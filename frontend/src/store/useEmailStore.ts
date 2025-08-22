import { create } from 'zustand';
import axios from 'axios';
import { Email, CreateEmailDto } from '@/types/email';
import { env } from '@/config/env';

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
});

interface EmailStore {
  emails: Email[];
  selectedEmail: Email | null;
  composeOpen: boolean;
  isLoading: boolean;
  error: string | null;

  setEmails: (emails: Email[]) => void;
  setSelectedEmail: (email: Email | null) => void;
  setComposeOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchEmails: () => Promise<void>;
  sendEmail: (emailData: CreateEmailDto) => Promise<void>;
  deleteEmail: (id: number) => Promise<void>;
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  emails: [],
  selectedEmail: null,
  composeOpen: false,
  isLoading: false,
  error: null,

  setEmails: (emails) => set({ emails }),
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  setComposeOpen: (open) => set({ composeOpen: open }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchEmails: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Email[]>('/emails');
      set({ emails: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      set({ error: 'Failed to fetch emails', isLoading: false });
    }
  },

  sendEmail: async (emailData: CreateEmailDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Email>('/emails', emailData);
      const { emails } = get();
      set({
        emails: [response.data, ...emails],
        selectedEmail: response.data,
        isLoading: false,
        composeOpen: false,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      set({ error: 'Failed to send email', isLoading: false });
      throw error;
    }
  },

  deleteEmail: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/emails/${id}`);
      const { emails, selectedEmail } = get();
      set({
        emails: emails.filter((email) => email.id !== id),
        selectedEmail: selectedEmail?.id === id ? null : selectedEmail,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to delete email:', error);
      set({ error: 'Failed to delete email', isLoading: false });
      throw error;
    }
  },
}));