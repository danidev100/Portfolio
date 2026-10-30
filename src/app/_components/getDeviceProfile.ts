import { headers } from 'next/headers';
import { userAgent } from 'next/server';

import {
  DEVICE_PARAM,
  resolveDeviceProfile,
  type DeviceProfile,
} from '@/shared/util/deviceProfile';

export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Decided on the server so the first HTML is already the right shell: deciding
 * in the browser would flash the desktop and then swap it for the phone.
 */
export async function getDeviceProfile(
  searchParams: Promise<SearchParams>,
): Promise<DeviceProfile> {
  const { device, os, isBot } = userAgent({ headers: await headers() });
  const override = (await searchParams)[DEVICE_PARAM];

  return resolveDeviceProfile(
    { deviceType: device.type, osName: os.name, isBot },
    Array.isArray(override) ? override[0] : override,
  );
}
