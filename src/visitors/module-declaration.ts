import * as acorn from "acorn";
import {
  AwaitExpression,
  CallExpression,
  Identifier,
  Literal,
} from "../node-generator";
import { AcornVisitor } from "../acorn-visitor";
import { generateVarName } from "../utils";

export function importFnCall(
  av: AcornVisitor,
  src: acorn.Literal,
): acorn.AwaitExpression | acorn.CallExpression {
  if (typeof av.options.importer !== "function")
    throw new Error(
      "import statement is not allowed without an importer function",
    );

  const fnCall = CallExpression(Identifier(av.importFnName), [src]);
  return av.isAsync ? AwaitExpression(fnCall) : fnCall;
}

export default {
  /**
   * export interface ImportDeclaration extends Node {
   *   type: "ImportDeclaration"
   *   specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>
   *   source: Literal
   * }
   * */
  afterImportDeclaration(this: AcornVisitor, node: acorn.ImportDeclaration) {
    const realFnCall = importFnCall(this, node.source);

    if (node.specifiers.length === 0) {
      throw new Error("Empty import statement is not allowed");
    }

    if (
      node.specifiers.length === 1 &&
      node.specifiers[0].type === "ImportNamespaceSpecifier"
    ) {
      Object.assign(node, {
        type: "VariableDeclaration",
        kind: "const",
        declarations: [
          {
            type: "VariableDeclarator",
            id: Identifier(node.specifiers[0].local.name),
            init: realFnCall,
          },
        ],
      });
      return;
    }

    const properties: acorn.Property[] = [];
    for (const specifier of node.specifiers) {
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

    Object.assign(node, {
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
    });
  },

  afterExportNamedDeclaration(
    this: AcornVisitor,
    node: acorn.ExportNamedDeclaration,
  ) {
    if (this.options.returns !== "exports")
      throw new Error(
        "export statement is not allowed when returns is not 'exports'",
      );

    if (node.source) {
      const realFnCall = importFnCall(this, node.source);

      const declarations: any[] = [];
      for (const specifier of node.specifiers) {
        const varName = generateVarName();
        declarations.push({
          type: "Property",
          key: specifier.local,
          value: Identifier(varName),
        });
        this.exports.push({
          declaration: Identifier(varName),
          exported: specifier.exported,
        });
      }

      Object.assign(node, {
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
      });
    } else if (node.declaration) {
      switch (node.declaration.type) {
        case "VariableDeclaration":
          for (const declaration of node.declaration.declarations) {
            switch (declaration.id.type) {
              case "Identifier":
                this.exports.push({
                  declaration: declaration.id,
                  exported: declaration.id,
                });
                break;
              case "ObjectPattern":
                for (const prop of declaration.id.properties) {
                  if (prop.type === "Property") {
                    this.exports.push({
                      declaration: prop.key,
                      exported: prop.key,
                    });
                  } else {
                    this.exports.push({
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
                      this.exports.push({
                        declaration: elem,
                        exported: elem,
                      });
                      break;
                    case "AssignmentPattern":
                      this.exports.push({
                        declaration: elem.left,
                        exported: elem.left,
                      });
                      break;
                    case "RestElement":
                      this.exports.push({
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
                throw new Error(
                  `Unknown declaration: "${declaration.id.type}"`,
                );
            }
          }
          break;
        case "FunctionDeclaration":
        case "ClassDeclaration":
          this.exports.push({
            declaration: node.declaration.id,
            exported: node.declaration.id,
          });
          break;
      }
      Object.assign(node, node.declaration);
    } else if (node.specifiers) {
      for (let specifier of node.specifiers) {
        this.exports.push({
          declaration: specifier.local,
          exported: specifier.exported,
        });
      }
      Object.assign(node, { type: "EmptyStatement" });
    }
  },

  /**
   * Treat `export default value` as if it's `export const default = value`
   */
  afterExportDefaultDeclaration(
    this: AcornVisitor,
    node: acorn.ExportDefaultDeclaration,
  ) {
    if (this.options.returns !== "exports")
      throw new Error(
        "export statement is not allowed when returns is not 'exports'",
      );

    this.exports.push({
      declaration: node.declaration,
      exported: Identifier("default"),
    });
    Object.assign(node, { type: "EmptyStatement" });
  },

  afterExportAllDeclaration(
    this: AcornVisitor,
    node: acorn.ExportAllDeclaration,
  ) {
    if (this.options.returns !== "exports")
      throw new Error(
        "export statement is not allowed when returns is not 'exports'",
      );

    const realFnCall = importFnCall(this, node.source);

    if (node.exported) {
      this.exports.push({
        declaration: realFnCall,
        exported: node.exported,
      });
    } else {
      this.exports.push({
        declaration: realFnCall,
        spread: true,
      });
    }

    Object.assign(node, { type: "EmptyStatement" });
  },
};
