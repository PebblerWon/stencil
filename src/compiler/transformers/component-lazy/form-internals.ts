import ts from 'typescript';

import type * as d from '@stencil/core/declarations';
import { HOST_REF_ARG } from './constants';

/**
 * Create a binding for an `ElementInternals` object compatible with a
 * lazy-load ready Stencil component.
 *
 * In order to create a lazy-loaded form-associated component we need to access
 * the underlying host element (via the the "$hostElement$" prop on {@link d.hostRef})
 * to make the `attachInternals` call on the right element. This means that the
 * code generated by this function depends on their being a variable in scope
 * called {@link HOST_REF_ARG} with type {@link HTMLElement}.
 *
 * @param cmp metadata about the component of interest, gathered during compilation
 * @returns a list of expression statements
 */
export function createLazyFormInternalsBinding(cmp: d.ComponentCompilerMeta): ts.ExpressionStatement[] {
  if (cmp.formAssociated && cmp.formInternalsProp) {
    return [
      ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            // use the name set on the {@link d.ComponentCompilerMeta}
            ts.factory.createIdentifier(cmp.formInternalsProp),
          ),
          ts.factory.createToken(ts.SyntaxKind.EqualsToken),
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier(HOST_REF_ARG),
                ts.factory.createIdentifier('$hostElement$'),
              ),
              ts.factory.createIdentifier('attachInternals'),
            ),
            undefined,
            [],
          ),
        ),
      ),
    ];
  } else {
    return [];
  }
}
