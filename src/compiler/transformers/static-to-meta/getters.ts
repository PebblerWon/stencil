import ts from 'typescript';

import type * as d from '../../../declarations';
import { getStaticValue, isInternal } from '../transform-utils';

// TODO(): Gotta this up, otherwise conditionals alllllll the way in `proxyComponent` will not work
export const parseStaticGetters = (staticMembers: ts.ClassElement[]): d.ComponentCompilerMethod[] => {
  const parsedMethods: { [key: string]: d.ComponentCompilerStaticMethod } = getStaticValue(staticMembers, 'getters');
  if (!parsedMethods) {
    return [];
  }

  const methodNames = Object.keys(parsedMethods);
  if (methodNames.length === 0) {
    return [];
  }

  return methodNames.map((methodName) => {
    return {
      name: methodName,
      docs: parsedMethods[methodName].docs,
      complexType: parsedMethods[methodName].complexType,
      internal: isInternal(parsedMethods[methodName].docs),
    };
  });
};
