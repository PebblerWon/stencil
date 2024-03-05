import { BUILD } from '@app-data';
import { consoleDevWarn, plt } from '@platform';
import { EVENT_FLAGS } from '@utils';

import type * as d from '../declarations';
import { getElement } from './element';

export const createEvent = (ref: d.RuntimeRef, name: string, flags: number) => {
  // we can't have these event creators holding a strong reference to an
  // element in closure
  const elmRef = new WeakRef(getElement(ref) as HTMLElement);
  return {
    emit: (detail: any) => {
      const deref = elmRef.deref();
      if (!deref) {
        // GC got here first
        return undefined;
      }
      if (BUILD.isDev && !deref.isConnected) {
        consoleDevWarn(`The "${name}" event was emitted, but the dispatcher node is no longer connected to the dom.`);
      }
      return emitEvent(deref, name, {
        bubbles: !!(flags & EVENT_FLAGS.Bubbles),
        composed: !!(flags & EVENT_FLAGS.Composed),
        cancelable: !!(flags & EVENT_FLAGS.Cancellable),
        detail,
      });
    },
  };
};

/**
 * Helper function to create & dispatch a custom Event on a provided target
 * @param elm the target of the Event
 * @param name the name to give the custom Event
 * @param opts options for configuring a custom Event
 * @returns the custom Event
 */
export const emitEvent = (elm: EventTarget, name: string, opts?: CustomEventInit) => {
  const ev = plt.ce(name, opts);
  elm.dispatchEvent(ev);
  return ev;
};
