/** Phone flavors that ship: each one reaches its phones once all its screens exist. */
export const PHONE_FLAVORS = ['ios', 'android'] as const;

export type PhoneFlavor = (typeof PHONE_FLAVORS)[number];

export type DeviceProfile = 'desktop' | PhoneFlavor;

/** `?device=ios|android` previews the phone on a computer; `?device=desktop`, the other way round. */
export const DEVICE_PARAM = 'device';

/** What the user agent says, as `userAgent()` from `next/server` parses it. */
export interface DeviceHints {
  deviceType: string | undefined;
  osName: string | undefined;
  isBot: boolean;
}

const PROFILES: readonly DeviceProfile[] = ['desktop', ...PHONE_FLAVORS];

function isDeviceProfile(value: string | undefined): value is DeviceProfile {
  return PROFILES.some((profile) => profile === value);
}

export function isPhoneFlavor(profile: DeviceProfile): profile is PhoneFlavor {
  return profile !== 'desktop';
}

/**
 * Which shell a visitor gets. Only phones get a phone: tablets keep the
 * desktop, which works on them, and iPadOS announces itself as a Mac anyway.
 * Crawlers get the desktop too, whatever phone they pretend to be. A phone
 * that is neither iOS nor Android gets the android phone.
 */
export function resolveDeviceProfile(
  hints: DeviceHints,
  override: string | undefined,
): DeviceProfile {
  if (isDeviceProfile(override)) return override;
  if (hints.isBot || hints.deviceType !== 'mobile') return 'desktop';

  return hints.osName === 'iOS' ? 'ios' : 'android';
}
