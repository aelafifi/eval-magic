import * as acorn from "acorn";
import * as escodegen from "escodegen";

export interface RunOptions {
  // Pass to dependencies
  parseOptions?: Partial<acorn.Options>;
  codegenOptions?: escodegen.GenerateOptions;

  // compiler options
  returns?: "exports" | "return";
  operatorOverloading?: boolean;
  importFunction?: (source: string) => Object;
  isAsync?: boolean;
  opsFallback?: Record<symbol, Function>;
}

export interface CompiledCode {
  origCode: string;
  genCode: string;
  fn: Function;
  args: any[];
  argKeys: string[];
  run: () => any;

  [key: string]: any;
}
