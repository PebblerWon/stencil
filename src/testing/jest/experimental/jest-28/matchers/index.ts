import { toEqualAttribute, toEqualAttributes, toHaveAttribute } from './attributes';
import {
  toHaveReceivedEvent,
  toHaveReceivedEventDetail,
  toHaveReceivedEventTimes,
  toHaveFirstReceivedEventDetail,
  toHaveNthReceivedEventDetail,
} from './events';
import { toEqualHtml, toEqualLightHtml } from './html';
import { toEqualText } from './text';
import { toHaveClass, toHaveClasses, toMatchClasses } from './class-list';

// TODO: SHould this be an object? IDK ATM
export const expectExtend = {
  toEqualAttribute,
  toEqualAttributes,
  toEqualHtml,
  toEqualLightHtml,
  toEqualText,
  toHaveAttribute,
  toHaveClass,
  toHaveClasses,
  toMatchClasses,
  toHaveReceivedEvent,
  toHaveReceivedEventDetail,
  toHaveReceivedEventTimes,
  toHaveFirstReceivedEventDetail,
  toHaveNthReceivedEventDetail,
};
