import * as acorn from "acorn";
import { generateVarName } from "./utils";
import { bottomUpWalk } from "estree-walk-plus";
import { AwaitExpression, Identifier, Program } from "./walkCallbacks/generic";
import * as OperatorOverloading from "./walkCallbacks/operator-overloading";
import * as ModuleDeclaration from "./walkCallbacks/module-declaration";
import { RunOptions } from "./types";

export class Transformer {
  constructor(readonly options: RunOptions) {}

  transform(node: acorn.Node) {
    return bottomUpWalk(
      node,
      {
        Program,
        AwaitExpression,
        Identifier,

        // Operator overloading
        ...OperatorOverloading,

        // Module declaration
        ...ModuleDeclaration,
      },
      {
        state: {
          options: this.options,
          exports: [],
          identifiers: new Set<string>(),
          importFnName: generateVarName(),
          unaryFnName: generateVarName(),
          binaryFnName: generateVarName(),
          importFnUsed: false,
          unaryFnUsed: false,
          binaryFnUsed: false,
          hasAwait: false,
        },
      },
    );
  }
}
