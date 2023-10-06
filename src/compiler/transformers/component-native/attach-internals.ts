import type * as d from '@stencil/core/declarations';
import ts from 'typescript';

/**
 * Create a binding for an `ElementInternals` object compatible with a 'native'
 * component (i.e. one which extends `HTMLElement` and is distributed as a
 * standalone custom element).
 *
 * Since a 'native' custom element will extend `HTMLElement` we can call
 * `this.attachInternals` directly, binding it to the name annotated by the
 * developer with the `@AttachInternals` decorator.
 *
 * @param cmp metadata about the component of interest, gathered during
 * compilation
 * @returns an expression statement syntax tree node
 */
export function createNativeAttachInternalsBinding(cmp: d.ComponentCompilerMeta): ts.ExpressionStatement[] {
  if (cmp.formAssociated && cmp.attachInternalsMemberName) {
    // if an `@AttachInternals` decorator is present on a component like this:
    //
    // ```ts
    // @AttachInternals()
    // internals: ElementInternals;
    // ```
    //
    // then these `ts.factory` calls will produce the following:
    //
    // ```ts
    // this.internals = this.attachInternals();
    // ```
    return [
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
              ts.factory.createThis(),
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