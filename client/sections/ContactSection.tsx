import type { ReactNode } from 'react';
import { TbBrandWhatsapp, TbClock, TbMail, TbMapPin, TbPhone } from 'react-icons/tb';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ContactFormLazy } from '@/components/forms/ContactFormLazy';
import { formatOfficeAddress, offices, site, whatsappHref } from '@/content/site';

interface ContactSectionProps {
  /** Preselects the practice area in the form. */
  defaultPracticeArea?: string;
  /** Home page uses `h2`; the contact page supplies its own `h1` in the banner. */
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/**
 * Contact block: details column plus the enquiry form.
 * Reused on the home page and the contact page.
 */
export function ContactSection({
  defaultPracticeArea,
  headingLevel = 'h2',
  className,
}: ContactSectionProps) {
  return (
    <section id="contact" className={className ?? 'scroll-mt-24 py-20 lg:py-28'}>
      <Container>
        <SectionHeading
          eyebrow="Get In Touch"
          title="Book your consultation"
          description="Tell us about your matter and we will respond within one working day. Every enquiry is confidential from the moment it reaches us."
          as={headingLevel}
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Details */}
          <Reveal className="lg:col-span-5">
            <div className="space-y-8">
              <ContactDetail icon={<TbMapPin className="h-5 w-5" />} label="Offices">
                <ul className="space-y-3">
                  {offices.map((office) => (
                    <li key={office.id}>
                      <span className="font-medium text-ink">{office.name}</span>
                      <address className="not-italic leading-relaxed">
                        {formatOfficeAddress(office)}
                      </address>
                    </li>
                  ))}
                </ul>
              </ContactDetail>

              <ContactDetail icon={<TbPhone className="h-5 w-5" />} label="Telephone">
                <a
                  href={`tel:${site.phone.primaryHref}`}
                  className="block transition-colors hover:text-gold-700"
                >
                  {site.phone.primary}
                </a>
                <a
                  href={`tel:${site.phone.secondaryHref}`}
                  className="block transition-colors hover:text-gold-700"
                >
                  {site.phone.secondary}
                </a>
              </ContactDetail>

              <ContactDetail icon={<TbMail className="h-5 w-5" />} label="Email">
                <a
                  href={`mailto:${site.email.general}`}
                  className="block break-all transition-colors hover:text-gold-700"
                >
                  {site.email.general}
                </a>
                {/* Only a second, genuinely different mailbox is worth showing. */}
                {site.email.consultation !== site.email.general ? (
                  <a
                    href={`mailto:${site.email.consultation}`}
                    className="block break-all transition-colors hover:text-gold-700"
                  >
                    {site.email.consultation}
                  </a>
                ) : null}
              </ContactDetail>

              <ContactDetail icon={<TbClock className="h-5 w-5" />} label="Office Hours">
                <ul className="space-y-1.5">
                  {site.hours.map((slot) => (
                    <li key={slot.days} className="flex flex-wrap gap-x-2">
                      <span className="font-medium text-ink">{slot.days}</span>
                      <span>{slot.time}</span>
                    </li>
                  ))}
                </ul>
              </ContactDetail>

              <ContactDetail icon={<TbBrandWhatsapp className="h-5 w-5" />} label="WhatsApp">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium text-ink transition-colors hover:text-gold-700"
                >
                  Start a WhatsApp chat
                  <span className="text-gold" aria-hidden="true">
                    →
                  </span>
                </a>
                <p className="mt-1 text-xs text-muted-light">
                  Messages answered during office hours.
                </p>
              </ContactDetail>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="border border-line bg-cream p-7 sm:p-9 lg:p-10">
              <ContactFormLazy defaultPracticeArea={defaultPracticeArea} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function ContactDetail({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center border border-line text-gold-600"
        aria-hidden="true"
      >
        {icon}
      </span>

      <div>
        <h3 className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
          {label}
        </h3>
        <div className="mt-2 text-sm text-muted">{children}</div>
      </div>
    </div>
  );
}
