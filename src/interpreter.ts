import { CompiledCode, RunOptions } from "./types";
import { AsyncFunction } from "./utils";
import * as acorn from "acorn";
import { $__, __$__ } from "./operators";
import * as escodegen from "escodegen";
import { Transformer } from "./transformer";

export function compile(
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

  if (typeof options.importFunction === "function") {
    options.parseOptions!.sourceType = "module";
    if (options.importFunction instanceof AsyncFunction) {
      options.isAsync = true;
    }
  }

  const parseTree = acorn.parse(code, options.parseOptions as any);
  const transformer = new Transformer(options);
  const state: any = transformer.transform(parseTree);

  const _scope = Object.fromEntries([
    ...Object.entries<any>(globals).filter(([k, v]: [string, any]) =>
      state.identifiers.has(k),
    ),
    ...(state.unaryFnUsed ? [[state.unaryFnName, $__]] : []),
    ...(state.binaryFnUsed ? [[state.binaryFnName, __$__]] : []),
    ...(state.importFnUsed
      ? [[state.importFnName, options.importFunction]]
      : []),
  ] as [string, any][]);

  const scopeEntries = Object.entries(_scope);
  const keys = scopeEntries.map(([k, v]) => k);
  const values = scopeEntries.map(([k, v]) => v);

  const genCode = escodegen.generate(parseTree);
  const fn =
    options.isAsync || state.hasAwait
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

export function evaluate(
  this: any,
  code: string,
  globals: Record<string, any> = {},
  options: RunOptions = {},
): any {
  return compile.call(null, code, globals, options).run();
}
