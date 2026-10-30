import { isPhoneFlavor, resolveDeviceProfile, type DeviceHints } from './deviceProfile';

const IPHONE: DeviceHints = { deviceType: 'mobile', osName: 'iOS' };
const ANDROID_PHONE: DeviceHints = { deviceType: 'mobile', osName: 'Android' };
const COMPUTER: DeviceHints = { deviceType: undefined, osName: undefined };

describe('resolveDeviceProfile', () => {
  it('gives an iphone the ios phone', () => {
    expect(resolveDeviceProfile(IPHONE, undefined)).toBe('ios');
  });

  it('keeps android phones on the desktop until their flavor ships', () => {
    expect(resolveDeviceProfile(ANDROID_PHONE, undefined)).toBe('desktop');
  });

  it('keeps tablets on the desktop', () => {
    expect(resolveDeviceProfile({ deviceType: 'tablet', osName: 'iOS' }, undefined)).toBe(
      'desktop',
    );
  });

  it('keeps an ipad that announces itself as a mac on the desktop', () => {
    expect(resolveDeviceProfile({ deviceType: undefined, osName: 'Mac OS' }, undefined)).toBe(
      'desktop',
    );
  });

  it('keeps an unknown device on the desktop', () => {
    expect(resolveDeviceProfile(COMPUTER, undefined)).toBe('desktop');
  });

  it('previews the phone on a computer', () => {
    expect(resolveDeviceProfile(COMPUTER, 'ios')).toBe('ios');
  });

  it('previews the desktop on an iphone', () => {
    expect(resolveDeviceProfile(IPHONE, 'desktop')).toBe('desktop');
  });

  it.each(['android', 'foo', ''])('ignores the %p override and asks the user agent', (override) => {
    expect(resolveDeviceProfile(IPHONE, override)).toBe('ios');
  });
});

describe('isPhoneFlavor', () => {
  it('tells a phone flavor from the desktop', () => {
    expect(isPhoneFlavor('ios')).toBe(true);
    expect(isPhoneFlavor('desktop')).toBe(false);
  });
});
