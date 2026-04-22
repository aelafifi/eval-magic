export const Op = {
  // 1. Unary Operators
  __pos__: Symbol.for("__pos__"),
  __neg__: Symbol.for("__neg__"),
  __not__: Symbol.for("__not__"),
  __invert__: Symbol.for("__invert__"),
  __typeof__: Symbol.for("__typeof__"),
  __void__: Symbol.for("__void__"),
  /* __delete__: Symbol.for("__delete__"),  // Can't set a default action for delete */

  // 2. Binary Operators

  // 2.1. Arithmetic Operators
  __add__: Symbol.for("__add__"),
  __sub__: Symbol.for("__sub__"),
  __mul__: Symbol.for("__mul__"),
  __div__: Symbol.for("__div__"),
  __mod__: Symbol.for("__mod__"),
  __pow__: Symbol.for("__pow__"),
  __lshift__: Symbol.for("__lshift__"),
  __rshift__: Symbol.for("__rshift__"),
  __urshift__: Symbol.for("__urshift__"),
  __arithmetic__: Symbol.for("__arithmetic__"), // Custom arithmetic shorthand

  // 2.2. Bitwise Operators
  __xor__: Symbol.for("__xor__"),
  __bitwise_and__: Symbol.for("__bitwise_and__"),
  __bitwise_or__: Symbol.for("__bitwise_or__"),
  __bitwise__: Symbol.for("__bitwise__"), // Custom bitwise shorthand

  // 2.3. Comparison Operators
  __eq__: Symbol.for("__eq__"),
  __ne__: Symbol.for("__ne__"),
  __lt__: Symbol.for("__lt__"),
  __le__: Symbol.for("__le__"),
  __gt__: Symbol.for("__gt__"),
  __ge__: Symbol.for("__ge__"),
  __seq__: Symbol.for("__seq__"), // Strict equality (===)
  __sne__: Symbol.for("__sne__"), // Strict inequality (!==)
  __cmp__: Symbol.for("__cmp__"), // Custom comparison shorthand

  // 2.5. Other Operators
  __in__: Symbol.for("__in__"),
  __instanceof__: Symbol.for("__instanceof__"),

  // Reversed Binary Operators
  __radd__: Symbol.for("__radd__"),
  __rsub__: Symbol.for("__rsub__"),
  __rmul__: Symbol.for("__rmul__"),
  __rdiv__: Symbol.for("__rdiv__"),
  __rmod__: Symbol.for("__rmod__"),
  __rpow__: Symbol.for("__rpow__"),
  __rlshift__: Symbol.for("__rlshift__"),
  __rrshift__: Symbol.for("__rrshift__"),
  __rurshift__: Symbol.for("__rurshift__"),
  __rxor__: Symbol.for("__rxor__"),
  __rin__: Symbol.for("__rin__"),
  __rinstanceof__: Symbol.for("__rinstanceof__"),
  __rbitwise_and__: Symbol.for("__rbitwise_and__"),
  __rbitwise_or__: Symbol.for("__rbitwise_or__"),
};

const unaryDefaultActions: Record<symbol, (a: any) => any> = {
  // Unary Operators
  [Op.__pos__]: (a: any) => +a,
  [Op.__neg__]: (a: any) => -a,
  [Op.__not__]: (a: any) => !a,
  [Op.__invert__]: (a: any) => ~a,
  [Op.__typeof__]: (a: any) => typeof a,
  [Op.__void__]: (a: any) => void a,
  /* [Op.__delete__]: (a: any) => delete a,  // Invalid operation */
};

const binaryDefaultActions: Record<symbol, (a: any, b: any) => any> = {
  // Binary Operators
  [Op.__add__]: (a: any, b: any) => a + b,
  [Op.__sub__]: (a: any, b: any) => a - b,
  [Op.__mul__]: (a: any, b: any) => a * b,
  [Op.__div__]: (a: any, b: any) => a / b,
  [Op.__mod__]: (a: any, b: any) => a % b,
  [Op.__pow__]: (a: any, b: any) => a ** b,
  [Op.__lshift__]: (a: any, b: any) => {
    return a << b;
  },
  [Op.__rshift__]: (a: any, b: any) => a >> b,
  [Op.__urshift__]: (a: any, b: any) => a >>> b,
  [Op.__xor__]: (a: any, b: any) => a ^ b,
  [Op.__eq__]: (a: any, b: any) => a == b,
  [Op.__ne__]: (a: any, b: any) => a != b,
  [Op.__lt__]: (a: any, b: any) => a < b,
  [Op.__le__]: (a: any, b: any) => a <= b,
  [Op.__gt__]: (a: any, b: any) => a > b,
  [Op.__ge__]: (a: any, b: any) => a >= b,
  [Op.__seq__]: (a: any, b: any) => a === b, // Strict equality (===)
  [Op.__sne__]: (a: any, b: any) => a !== b, // Strict inequality (!==)
  [Op.__in__]: (a: any, b: any) => a in b,
  [Op.__instanceof__]: (a: any, b: any) => a instanceof b,
  [Op.__bitwise_and__]: (a: any, b: any) => a & b,
  [Op.__bitwise_or__]: (a: any, b: any) => a | b,

  // Reversed Binary Operators
  [Op.__radd__]: (a: any, b: any) => b + a,
  [Op.__rsub__]: (a: any, b: any) => b - a,
  [Op.__rmul__]: (a: any, b: any) => b * a,
  [Op.__rdiv__]: (a: any, b: any) => b / a,
  [Op.__rmod__]: (a: any, b: any) => b % a,
  [Op.__rpow__]: (a: any, b: any) => b ** a,
  [Op.__rlshift__]: (a: any, b: any) => {
    return b << a;
  },
  [Op.__rrshift__]: (a: any, b: any) => b >> a,
  [Op.__rurshift__]: (a: any, b: any) => b >>> a,
  [Op.__rxor__]: (a: any, b: any) => b ^ a,
  [Op.__rin__]: (a: any, b: any) => b in a,
  [Op.__rinstanceof__]: (a: any, b: any) => b instanceof a,
  [Op.__rbitwise_and__]: (a: any, b: any) => b & a,
  [Op.__rbitwise_or__]: (a: any, b: any) => b | a,

};

const opposites = {
  // Binary Operators
  [Op.__add__]: Op.__radd__,
  [Op.__sub__]: Op.__rsub__,
  [Op.__mul__]: Op.__rmul__,
  [Op.__div__]: Op.__rdiv__,
  [Op.__mod__]: Op.__rmod__,
  [Op.__pow__]: Op.__rpow__,
  [Op.__lshift__]: Op.__rlshift__,
  [Op.__rshift__]: Op.__rrshift__,
  [Op.__urshift__]: Op.__rurshift__,
  [Op.__xor__]: Op.__rxor__,
  [Op.__eq__]: Op.__eq__,
  [Op.__ne__]: Op.__ne__,
  [Op.__lt__]: Op.__gt__,
  [Op.__le__]: Op.__ge__,
  [Op.__gt__]: Op.__lt__,
  [Op.__ge__]: Op.__le__,
  [Op.__seq__]: Op.__seq__,
  [Op.__sne__]: Op.__sne__,
  [Op.__in__]: Op.__rin__,
  [Op.__instanceof__]: Op.__rinstanceof__,
  [Op.__bitwise_and__]: Op.__rbitwise_and__,
  [Op.__bitwise_or__]: Op.__rbitwise_or__,
};

export const unaryOperatorsMap: Record<string, symbol> = {
  "+": Op.__pos__,
  "-": Op.__neg__,
  "!": Op.__not__,
  "~": Op.__invert__,
  typeof: Op.__typeof__,
  void: Op.__void__,
};

export const binaryOperatorsMap: Record<string, symbol> = {
  "+": Op.__add__,
  "-": Op.__sub__,
  "*": Op.__mul__,
  "/": Op.__div__,
  "%": Op.__mod__,
  "**": Op.__pow__,
  "<<": Op.__lshift__,
  ">>": Op.__rshift__,
  ">>>": Op.__urshift__,
  "^": Op.__xor__,
  "==": Op.__eq__,
  "!=": Op.__ne__,
  "===": Op.__seq__,
  "!==": Op.__sne__,
  "<": Op.__lt__,
  "<=": Op.__le__,
  ">": Op.__gt__,
  ">=": Op.__ge__,
  in: Op.__in__,
  instanceof: Op.__instanceof__,
  "&": Op.__bitwise_and__,
  "|": Op.__bitwise_or__,
};

const binaryShorthandImpl = {
  [Op.__eq__]: (left, right) => left[Op.__cmp__](right) === 0,
  [Op.__ne__]: (left, right) => left[Op.__cmp__](right) !== 0,
  [Op.__gt__]: (left, right) => left[Op.__cmp__](right) > 0,
  [Op.__ge__]: (left, right) => left[Op.__cmp__](right) >= 0,
  [Op.__lt__]: (left, right) => left[Op.__cmp__](right) < 0,
  [Op.__le__]: (left, right) => left[Op.__cmp__](right) <= 0,

  // TODO: need to revise the opposite calls here
  [Op.__add__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__add__]),
  [Op.__radd__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__radd__]),
  [Op.__sub__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__sub__]),
  [Op.__rsub__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rsub__]),
  [Op.__mul__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__mul__]),
  [Op.__rmul__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rmul__]),
  [Op.__div__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__div__]),
  [Op.__rdiv__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rdiv__]),
  [Op.__mod__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__mod__]),
  [Op.__rmod__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rmod__]),
  [Op.__pow__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__pow__]),
  [Op.__rpow__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rpow__]),
  [Op.__lshift__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__lshift__]),
  [Op.__rlshift__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rlshift__]),
  [Op.__rshift__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rshift__]),
  [Op.__rrshift__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rrshift__]),
  [Op.__urshift__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__urshift__]),
  [Op.__rurshift__]: (left, right) =>
    left[Op.__arithmetic__](right, binaryDefaultActions[Op.__rurshift__]),

  [Op.__xor__]: (left, right) =>
    left[Op.__bitwise__](right, binaryDefaultActions[Op.__xor__]),
  [Op.__rxor__]: (left, right) =>
    left[Op.__bitwise__](right, binaryDefaultActions[Op.__rxor__]),
  [Op.__bitwise_and__]: (left, right) =>
    left[Op.__bitwise__](right, binaryDefaultActions[Op.__bitwise_and__]),
  [Op.__rbitwise_and__]: (left, right) =>
    left[Op.__bitwise__](right, binaryDefaultActions[Op.__rbitwise_and__]),
  [Op.__bitwise_or__]: (left, right) =>
    left[Op.__bitwise__](right, binaryDefaultActions[Op.__bitwise_or__]),
  [Op.__rbitwise_or__]: (left, right) =>
    left[Op.__bitwise__](right, binaryDefaultActions[Op.__rbitwise_or__]),
};

export function $__(
  opsFallback: Record<symbol, Function>,
  operator: any,
  arg: any,
) {
  const sym = unaryOperatorsMap[operator];

  const sequence = [
    // fn, ...args
    [arg?.[sym], arg],
    [opsFallback?.[sym], null, arg],
    [unaryDefaultActions[sym], null, arg],
  ].filter(([fn]) => typeof fn === "function");

  if (sequence.length === 0) {
    throw new Error(
      `Operator ${operator} not implemented for type ${typeof arg}`,
    );
  }

  const [fn, ...args] = sequence[0];
  return fn.call(...args);
}

export function __$__(
  opsFallback: Record<symbol, Function>,
  left: any,
  operator: any,
  right: any,
) {
  const sym = binaryOperatorsMap[operator];

  const sequence = [
    // fn, ...args
    [left?.[sym], left, right],
    [right?.[opposites[sym]], right, left],
    [binaryShorthandImpl[left?.[sym]], null, left, right],
    [binaryShorthandImpl[right?.[opposites[sym]]], null, right, left],
    [opsFallback?.[sym], null, left, right],
    [binaryDefaultActions[sym], null, left, right],
  ].filter(([fn]) => typeof fn === "function");

  if (sequence.length === 0) {
    throw new Error(
      `Operator ${operator} not implemented for types ${typeof left} and ${typeof right}`,
    );
  }

  const [fn, ...args] = sequence[0];
  return fn.call(...args);
}
