import axios, { AxiosError } from 'axios';
import type { ApiResponse, ContactPayload } from '@/types';

/**
 * Axios client for the Express backend.
 *
 * Set NEXT_PUBLIC_API_URL to the deployed API origin (e.g.
 * `https://singla-api.onrender.com/api`). The localhost default only applies
 * when running both workspaces locally.
 */
// `?.trim() ||` rather than `??`: a declared-but-empty NEXT_PUBLIC_API_URL
// would otherwise resolve to '' and post to the current origin.
const baseURL = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

export interface ContactResult {
  success: boolean;
  message: string;
  /** Field-level errors returned by the server, keyed by field name. */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Submit an enquiry. Never throws — the form needs a message to show the user
 * whichever way it goes, and an unhandled rejection in an event handler is
 * worse than a returned failure.
 */
export async function submitContactForm(payload: ContactPayload): Promise<ContactResult> {
  try {
    const { data } = await api.post<ApiResponse>('/contact', payload);
    return {
      success: data.success,
      message: data.message || 'Thank you — your enquiry has been received.',
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;

    if (axiosError.response) {
      const { status, data } = axiosError.response;

      if (status === 422 && data?.errors) {
        return {
          success: false,
          message: data.message || 'Please correct the highlighted fields and try again.',
          fieldErrors: data.errors,
        };
      }

      if (status === 429) {
        return {
          success: false,
          message:
            'Too many enquiries from this connection. Please wait a few minutes, or call the office directly.',
        };
      }

      return {
        success: false,
        message:
          data?.message ??
          'We could not submit your enquiry just now. Please try again, or contact us by phone.',
      };
    }

    if (axiosError.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'The request timed out. Please check your connection and try again.',
      };
    }

    return {
      success: false,
      message:
        'We could not reach our server. Please try again shortly, or reach us by phone or WhatsApp.',
    };
  }
}
