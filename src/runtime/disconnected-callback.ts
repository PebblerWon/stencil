import { BUILD } from '@app-data';
import { getHostRef, plt } from '@platform';

import type * as d from '../declarations';
import { PLATFORM_FLAGS } from './runtime-constants';
import { safeCall } from './update-component';

const disconnectInstance = (instance: any) => {
  if (BUILD.lazyLoad && BUILD.disconnectedCallback) {
    safeCall(instance, 'disconnectedCallback');
  }
  if (BUILD.cmpDidUnload) {
    safeCall(instance, 'componentDidUnload');
  }
};

export const disconnectedCallback = async (elm: d.HostElement) => {
  if ((plt.$flags$ & PLATFORM_FLAGS.isTmpDisconnected) === 0) {
    const hostRef = getHostRef(elm);

    if (BUILD.hostListener) {
      if (hostRef.$rmListeners$) {
        hostRef.$rmListeners$.map((rmListener) => rmListener());
        console.log(hostRef.$rmListeners$);
        hostRef.$rmListeners$ = undefined;
      }
    }
    console.log(hostRef.$rmListeners$);


    if (!BUILD.lazyLoad) {
      disconnectInstance(elm);
    } else if (hostRef?.$lazyInstance$) {
      disconnectInstance(hostRef.$lazyInstance$.deref());
    } else if (hostRef?.$onReadyPromise$) {
      hostRef.$onReadyPromise$.then(() => disconnectInstance(hostRef.$lazyInstance$.deref()));
    }
  }
};
