import * as acorn from "acorn";
import {
  AwaitExpression,
  CallExpression,
  Identifier,
  Literal,
} from "../node-generator";
import { StepInfo } from "estree-walk-plus";
import { AsyncFunction, generateVarName } from "../utils";

function importFnCall(
  src: acorn.Literal,
  state: any,
): acorn.AwaitExpression | acorn.CallExpression {
  if (typeof state.options.importFunction !== "function")
    throw new Error(
      "import statement is not allowed without an importFunction",
    );

  const importFunctionIsAsync =
    state.options.importFunction instanceof AsyncFunction;

  state.importFnUsed = true;
  if (importFunctionIsAsync) {
    state.hasAwait = true;
  }

  const fnCall = CallExpression(Identifier(state.importFnName), [src]);
  return importFunctionIsAsync ? AwaitExpression(fnCall) : fnCall;
}

/**
 * export interface ImportDeclaration extends Node {
 *   type: "ImportDeclaration"
 *   specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>
 *   source: Literal
 * }
 * */
export const ImportDeclaration = (step: StepInfo, state: any) => {
  const realFnCall = importFnCall(step._node.source, state);

  if (step._node.specifiers.length === 0) {
    throw new Error("Empty import statement is not allowed");
  }

  if (
    step._node.specifiers.length === 1 &&
    step._node.specifiers[0].type === "ImportNamespaceSpecifier"
  ) {
    step.replaceWith({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: Identifier(step._node.specifiers[0].local.name),
          init: realFnCall,
        },
      ],
    } as any);
    return;
  }

  const properties: acorn.Property[] = [];
  for (const specifier of step._node.specifiers) {
    switch (specifier.type) {
      case "ImportDefaultSpecifier":
        properties.push({
          type: "Property",
          key: Literal("default"),
          value: specifier.local,
        } as acorn.Property);
        break;
      case "ImportSpecifier":
        properties.push({
          type: "Property",
          key: specifier.imported,
          value: specifier.local,
        } as acorn.Property);
        break;
      default:
        throw new Error(`Unknown import specifier type: ${specifier.type}`);
    }
  }

  step.replaceWith({
    type: "VariableDeclaration",
    kind: "const",
    declarations: [
      {
        type: "VariableDeclarator",
        id: {
          type: "ObjectPattern",
          properties,
        },
        init: realFnCall,
      },
    ],
  } as any);
};

export const ExportNamedDeclaration = (step: StepInfo, state: any) => {
  if (state.options.returns !== "exports")
    throw new Error(
      "export statement is not allowed when returns is not 'exports'",
    );

  if (step._node.source) {
    const realFnCall = importFnCall(step._node.source, state);

    const declarations: any[] = [];
    for (const specifier of step._node.specifiers) {
      const varName = generateVarName();
      declarations.push({
        type: "Property",
        key: specifier.local,
        value: Identifier(varName),
      });
      state.exports.push({
        declaration: Identifier(varName),
        exported: specifier.exported,
      });
    }

    step.replaceWith({
      type: "VariableDeclaration",
      kind: "const",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "ObjectPattern",
            properties: declarations,
          },
          init: realFnCall,
        },
      ],
    } as any);
  } else if (step._node.declaration) {
    switch (step._node.declaration.type) {
      case "VariableDeclaration":
        for (const declaration of step._node.declaration.declarations) {
          switch (declaration.id.type) {
            case "Identifier":
              state.exports.push({
                declaration: declaration.id,
                exported: declaration.id,
              });
              break;
            case "ObjectPattern":
              for (const prop of declaration.id.properties) {
                if (prop.type === "Property") {
                  state.exports.push({
                    declaration: prop.key,
                    exported: prop.key,
                  });
                } else {
                  state.exports.push({
                    declaration: prop.argument,
                    exported: prop.argument,
                  });
                }
              }
              break;
            case "ArrayPattern":
              for (const elem of declaration.id.elements) {
                switch (elem?.type) {
                  case "Identifier":
                    state.exports.push({
                      declaration: elem,
                      exported: elem,
                    });
                    break;
                  case "AssignmentPattern":
                    state.exports.push({
                      declaration: elem.left,
                      exported: elem.left,
                    });
                    break;
                  case "RestElement":
                    state.exports.push({
                      declaration: elem.argument,
                      exported: elem.argument,
                    });
                    break;
                  default:
                    throw new Error(
                      `Unknown ArrayPattern element type: "${elem.type}"`,
                    );
                }
              }
              break;
            default:
              throw new Error(`Unknown declaration: "${declaration.id.type}"`);
          }
        }
        break;
      case "FunctionDeclaration":
      case "ClassDeclaration":
        state.exports.push({
          declaration: step._node.declaration.id,
          exported: step._node.declaration.id,
        });
        break;
    }
    step.replaceWith(step._node.declaration);
  } else if (step._node.specifiers) {
    for (let specifier of step._node.specifiers) {
      state.exports.push({
        declaration: specifier.local,
        exported: specifier.exported,
      });
    }
    step.replaceWith({ type: "EmptyStatement" } as any);
  }
};

/**
 * Treat `export default value` as if it's `export const default = value`
 */
export const ExportDefaultDeclaration = (step: StepInfo, state: any) => {
  if (state.options.returns !== "exports")
    throw new Error(
      "export statement is not allowed when returns is not 'exports'",
    );

  state.exports.push({
    declaration: step._node.declaration,
    exported: Identifier("default"),
  });
  step.replaceWith({ type: "EmptyStatement" } as any);
};

export const ExportAllDeclaration = (step: StepInfo, state: any) => {
  if (state.options.returns !== "exports")
    throw new Error(
      "export statement is not allowed when returns is not 'exports'",
    );

  const realFnCall = importFnCall(step._node.source, state);

  if (step._node.exported) {
    state.exports.push({
      declaration: realFnCall,
      exported: step._node.exported,
    });
  } else {
    state.exports.push({
      declaration: realFnCall,
      spread: true,
    });
  }

  step.replaceWith({ type: "EmptyStatement" } as any);
};
