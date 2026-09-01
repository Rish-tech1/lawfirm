'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { TbAlertCircle, TbCheck, TbLoader2, TbSend } from 'react-icons/tb';
import { practiceAreaOptions } from '@/content';
import { site } from '@/content/site';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { submitContactForm } from '@/lib/api';
import { contactFormDefaults, contactSchema, type ContactFormValues } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  /** Preselects the practice area — used on practice-area detail pages. */
  defaultPracticeArea?: string;
  tone?: 'light' | 'dark';
  className?: string;
}

const inputBase =
  'w-full border bg-transparent px-4 py-3 font-body text-sm transition-colors duration-200 ' +
  'placeholder:text-muted-light focus:outline-none focus:ring-0';

export function ContactForm({ defaultPracticeArea, tone = 'light', className }: ContactFormProps) {
  const isDark = tone === 'dark';
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { execute: executeRecaptcha } = useRecaptcha();

  /** Timestamp of mount — a submission faster than a human could type is a bot. */
  const mountedAtRef = useRef<number>(Date.now());

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { ...contactFormDefaults, practiceArea: defaultPracticeArea ?? '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  const onSubmit = async (values: ContactFormValues) => {
    const recaptchaToken = await executeRecaptcha('contact_form');

    const result = await submitContactForm({
      ...values,
      elapsedMs: Date.now() - mountedAtRef.current,
      recaptchaToken,
    });

    if (result.success) {
      toast.success(result.message);
      setIsSubmitted(true);
      reset({ ...contactFormDefaults, practiceArea: defaultPracticeArea ?? '' });
      return;
    }

    // Surface server-side field errors on the matching inputs.
    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (field in contactFormDefaults && messages?.[0]) {
          setError(field as keyof ContactFormValues, { type: 'server', message: messages[0] });
        }
      }
    }

    toast.error(result.message);
  };

  const labelClass = cn(
    'mb-2 block font-body text-[0.6875rem] font-semibold uppercase tracking-[0.14em]',
    isDark ? 'text-white/70' : 'text-ink',
  );

  const fieldClass = (hasError: boolean) =>
    cn(
      inputBase,
      isDark
        ? 'border-white/15 text-white focus:border-gold'
        : 'border-line text-ink focus:border-gold',
      hasError && 'border-[#C0392B] focus:border-[#C0392B]',
    );

  if (isSubmitted) {
    // `reveal-on-load` is the same fade-and-rise used by the hero, so this panel
    // shares the site's motion language — and unlike the JS animation it
    // replaced, it is disabled under `prefers-reduced-motion`.
    return (
      <div
        className={cn(
          'reveal-on-load flex flex-col items-center justify-center border p-10 text-center lg:p-14',
          isDark ? 'border-white/12 bg-ink-800' : 'border-line bg-cream',
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gold text-ink">
          <TbCheck className="h-8 w-8" aria-hidden="true" />
        </span>

        <h3 className={cn('mt-7 font-display text-2xl', isDark && 'text-white')}>
          Enquiry received
        </h3>

        <p className={cn('mt-4 max-w-md text-sm leading-relaxed', isDark ? 'text-white/60' : 'text-muted')}>
          Thank you for contacting {site.name}. A confirmation email is on its way, and a member of
          the team will respond within one working day. For urgent criminal matters, please call{' '}
          <a
            href={`tel:${site.phone.primaryHref}`}
            className="font-semibold text-gold-700 underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
          >
            {site.phone.primary}
          </a>{' '}
          instead.
        </p>

        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className={cn(
            'mt-8 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-700 hover:decoration-gold',
            isDark ? 'text-white/70' : 'text-ink',
          )}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
      noValidate
      aria-label="Enquiry form"
    >
      {/* Honeypot: hidden from sighted users and from assistive tech alike, so a
          real user can never fill it, but a naive bot will. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website (leave this field empty)</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full Name <span className="text-gold">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Rohit Malhotra"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className={fieldClass(Boolean(errors.fullName))}
            {...register('fullName')}
          />
          <FieldError id="fullName-error" message={errors.fullName?.message} isDark={isDark} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address <span className="text-gold">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={fieldClass(Boolean(errors.email))}
            {...register('email')}
          />
          <FieldError id="email-error" message={errors.email?.message} isDark={isDark} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone Number <span className="text-gold">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={fieldClass(Boolean(errors.phone))}
            {...register('phone')}
          />
          <FieldError id="phone-error" message={errors.phone?.message} isDark={isDark} />
        </div>

        <div>
          <label htmlFor="practiceArea" className={labelClass}>
            Practice Area <span className="text-gold">*</span>
          </label>
          <select
            id="practiceArea"
            aria-invalid={Boolean(errors.practiceArea)}
            aria-describedby={errors.practiceArea ? 'practiceArea-error' : undefined}
            className={cn(fieldClass(Boolean(errors.practiceArea)), isDark && '[&>option]:text-ink')}
            {...register('practiceArea')}
          >
            <option value="">Select a practice area…</option>
            {practiceAreaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FieldError
            id="practiceArea-error"
            message={errors.practiceArea?.message}
            isDark={isDark}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject <span className="text-gold">*</span>
        </label>
        <input
          id="subject"
          type="text"
          placeholder="A one-line summary of your matter"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          className={fieldClass(Boolean(errors.subject))}
          {...register('subject')}
        />
        <FieldError id="subject-error" message={errors.subject?.message} isDark={isDark} />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Your Message <span className="text-gold">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          placeholder="Please describe your matter, including any deadlines or hearing dates you are aware of. Do not include sensitive documents in this message — we will request them securely."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : 'message-hint'}
          className={cn(fieldClass(Boolean(errors.message)), 'resize-y')}
          {...register('message')}
        />
        {errors.message ? (
          <FieldError id="message-error" message={errors.message.message} isDark={isDark} />
        ) : (
          <p
            id="message-hint"
            className={cn('mt-2 text-xs', isDark ? 'text-white/40' : 'text-muted-light')}
          >
            Enquiries are treated as confidential from the moment we receive them.
          </p>
        )}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none border border-line bg-transparent transition-colors checked:border-gold checked:bg-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            {...register('consent')}
          />
          <span className={cn('text-xs leading-relaxed', isDark ? 'text-white/60' : 'text-muted')}>
            I agree that {site.shortName} may contact me about this enquiry by email or telephone. I
            understand that submitting this form does not create an advocate–client relationship.
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent?.message} isDark={isDark} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'group inline-flex w-full items-center justify-center gap-2.5 rounded-[2px] px-8 py-4 font-body text-[0.8125rem] font-semibold uppercase tracking-wide transition-all duration-300 ease-luxe',
          'bg-gold text-ink hover:bg-gold-400 hover:shadow-gold motion-safe:hover:-translate-y-0.5',
          'disabled:pointer-events-none disabled:opacity-60',
        )}
      >
        {isSubmitting ? (
          <>
            <TbLoader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending enquiry…
          </>
        ) : (
          <>
            Submit Enquiry
            <TbSend
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      <p className={cn('text-center text-[0.6875rem]', isDark ? 'text-white/35' : 'text-muted-light')}>
        This form is protected against automated submissions. Fields marked{' '}
        <span className="text-gold">*</span> are required.
      </p>
    </form>
  );
}

/** Inline validation message, announced to assistive tech as it appears. */
function FieldError({
  id,
  message,
  isDark,
}: {
  id: string;
  message?: string;
  isDark: boolean;
}) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn(
        'mt-2 flex items-start gap-1.5 text-xs',
        isDark ? 'text-[#E88A7D]' : 'text-[#C0392B]',
      )}
    >
      <TbAlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
