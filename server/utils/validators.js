'use strict';

/**
 * Server-side request validation.
 *
 * Mirrors `client/lib/validation.ts`. The two are intentionally separate — the
 * client copy exists for instant feedback, this one is the actual security
 * boundary and must never trust it. If you change a rule in one, change it in
 * both; the tests in the README's smoke-test section will catch a mismatch.
 */
const { z } = require('zod');

const phonePattern = /^[+]?[\d][\d\s\-().]{7,17}\d$/;

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'Name must be 80 characters or fewer.')
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, "Name may only contain letters, spaces and . ' -"),

  email: z
    .string()
    .trim()
    .max(120, 'Email must be 120 characters or fewer.')
    .email('Please enter a valid email address.')
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .regex(phonePattern, 'Please enter a valid phone number, including country code.'),

  practiceArea: z
    .string()
    .trim()
    .min(1, 'Please select the practice area your matter relates to.')
    .max(80),

  subject: z
    .string()
    .trim()
    .min(4, 'Please give your enquiry a short subject.')
    .max(140, 'Subject must be 140 characters or fewer.'),

  message: z
    .string()
    .trim()
    .min(20, 'Please describe your matter in at least 20 characters.')
    .max(4000, 'Message must be 4000 characters or fewer.'),

  consent: z
    .boolean()
    .refine((value) => value === true, {
      message: 'Please confirm you agree to be contacted about your enquiry.',
    }),

  /* --- Anti-spam fields: validated but never persisted as content --------- */

  /**
   * Honeypot. Any content here means a bot filled a hidden input.
   *
   * Deliberately permissive: the schema must ACCEPT a filled honeypot so the
   * controller can drop the submission with a normal-looking 200. Rejecting it
   * here would return a 422 naming this field, telling an attacker precisely
   * which check caught them — and would also hand a real user an unfixable
   * error if their browser autofilled a field they cannot see.
   */
  website: z.string().max(200).optional(),

  /** Milliseconds between form render and submit. */
  elapsedMs: z.number().int().nonnegative().optional(),

  recaptchaToken: z.string().max(4000).optional(),
});

/**
 * Flattens a ZodError into `{ field: [messages] }` for the client to attach to
 * individual inputs.
 */
function formatZodErrors(error) {
  const errors = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }

  return errors;
}

/**
 * Strips HTML-significant characters from a value destined for an email body.
 *
 * Enquiry content is attacker-controlled and lands in an HTML email read by
 * staff, so it is escaped rather than trusted. Applied at render time in the
 * templates; kept here so there is one definition.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Collapses newlines into <br> after escaping, for multi-line message bodies. */
function escapeHtmlMultiline(value) {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

module.exports = { contactSchema, formatZodErrors, escapeHtml, escapeHtmlMultiline };
