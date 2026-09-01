import {
  TbAward,
  TbBriefcase,
  TbBuildingBank,
  TbBuildingSkyscraper,
  TbCheck,
  TbClock,
  TbDeviceDesktop,
  TbFileDescription,
  TbFileInvoice,
  TbGavel,
  TbHeartBroken,
  TbHelmet,
  TbHome,
  TbKey,
  TbLock,
  TbBulb,
  TbMail,
  TbMapPin,
  TbMessage,
  TbPhone,
  TbReceipt,
  TbScale,
  TbSearch,
  TbShieldCheck,
  TbShoppingCart,
  TbTarget,
  TbUsers,
  TbUsersGroup,
} from 'react-icons/tb';
import type { IconName } from '@/types';

/**
 * Icon registry.
 *
 * Content JSON stores an icon *name* rather than a component, so the data files
 * stay serialisable and editable by non-developers. Adding an icon means adding
 * a key here and to `IconName` in `types/index.ts` — the compiler enforces that
 * the two stay in step.
 *
 * Tabler's thin line weight suits the restrained aesthetic better than a filled set.
 */
const registry = {
  scale: TbScale,
  gavel: TbGavel,
  shield: TbShieldCheck,
  building: TbBuildingSkyscraper,
  family: TbUsersGroup,
  heartBroken: TbHeartBroken,
  home: TbHome,
  briefcase: TbBriefcase,
  cart: TbShoppingCart,
  hardHat: TbHelmet,
  cheque: TbFileInvoice,
  handshake: TbUsers,
  monitor: TbDeviceDesktop,
  lightbulb: TbBulb,
  receipt: TbReceipt,
  bank: TbBuildingBank,
  key: TbKey,
  clock: TbClock,
  lock: TbLock,
  chat: TbMessage,
  award: TbAward,
  users: TbUsers,
  check: TbCheck,
  phone: TbPhone,
  mail: TbMail,
  pin: TbMapPin,
  document: TbFileDescription,
  search: TbSearch,
  target: TbTarget,
} as const satisfies Record<IconName, unknown>;

interface IconProps {
  name: IconName;
  className?: string;
  /** Decorative by default; pass a label when the icon carries meaning alone. */
  label?: string;
}

export function Icon({ name, className = 'h-6 w-6', label }: IconProps) {
  const Glyph = registry[name];

  return (
    <Glyph
      className={className}
      strokeWidth={1.5}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
