import type * as d from '@stencil/core/declarations';
import ts from 'typescript';

import { HOST_REF_ARG } from './constants';

/**
 * Create a binding for an `ElementInternals` object compatible with a
 * lazy-load ready Stencil component.
 *
 * In order to create a lazy-loaded form-associated component we need to access
 * the underlying host element (via the "$hostElement$" prop on {@link d.hostRef})
 * to make the `attachInternals` call on the right element. This means that the
 * code generated by this function depends on there being a variable in scope
 * called {@link HOST_REF_ARG} with type {@link HTMLElement}.
 *
 *
 * If an `@AttachInternals` decorator is present on a component like this:
 *
 * ```ts
 * @AttachInternals()
 * internals: ElementInternals;
 * ```
 *
 * then this transformer will create syntax nodes which represent the
 * following TypeScript source:
 *
 * ```ts
 * if (hostRef.$hostElement$["s-ei"]) {
 *   this.internals = hostRef.$hostElement$["s-ei"];
 * } else {
 *   this.internals = hostRef.$hostElement$.attachInternals();
 *   hostRef.$hostElement$["s-ei"] = this.internals;
 * }
 * ```
 *
 * The `"s-ei"` prop on a {@link d.HostElement} may hold a reference to the
 * `ElementInternals` instance for that host. We store a reference to it
 * there in order to support HMR because `.attachInternals` may only be
 * called on an `HTMLElement` one time, so we need to store a reference to
 * the returned value across HMR updates.
 *
 * @param cmp metadata about the component of interest, gathered during compilation
 * @returns a list of expression statements
 */
export function createLazyAttachInternalsBinding(cmp: d.ComponentCompilerMeta): ts.Statement[] {
  if (cmp.formAssociated && cmp.attachInternalsMemberName) {
    return [
      ts.factory.createIfStatement(
        // hostRef.$hostElement$["s-ei"]
        hostRefElementInternalsPropAccess(),
        ts.factory.createBlock(
          [
            // this `ts.factory` call creates the following statement:
            //
            // ```ts
            // this.${ cmp.formInternalsMemberName } = hostRef.$hostElement$['s-ei'];
            // ```
            ts.factory.createExpressionStatement(
              ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createThis(),
                  // use the name set on the {@link d.ComponentCompilerMeta}
                  ts.factory.createIdentifier(cmp.attachInternalsMemberName),
                ),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                hostRefElementInternalsPropAccess(),
              ),
            ),
          ],
          true,
        ),
        ts.factory.createBlock(
          [
            // this `ts.factory` call creates the following statement:
            //
            // ```ts
            // this.${ cmp.attachInternalsMemberName } = hostRef.$hostElement$.attachInternals();
            // ```
            ts.factory.createExpressionStatement(
              ts.factory.createBinaryExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createThis(),
                  // use the name set on the {@link d.ComponentCompilerMeta}
                  ts.factory.createIdentifier(cmp.attachInternalsMemberName),
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
            // this `ts.factory` call produces thefollowing:
            //
            // ```ts
            // hostRef.$hostElement$['s-ei'] = this.${ cmp.attachInternalsMemberName };
            // ```
            ts.factory.createExpressionStatement(
              ts.factory.createBinaryExpression(
                hostRefElementInternalsPropAccess(),
                ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createThis(),
                  // use the name set on the {@link d.ComponentCompilerMeta}
                  ts.factory.createIdentifier(cmp.attachInternalsMemberName),
                ),
              ),
            ),
          ],
          true,
        ),
      ),
    ];
  } else {
    return [];
  }
}

/**
 * Create TS syntax nodes which represent accessing the `"s-ei"` (stencil
 * element internals) property on `$hostElement$` (a {@link d.HostElement}) on a
 * {@link d.HostRef} element which is called {@link HOST_REF_ARG}.
 *
 * The corresponding TypeScript source will look like:
 *
 * ```ts
 * hostRef.$hostElement$["s-ei"]
 * ```
 *
 * @returns TS syntax nodes
 */
function hostRefElementInternalsPropAccess(): ts.ElementAccessExpression {
  return ts.factory.createElementAccessExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier(HOST_REF_ARG),
      ts.factory.createIdentifier('$hostElement$'),
    ),
    ts.factory.createStringLiteral('s-ei'),
  );
}
