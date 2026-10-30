/** Phone flavors that ship. Delivery 2 adds `'android'`. */
export const PHONE_FLAVORS = ['ios'] as const;

export type PhoneFlavor = (typeof PHONE_FLAVORS)[number];

export type DeviceProfile = 'desktop' | PhoneFlavor;

/** `?device=ios` previews the phone on a computer; `?device=desktop`, the other way round. */
export const DEVICE_PARAM = 'device';

/** What the user agent says, as `userAgent()` from `next/server` parses it. */
export interface DeviceHints {
  deviceType: string | undefined;
  osName: string | undefined;
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
 */
export function resolveDeviceProfile(
  hints: DeviceHints,
  override: string | undefined,
): DeviceProfile {
  if (isDeviceProfile(override)) return override;
  if (hints.deviceType === 'mobile' && hints.osName === 'iOS') return 'ios';

  return 'desktop';
}
