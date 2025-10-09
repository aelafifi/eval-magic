import * as acorn from "acorn";
import * as escodegen from "escodegen";

export interface RunOptions {
  // Pass to dependencies
  parseOptions?: Partial<acorn.Options>;
  codegenOptions?: escodegen.GenerateOptions;

  // ExecuteJS options
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
  run: () => any;
}
