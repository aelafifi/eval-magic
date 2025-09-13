import * as acorn from "acorn";
import * as escodegen from "escodegen";
import { AcornVisitor } from "./acorn-visitor";
import { AsyncFunction } from "./utils";

export type VisitorFn = (node: acorn.Node, parent?: acorn.Node) => void;

export interface RunOptions {
  // Pass to dependencies
  parseOptions?: Partial<acorn.Options>;
  codegenOptions?: escodegen.GenerateOptions;

  // ExecuteJS options
  returns?: "exports" | "return";
  operatorOverloading?: boolean;
  customVisitors?: Record<string, VisitorFn>;
  importer?: (source: string) => Object;
  isAsync?: boolean;
}

export interface CompiledCode {
  origCode: string;
  genCode: string;
  fn: Function;
  args: any[];
  run: () => any;
}

export function compile(
  this: any,
  code: string,
  globals: Record<string, any> = {},
  options: RunOptions = {},
): CompiledCode {
  options = {
    parseOptions: {
      ecmaVersion: "latest",
      ...options.parseOptions,
    },
    codegenOptions: {},
    returns: "exports",
    operatorOverloading: true,
    customVisitors: {},
    isAsync: false,
    ...options,
  };

  switch (options.returns) {
    case "exports":
      options.parseOptions!.sourceType = "module";
      break;
    case "return":
      options.parseOptions!.allowReturnOutsideFunction = true;
      break;
  }

  if (typeof options.importer === "function") {
    options.parseOptions!.sourceType = "module";
  }

  const parseTree = acorn.parse(code, options.parseOptions as any);
  const visitor = new AcornVisitor(options);
  visitor.visit(parseTree);

  const _scope = Object.fromEntries([
    ...Object.entries(globals).filter(([k]: [string, any]) =>
      visitor.identifiers.has(k),
    ),
    ...Object.entries(visitor.scope),
  ]);
  const scopeEntries = Object.entries(_scope);
  const keys = scopeEntries.map(([k, v]) => k);
  const values = scopeEntries.map(([k, v]) => v);

  const genCode = escodegen.generate(parseTree);
  const fn = visitor.isAsync
    ? new AsyncFunction(...keys, genCode)
    : new Function(...keys, genCode);
  return {
    origCode: code,
    genCode,
    fn,
    args: values,
    run: () => fn.call(null, ...values),
  };
}

export function execute(
  this: any,
  code: string,
  globals: Record<string, any> = {},
  options: RunOptions = {},
): any {
  return compile.call(this, code, globals, options).run();
}

export class ExecuteJS {
  constructor(
    readonly options: RunOptions = {},
    readonly globals: Record<string, any> = {},
  ) {}

  exec(code: string, globals: Record<string, any> = {}) {
    return execute(code, { ...this.globals, globals }, this.options);
  }

  run(code: string, globals: Record<string, any> = {}) {
    return execute(code, { ...this.globals, globals }, this.options);
  }

  compile(code: string, globals: Record<string, any> = {}) {
    return compile(code, { ...this.globals, globals }, this.options);
  }
}
