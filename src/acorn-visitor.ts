import * as acorn from "acorn";
import { BlockStatement, ReturnStatement } from "./node-generator";
import type { RunOptions, VisitorFn } from "./executor";
import { AsyncFunction, generateVarName } from "./utils";
import operatorOverloading from "./visitors/operator-overloading";
import moduleDeclaration from "./visitors/module-declaration";

export interface ExportedValue {
  declaration: any;
  exported?: any;
  spread?: boolean;
}

export class AcornVisitor {
  scope: Record<string, any> = {};
  exports: ExportedValue[] = [];
  identifiers: Set<string> = new Set();
  importFnName = "";
  unaryFnName = "";
  binaryFnName = "";
  isAsync = false;

  readonly myVisitors: Record<string, VisitorFn> = {
    ...operatorOverloading,
    ...moduleDeclaration,
    afterProgram,
    afterAwaitExpression(this: AcornVisitor) {
      this.isAsync = true;
    },
    afterIdentifier(this: AcornVisitor, node: acorn.Identifier) {
      this.identifiers.add(node.name);
    },
  } as any;

  constructor(readonly options: RunOptions) {
    if (options.isAsync) {
      this.isAsync = true;
    }

    if (typeof options.importer === "function") {
      const importer = this.options.importer!;
      this.isAsync = this.isAsync || importer instanceof AsyncFunction;
      this.importFnName = generateVarName();
      this.scope[this.importFnName] = importer;
    }
  }

  visit(this: AcornVisitor, node: acorn.Node, parent?: acorn.Node) {
    this.handleBeforeNodeVisitors(node, parent);

    // Visit children
    for (const item of Object.values(node)) {
      if (item?.type) this.visit(item, node);

      if (Array.isArray(item)) {
        for (const subnode of item) {
          if (subnode?.type) this.visit(subnode, node);
        }
      }
    }

    this.handleAfterNodeVisitors(node, parent);
  }

  private handleNodeVisitors(
    this: AcornVisitor,
    prefix: string,
    node: acorn.Node,
    parent: acorn.Node | undefined,
  ) {
    // Handle `afterNode` visitors
    const visitorFnName = prefix + node.type;

    const userFnVisitor =
      this.options.customVisitors?.[visitorFnName] ??
      this.options.customVisitors?.afterDefault;
    userFnVisitor && userFnVisitor.call(this, node, parent);

    const myFnVisitor = this.myVisitors[visitorFnName] ?? (() => {});
    myFnVisitor.call(this, node, parent);
  }

  private handleAfterNodeVisitors(
    this: AcornVisitor,
    node: acorn.Node,
    parent: acorn.Node | undefined,
  ) {
    // Handle `afterNode` visitors
    const afterNodeKey = "after" + node.type;

    const userAfterNode =
      this.options.customVisitors?.[afterNodeKey] ??
      this.options.customVisitors?.afterDefault;
    userAfterNode && userAfterNode.call(this, node, parent);

    const myAfterNode = this.myVisitors[afterNodeKey] ?? (() => {});
    myAfterNode.call(this, node, parent);
  }

  private handleBeforeNodeVisitors(
    this: AcornVisitor,
    node: acorn.Node,
    parent: acorn.Node | undefined,
  ) {
    // Handle `beforeNode` visitors
    const beforeNodeKey = "before" + node.type;

    const userBeforeNode =
      this.options.customVisitors?.[beforeNodeKey] ??
      this.options.customVisitors?.beforeDefault;
    userBeforeNode && userBeforeNode.call(this, node, parent);

    const myBeforeNode = this.myVisitors[beforeNodeKey as any] ?? (() => {});
    myBeforeNode.call(this, node, parent);
  }
}

function afterProgram(this: AcornVisitor, node: any, parent?: acorn.Node) {
  if (parent) return;

  node.type = "BlockStatement";
  node.body.push(
    ReturnStatement({
      type: "ObjectExpression",
      properties: this.exports.map(
        ({ declaration: value, exported: key, spread }) =>
          spread
            ? {
                type: "SpreadElement",
                argument: value,
              }
            : {
                type: "Property",
                key,
                value,
                shorthand: key?.type === "Identifier" && key === value,
              },
      ),
    } as any),
  );
}
