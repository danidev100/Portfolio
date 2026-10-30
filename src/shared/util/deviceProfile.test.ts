import { isPhoneFlavor, resolveDeviceProfile, type DeviceHints } from './deviceProfile';

const IPHONE: DeviceHints = { deviceType: 'mobile', osName: 'iOS', isBot: false };
const ANDROID_PHONE: DeviceHints = { deviceType: 'mobile', osName: 'Android', isBot: false };
const COMPUTER: DeviceHints = { deviceType: undefined, osName: undefined, isBot: false };

describe('resolveDeviceProfile', () => {
  it('gives an iphone the ios phone', () => {
    expect(resolveDeviceProfile(IPHONE, undefined)).toBe('ios');
  });

  it('gives an android phone the android phone', () => {
    expect(resolveDeviceProfile(ANDROID_PHONE, undefined)).toBe('android');
  });

  it('gives other phones the android phone', () => {
    expect(
      resolveDeviceProfile({ deviceType: 'mobile', osName: 'KaiOS', isBot: false }, undefined),
    ).toBe('android');
  });

  it('keeps tablets on the desktop', () => {
    expect(
      resolveDeviceProfile({ deviceType: 'tablet', osName: 'iOS', isBot: false }, undefined),
    ).toBe('desktop');
  });

  it('keeps android tablets on the desktop', () => {
    expect(
      resolveDeviceProfile({ deviceType: 'tablet', osName: 'Android', isBot: false }, undefined),
    ).toBe('desktop');
  });

  it('keeps an ipad that announces itself as a mac on the desktop', () => {
    expect(
      resolveDeviceProfile({ deviceType: undefined, osName: 'Mac OS', isBot: false }, undefined),
    ).toBe('desktop');
  });

  it('keeps crawlers with a phone user agent on the desktop', () => {
    expect(resolveDeviceProfile({ ...IPHONE, isBot: true }, undefined)).toBe('desktop');
    expect(resolveDeviceProfile({ ...ANDROID_PHONE, isBot: true }, undefined)).toBe('desktop');
  });

  it('keeps an unknown device on the desktop', () => {
    expect(resolveDeviceProfile(COMPUTER, undefined)).toBe('desktop');
  });

  it('previews the phone on a computer', () => {
    expect(resolveDeviceProfile(COMPUTER, 'ios')).toBe('ios');
  });

  it('previews the android phone on a computer', () => {
    expect(resolveDeviceProfile(COMPUTER, 'android')).toBe('android');
  });

  it('previews the desktop on an iphone', () => {
    expect(resolveDeviceProfile(IPHONE, 'desktop')).toBe('desktop');
  });

  it.each(['foo', ''])('ignores the %p override and asks the user agent', (override) => {
    expect(resolveDeviceProfile(IPHONE, override)).toBe('ios');
  });
});

describe('isPhoneFlavor', () => {
  it('tells a phone flavor from the desktop', () => {
    expect(isPhoneFlavor('ios')).toBe(true);
    expect(isPhoneFlavor('android')).toBe(true);
    expect(isPhoneFlavor('desktop')).toBe(false);
  });
});
