import ts from 'typescript';

import type * as d from '../../../declarations';
import { validatePublicName } from '../reserved-public-members';
import {
  convertValueToLiteral,
  createStaticGetter,
  getAttributeTypeInfo,
  mapJSDocTagInfo,
  typeToString,
  validateReferences,
} from '../transform-utils';

export const gettersToStatic = (
  diagnostics: d.Diagnostic[],
  cmpNode: ts.ClassDeclaration,
  decoratedProps: ts.NodeArray<ts.ClassElement>,
  typeChecker: ts.TypeChecker,
  program: ts.Program,
  newMembers: ts.ClassElement[],
) => {
  const tsSourceFile = cmpNode.getSourceFile();
  const methods = decoratedProps
    .filter(ts.isGetAccessor) // TODO Unsure what the difference between isGetAccessorDeclaration is
    .map((method) => parseMethodDecorator(diagnostics, tsSourceFile, typeChecker, program, method));

  if (methods.length > 0) {
    newMembers.push(createStaticGetter('getters', ts.factory.createObjectLiteralExpression(methods, true)));
  }
};

const parseMethodDecorator = (
  diagnostics: d.Diagnostic[],
  tsSourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  program: ts.Program,
  method: ts.GetAccessorDeclaration,
): ts.PropertyAssignment | null => {
  const methodName = method.name.getText();
  const flags = ts.TypeFormatFlags.WriteArrowStyleSignature | ts.TypeFormatFlags.NoTruncation;
  const signature = typeChecker.getSignatureFromDeclaration(method);
  const returnType = typeChecker.getReturnTypeOfSignature(signature);
  const returnTypeNode = typeChecker.typeToTypeNode(
    returnType,
    method,
    ts.NodeBuilderFlags.NoTruncation | ts.NodeBuilderFlags.NoTypeReduction,
  );
  const returnString = typeToString(typeChecker, returnType);
  const signatureString = typeChecker.signatureToString(signature, method, flags, ts.SignatureKind.Call);

  // Validate if the method name does not conflict with existing public names
  validatePublicName(diagnostics, methodName, '@Method()', 'method', method.name);

  const methodMeta: d.ComponentCompilerStaticMethod = {
    complexType: {
      signature: signatureString,
      parameters: signature.parameters.map((symbol) => ({
        name: symbol.getName(),
        type: typeToString(typeChecker, typeChecker.getTypeOfSymbolAtLocation(symbol, method)),
        docs: ts.displayPartsToString(symbol.getDocumentationComment(typeChecker)),
      })),
      references: {
        ...getAttributeTypeInfo(returnTypeNode, tsSourceFile, typeChecker, program),
        ...getAttributeTypeInfo(method, tsSourceFile, typeChecker, program),
      },
      return: returnString,
    },
    docs: {
      text: ts.displayPartsToString(signature.getDocumentationComment(typeChecker)),
      tags: mapJSDocTagInfo(signature.getJsDocTags()),
    },
  };
  validateReferences(diagnostics, methodMeta.complexType.references, method.type || method.name);

  const staticProp = ts.factory.createPropertyAssignment(
    ts.factory.createStringLiteral(methodName),
    convertValueToLiteral(methodMeta),
  );

  return staticProp;
};
