import { compile, evaluate, Py, RunOptions, CompiledCode } from '../src/index';

describe('Index exports', () => {
  it('should export compile function', () => {
    expect(typeof compile).toBe('function');
  });

  it('should export evaluate function', () => {
    expect(typeof evaluate).toBe('function');
  });

  it('should export Py operator symbols', () => {
    expect(typeof Py).toBe('object');
    expect(typeof Py.__add__).toBe('symbol');
    expect(typeof Py.__sub__).toBe('symbol');
  });

  it('should export RunOptions type', () => {
    // Type test - if this compiles, the type is exported
    const options: RunOptions = {
      operatorOverloading: true,
    };
    expect(options.operatorOverloading).toBe(true);
  });

  it('should export CompiledCode type', () => {
    // Type test - if this compiles, the type is exported
    const mockCompiled: CompiledCode = {
      origCode: 'test',
      genCode: 'test',
      fn: () => {},
      args: [],
      run: () => {},
    };
    expect(mockCompiled.origCode).toBe('test');
  });

  it('should work with re-exported functions', () => {
    const result = evaluate('return 1 + 2', {}, { returns: 'return' });
    expect(result).toBe(3);
  });

  it('should work with re-exported compile', () => {
    const compiled = compile('return x', { x: 42 }, { returns: 'return' });
    expect(compiled.run()).toBe(42);
  });
});