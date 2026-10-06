import { createOnboardingStorage, ONBOARDING_STORAGE_KEY } from './onboardingStorage';

const failingStorage = (): Storage => {
  throw new Error('Storage is blocked');
};

describe('createOnboardingStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('has not seen the tour on a first visit', () => {
    expect(createOnboardingStorage().hasSeenTour()).toBe(false);
  });

  it('remembers that the tour was seen', () => {
    createOnboardingStorage().markTourSeen();

    expect(window.localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('seen');
    expect(createOnboardingStorage().hasSeenTour()).toBe(true);
  });

  describe('when the storage is blocked', () => {
    let warn: jest.SpyInstance;

    beforeEach(() => {
      warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warn.mockRestore();
    });

    it('treats the tour as not seen, and says why', () => {
      expect(createOnboardingStorage(failingStorage).hasSeenTour()).toBe(false);
      expect(warn).toHaveBeenCalled();
    });

    it('does not break when saving, and says why', () => {
      expect(() => {
        createOnboardingStorage(failingStorage).markTourSeen();
      }).not.toThrow();
      expect(warn).toHaveBeenCalled();
    });
  });
});
