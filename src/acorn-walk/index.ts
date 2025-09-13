import acorn from "acorn";

export enum Algo {
  TOP_DOWN,
  BOTTOM_UP,
}

const VISIT = {
  Program: ["body"],
  // Function: ["id", "params", "body"],  -> interface
  ExpressionStatement: ["expression"],
  BlockStatement: ["body"],
  WithStatement: ["object", "body"],
  ReturnStatement: ["argument"],
  LabeledStatement: ["label", "body"],
  BreakStatement: ["label"],
  ContinueStatement: ["label"],
  IfStatement: ["test", "consequent", "alternate"],
  SwitchStatement: ["discriminant", "cases"],
  SwitchCase: ["test", "consequent"],
  ThrowStatement: ["argument"],
  TryStatement: ["block", "handler", "finalizer"],
  CatchClause: ["param", "body"],
  WhileStatement: ["test", "body"],
  DoWhileStatement: ["body", "test"],
  ForStatement: ["init", "test", "update", "body"],
  ForInStatement: ["left", "right", "body"],
  ForOfStatement: ["left", "right", "body"],
  FunctionDeclaration: ["id", "params", "body"],
  VariableDeclaration: ["declarations"],
  VariableDeclarator: ["id", "init"],
  ArrayExpression: ["elements"],
  ObjectExpression: ["properties"],
  Property: ["key", "value"],
  FunctionExpression: ["id", "params", "body"],
  UnaryExpression: ["argument"],
  UpdateExpression: ["argument"],
  BinaryExpression: ["left", "right"],
  AssignmentExpression: ["left", "right"],
  LogicalExpression: ["left", "right"],
  MemberExpression: ["object", "property"],
  ConditionalExpression: ["test", "consequent", "alternate"],
  CallExpression: ["callee", "arguments"],
  NewExpression: ["callee", "arguments"],
  SequenceExpression: ["expressions"],
  SpreadElement: ["argument"],
  YieldExpression: ["argument"],
  TemplateLiteral: ["quasis", "expressions"],
  TaggedTemplateExpression: ["tag", "quasi"],
  // AssignmentProperty: ["key", "value"],  -> Property with kind="init" and method=false
  ObjectPattern: ["properties"],
  ArrayPattern: ["elements"],
  RestElement: ["argument"],
  AssignmentPattern: ["left", "right"],
  // Class: ["id", "superClass", "body"],  -> interface
  ClassBody: ["body"],
  MethodDefinition: ["key", "value"],
  ClassDeclaration: ["id", "superClass", "body"],
  ClassExpression: ["id", "superClass", "body"],
  MetaProperty: ["meta", "property"],
  ImportDeclaration: ["specifiers", "source"],
  ImportSpecifier: ["imported", "local"],
  ImportDefaultSpecifier: ["local"],
  ImportNamespaceSpecifier: ["local"],
  ExportNamedDeclaration: ["declaration", "specifiers", "source"],
  ExportSpecifier: ["exported", "local"],
  // AnonymousFunctionDeclaration: ["params", "body"],  -> FunctionDeclaration with id=null
  // AnonymousClassDeclaration: ["superClass", "body"],  -> ClassDeclaration with id=null
  ExportDefaultDeclaration: ["declaration"],
  ExportAllDeclaration: ["source", "exported"],
  AwaitExpression: ["argument"],
  ChainExpression: ["expression"],
  ImportExpression: ["source"],
  ParenthesizedExpression: ["expression"],
  PropertyDefinition: ["key", "value"],
  StaticBlock: ["body"],
};

class AncestorInfo {
  constructor(
    public node: acorn.Node,
    public prop: string,
    public index?: number,
    public ancestor?: AncestorInfo,
  ) {}

  get descending() {
    const ancestors: AncestorInfo[] = [];
    let current: AncestorInfo | undefined = this;
    while (current) {
      ancestors.push(current);
      current = current.ancestor;
    }
    return ancestors;
  }

  get ascending() {
    return this.descending.reverse();
  }

  nearestOfType(type: string): AncestorInfo | null {
    let current: AncestorInfo | undefined = this;
    while (current) {
      if (current.node.type === type) {
        return current;
      }
      current = current.ancestor;
    }
    return null;
  }

  replaceWith(node: acorn.Node) {
    if (this.index !== undefined) {
      this.node[this.prop][this.index] = node;
    } else {
      this.node[this.prop] = node;
    }
  }
}

/**
 * Options for the `walk` function.
 * - `preserveParents`: Whether to maintain parent references (default: true).
 * - `start`: Start position for node traversal (default: undefined).
 * - `end`: End position for node traversal (default: undefined).
 */
interface AcornWalkOptions {
  preserveParents?: boolean;
  start?: number;
  end?: number;
}

export function walk(
  tree: acorn.Node,
  callback: (
    algo: Algo,
    node: acorn.Node,
    state: any,
    ancestor?: AncestorInfo,
  ) => void,
  state: any = null,
  options: AcornWalkOptions = {},
) {
  options = {
    ...options,
    preserveParents: options.preserveParents ?? true,
    start: options.start ?? undefined,
    end: options.end ?? undefined,
  };

  const outOfBounds = (node: acorn.Node) =>
    (options.start !== undefined && node.end <= options.start) ||
    (options.end !== undefined && node.start >= options.end);

  const inBounds = (node: acorn.Node) =>
    (options.start === undefined || node.start >= options.start) &&
    (options.end === undefined || node.end <= options.end);

  (function w(node: acorn.Node, ancestor?: AncestorInfo) {
    if (!node || typeof node !== "object" || !node.type) {
      return;
    }

    if (outOfBounds(node)) {
      return;
    }

    inBounds(node) && callback(Algo.TOP_DOWN, node, state, ancestor);
    for (const elem of VISIT[node.type] ?? []) {
      const toVisit = node[elem];
      if (Array.isArray(toVisit)) {
        for (let i = 0; i < toVisit.length; i++) {
          const child = toVisit[i];
          w(
            child,
            options.preserveParents
              ? new AncestorInfo(node, elem, i, ancestor)
              : undefined,
          );
        }
      } else if (toVisit) {
        w(
          toVisit,
          options.preserveParents
            ? new AncestorInfo(node, elem, undefined, ancestor)
            : undefined,
        );
      }
    }
    inBounds(node) && callback(Algo.BOTTOM_UP, node, state, ancestor);
  })(tree, undefined);
}

export function walk2(
  tree: acorn.Node,
  callbacks: {
    topDown?: Record<
      string,
      (node: acorn.Node, state: any, ancestor?: AncestorInfo) => void
    >;
    bottomUp?: Record<
      string,
      (node: acorn.Node, state: any, ancestor?: AncestorInfo) => void
    >;
  },
  state: any = null,
  options: AcornWalkOptions = {},
) {
  return walk(
    tree,
    (algo: Algo, node: acorn.Node, state: any, ancestor?: AncestorInfo) => {
      const type = node.type;
      if (algo === Algo.TOP_DOWN && callbacks.topDown?.[type]) {
        callbacks.topDown?.[type](node, state, ancestor);
      } else if (algo === Algo.BOTTOM_UP && callbacks.bottomUp?.[type]) {
        callbacks.bottomUp?.[type](node, state, ancestor);
      }
    },
    state,
    options,
  );
}

export function walk3(
  tree: acorn.Node,
  algo: Algo,
  callbacks: Record<
    string,
    (node: acorn.Node, state: any, ancestor?: AncestorInfo) => void
  >,
  state: any = null,
  options: AcornWalkOptions = {},
) {
  return walk(
    tree,
    (_algo: Algo, node: acorn.Node, state: any, ancestor?: AncestorInfo) => {
      const type = node.type;
      if (algo === _algo && callbacks?.[type]) {
        callbacks?.[type](node, state, ancestor);
      }
    },
    state,
    options,
  );
}

// Example usage of the walk function with a test code snippet

const testCode = `
export function test() {
  console.x.log("This is a test function.");
}
`;

const parseTree = acorn.parse(testCode, {
  sourceType: "module",
  ecmaVersion: "latest",
});

// Example usage 1
walk(parseTree, (algo, node, state, ancestor) => {
  console.log(algo, node.type, node.start, node.end);
});

// Example usage 2
walk2(parseTree, {
  bottomUp: {
    Identifier(node, state, ancestor) {
      console.log(node, ancestor.node.type, ancestor.prop);
    },
    WithStatement(node, state, ancestor) {
      console.log(node);
    },
  },
});
