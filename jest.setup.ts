import '@testing-library/jest-dom';
import { MotionGlobalConfig } from 'motion/react';

// Animations resolve instantly so tests never wait for a transition to end.
MotionGlobalConfig.skipAnimations = true;

// jsdom cannot navigate: cancelling the default action keeps link clicks from
// logging "Not implemented: navigation".
document.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
});
