import '@testing-library/jest-dom';
import { MotionGlobalConfig } from 'motion/react';

// Animations resolve instantly so tests never wait for a transition to end.
MotionGlobalConfig.skipAnimations = true;

// jsdom cannot navigate: cancelling the default action keeps link clicks from
// logging "Not implemented: navigation". Server tests run in node, without a DOM.
if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
  });
}

// jsdom has <dialog> but not its modal methods.
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    this.removeAttribute('open');
  };
}
