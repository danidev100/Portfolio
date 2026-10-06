/** Versioned, so a tour that changes a lot can be shown again to everyone. */
export const ONBOARDING_STORAGE_KEY = 'dani-os:onboarding:v1';
const SEEN = 'seen';

export interface OnboardingStorage {
  hasSeenTour: () => boolean;
  markTourSeen: () => void;
}

/**
 * Remembers whether the visitor has seen the onboarding tour. Storage can be
 * blocked (private browsing, disabled cookies): then the tour shows on every
 * visit, which is the safe side, and the reason is logged.
 */
export function createOnboardingStorage(
  getStorage: () => Storage = () => window.localStorage,
): OnboardingStorage {
  return {
    hasSeenTour: () => {
      try {
        return getStorage().getItem(ONBOARDING_STORAGE_KEY) === SEEN;
      } catch (error) {
        console.warn('Could not read whether the onboarding tour was seen', error);

        return false;
      }
    },
    markTourSeen: () => {
      try {
        getStorage().setItem(ONBOARDING_STORAGE_KEY, SEEN);
      } catch (error) {
        console.warn('Could not remember that the onboarding tour was seen', error);
      }
    },
  };
}

export const browserOnboardingStorage: OnboardingStorage = createOnboardingStorage();
