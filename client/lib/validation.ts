import { z } from 'zod';

/**
 * Contact form schema.
 *
 * The server enforces an equivalent schema in `server/utils/validators.js` —
 * client-side validation is a courtesy to the user, never a security boundary.
 * If you change a rule here, change it there too.
 */

/** Accepts +91 98765 43210, 09876543210, 9876543210 and similar. */
const phonePattern = /^[+]?[\d][\d\s\-().]{7,17}\d$/;

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'Name must be 80 characters or fewer.')
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, 'Name may only contain letters, spaces and . \' -'),

  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(120, 'Email must be 120 characters or fewer.')
    .email('Please enter a valid email address.')
    .transform((value) => value.toLowerCase()),

  phone: z
    .string()
    .trim()
    .min(1, 'Please enter a phone number so we can call you back.')
    .regex(phonePattern, 'Please enter a valid phone number, including country code.'),

  practiceArea: z
    .string()
    .trim()
    .min(1, 'Please select the practice area your matter relates to.'),

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

  /**
   * Typed as boolean rather than `literal(true)` so the checkbox can default to
   * unticked — pre-ticked consent is not consent.
   */
  consent: z.boolean().refine((value) => value === true, {
    message: 'Please confirm you agree to be contacted about your enquiry.',
  }),

  /**
   * Honeypot. Hidden from sighted users and screen readers alike; a bot that
   * fills every field trips it and the server silently discards the submission.
   *
   * Accepts any value on purpose. Validating it would block submission with an
   * error message pointing at an invisible field — unfixable for a user whose
   * browser autofilled it — and the server is what actually acts on the trap.
   */
  website: z.string().max(200).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

/** Blank starting state for `useForm`, so every field is controlled from mount. */
export const contactFormDefaults: ContactFormValues = {
  fullName: '',
  email: '',
  phone: '',
  practiceArea: '',
  subject: '',
  message: '',
  consent: false,
  website: '',
};
