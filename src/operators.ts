import { PassToDefaultBehavior } from "../errors";

export const Py = {
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

  // 2.4. Logical Operators
  __and__: Symbol.for("__and__"),
  __or__: Symbol.for("__or__"),
  __nullish__: Symbol.for("__nullish__"),
  __logical__: Symbol.for("__logical__"), // Custom logical shorthand

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

  // Reversed Logical Operators
  __rand__: Symbol.for("__rand__"),
  __ror__: Symbol.for("__ror__"),
  __rnullish__: Symbol.for("__rnullish__"),
};

const unaryDefaultActions: Record<symbol, (a: any) => any> = {
  // Unary Operators
  [Py.__pos__]: (a: any) => +a,
  [Py.__neg__]: (a: any) => -a,
  [Py.__not__]: (a: any) => !a,
  [Py.__invert__]: (a: any) => ~a,
  [Py.__typeof__]: (a: any) => typeof a,
  [Py.__void__]: (a: any) => void a,
  /* [Py.__delete__]: (a: any) => delete a,  // Invalid operation */
};

const binaryDefaultActions: Record<symbol, (a: any, b: any) => any> = {
  // Binary Operators
  [Py.__add__]: (a: any, b: any) => a + b,
  [Py.__sub__]: (a: any, b: any) => a - b,
  [Py.__mul__]: (a: any, b: any) => a * b,
  [Py.__div__]: (a: any, b: any) => a / b,
  [Py.__mod__]: (a: any, b: any) => a % b,
  [Py.__pow__]: (a: any, b: any) => a ** b,
  [Py.__lshift__]: (a: any, b: any) => {
    return a << b;
  },
  [Py.__rshift__]: (a: any, b: any) => a >> b,
  [Py.__urshift__]: (a: any, b: any) => a >>> b,
  [Py.__xor__]: (a: any, b: any) => a ^ b,
  [Py.__eq__]: (a: any, b: any) => a == b,
  [Py.__ne__]: (a: any, b: any) => a != b,
  [Py.__lt__]: (a: any, b: any) => a < b,
  [Py.__le__]: (a: any, b: any) => a <= b,
  [Py.__gt__]: (a: any, b: any) => a > b,
  [Py.__ge__]: (a: any, b: any) => a >= b,
  [Py.__seq__]: (a: any, b: any) => a === b, // Strict equality (===)
  [Py.__sne__]: (a: any, b: any) => a !== b, // Strict inequality (!==)
  [Py.__in__]: (a: any, b: any) => a in b,
  [Py.__instanceof__]: (a: any, b: any) => a instanceof b,
  [Py.__bitwise_and__]: (a: any, b: any) => a & b,
  [Py.__bitwise_or__]: (a: any, b: any) => a | b,

  // Logical Operators
  [Py.__and__]: (a: any, b: any) => a && b,
  [Py.__or__]: (a: any, b: any) => a || b,
  [Py.__nullish__]: (a: any, b: any) => a ?? b,

  // Reversed Binary Operators
  [Py.__radd__]: (a: any, b: any) => b + a,
  [Py.__rsub__]: (a: any, b: any) => b - a,
  [Py.__rmul__]: (a: any, b: any) => b * a,
  [Py.__rdiv__]: (a: any, b: any) => b / a,
  [Py.__rmod__]: (a: any, b: any) => b % a,
  [Py.__rpow__]: (a: any, b: any) => b ** a,
  [Py.__rlshift__]: (a: any, b: any) => {
    return b << a;
  },
  [Py.__rrshift__]: (a: any, b: any) => b >> a,
  [Py.__rurshift__]: (a: any, b: any) => b >>> a,
  [Py.__rxor__]: (a: any, b: any) => b ^ a,
  [Py.__rin__]: (a: any, b: any) => b in a,
  [Py.__rinstanceof__]: (a: any, b: any) => b instanceof a,
  [Py.__rbitwise_and__]: (a: any, b: any) => b & a,
  [Py.__rbitwise_or__]: (a: any, b: any) => b | a,

  // Reversed Logical Operators
  [Py.__rand__]: (a: any, b: any) => b && a,
  [Py.__ror__]: (a: any, b: any) => b || a,
  [Py.__rnullish__]: (a: any, b: any) => b ?? a,
};

const opposites = {
  // Binary Operators
  [Py.__add__]: Py.__radd__,
  [Py.__sub__]: Py.__rsub__,
  [Py.__mul__]: Py.__rmul__,
  [Py.__div__]: Py.__rdiv__,
  [Py.__mod__]: Py.__rmod__,
  [Py.__pow__]: Py.__rpow__,
  [Py.__lshift__]: Py.__rlshift__,
  [Py.__rshift__]: Py.__rrshift__,
  [Py.__urshift__]: Py.__rurshift__,
  [Py.__xor__]: Py.__rxor__,
  [Py.__eq__]: Py.__eq__,
  [Py.__ne__]: Py.__ne__,
  [Py.__lt__]: Py.__gt__,
  [Py.__le__]: Py.__ge__,
  [Py.__gt__]: Py.__lt__,
  [Py.__ge__]: Py.__le__,
  [Py.__seq__]: Py.__seq__,
  [Py.__sne__]: Py.__sne__,
  [Py.__in__]: Py.__rin__,
  [Py.__instanceof__]: Py.__rinstanceof__,
  [Py.__bitwise_and__]: Py.__rbitwise_and__,
  [Py.__bitwise_or__]: Py.__rbitwise_or__,

  // Logical Operators
  [Py.__and__]: Py.__rand__,
  [Py.__or__]: Py.__ror__,
  [Py.__nullish__]: Py.__rnullish__,
};

export const unaryOperatorsMap: Record<string, symbol> = {
  "+": Py.__pos__,
  "-": Py.__neg__,
  "!": Py.__not__,
  "~": Py.__invert__,
  typeof: Py.__typeof__,
};

export const binaryOperatorsMap: Record<string, symbol> = {
  "+": Py.__add__,
  "-": Py.__sub__,
  "*": Py.__mul__,
  "/": Py.__div__,
  "%": Py.__mod__,
  "**": Py.__pow__,
  "<<": Py.__lshift__,
  ">>": Py.__rshift__,
  ">>>": Py.__urshift__,
  "^": Py.__xor__,
  "==": Py.__eq__,
  "!=": Py.__ne__,
  "===": Py.__seq__,
  "!==": Py.__sne__,
  "<": Py.__lt__,
  "<=": Py.__le__,
  ">": Py.__gt__,
  ">=": Py.__ge__,
  in: Py.__in__,
  instanceof: Py.__instanceof__,
  "&": Py.__bitwise_and__,
  "|": Py.__bitwise_or__,
};

const binaryShorthandImpl = {
  [Py.__eq__]: (left, right) => left[Py.__cmp__](right) === 0,
  [Py.__ne__]: (left, right) => left[Py.__cmp__](right) !== 0,
  [Py.__gt__]: (left, right) => left[Py.__cmp__](right) > 0,
  [Py.__ge__]: (left, right) => left[Py.__cmp__](right) >= 0,
  [Py.__lt__]: (left, right) => left[Py.__cmp__](right) < 0,
  [Py.__le__]: (left, right) => left[Py.__cmp__](right) <= 0,

  [Py.__add__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__add__]),
  [Py.__radd__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__radd__]),
  [Py.__sub__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__sub__]),
  [Py.__rsub__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rsub__]),
  [Py.__mul__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__mul__]),
  [Py.__rmul__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rmul__]),
  [Py.__div__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__div__]),
  [Py.__rdiv__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rdiv__]),
  [Py.__mod__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__mod__]),
  [Py.__rmod__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rmod__]),
  [Py.__pow__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__pow__]),
  [Py.__rpow__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rpow__]),
  [Py.__lshift__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__lshift__]),
  [Py.__rlshift__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rlshift__]),
  [Py.__rshift__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rshift__]),
  [Py.__rrshift__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rrshift__]),
  [Py.__urshift__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__urshift__]),
  [Py.__rurshift__]: (left, right) =>
    left[Py.__arithmetic__](right, binaryDefaultActions[Py.__rurshift__]),

  [Py.__xor__]: (left, right) =>
    left[Py.__bitwise__](right, binaryDefaultActions[Py.__xor__]),
  [Py.__rxor__]: (left, right) =>
    left[Py.__bitwise__](right, binaryDefaultActions[Py.__rxor__]),
  [Py.__bitwise_and__]: (left, right) =>
    left[Py.__bitwise__](right, binaryDefaultActions[Py.__bitwise_and__]),
  [Py.__rbitwise_and__]: (left, right) =>
    left[Py.__bitwise__](right, binaryDefaultActions[Py.__rbitwise_and__]),
  [Py.__bitwise_or__]: (left, right) =>
    left[Py.__bitwise__](right, binaryDefaultActions[Py.__bitwise_or__]),
  [Py.__rbitwise_or__]: (left, right) =>
    left[Py.__bitwise__](right, binaryDefaultActions[Py.__rbitwise_or__]),

  [Py.__and__]: (left, right) =>
    left[Py.__logical__](right, binaryDefaultActions[Py.__and__]),
  [Py.__rand__]: (left, right) =>
    left[Py.__logical__](right, binaryDefaultActions[Py.__rand__]),
  [Py.__or__]: (left, right) =>
    left[Py.__logical__](right, binaryDefaultActions[Py.__or__]),
  [Py.__ror__]: (left, right) =>
    left[Py.__logical__](right, binaryDefaultActions[Py.__ror__]),
  [Py.__nullish__]: (left, right) =>
    left[Py.__logical__](right, binaryDefaultActions[Py.__nullish__]),
  [Py.__rnullish__]: (left, right) =>
    left[Py.__logical__](right, binaryDefaultActions[Py.__rnullish__]),
};

export function $__(operator: any, arg: any) {
  const sym = unaryOperatorsMap[operator];
  try {
    const fn = arg[sym];
    return fn.call(arg);
  } catch (e) {
    return unaryDefaultActions[sym](arg);
  }
}

export function tryCatchSeq(...fns: (() => any)[]) {
  if (fns.length > 0) {
    const [fn, ...rest] = fns;
    try {
      return fn();
    } catch (e) {
      if (e instanceof PassToDefaultBehavior && rest.length > 0) {
        return tryCatchSeq(...rest);
      }
      throw e;
    }
  }
}

export function __$__(left: any, operator: any, right: any) {
  const sym = binaryOperatorsMap[operator];

  const sequence = [
    // fn, a, b
    [left[sym], left, right],
    [right[opposites[sym]], right, left],
    [left[binaryShorthandImpl[sym]], left, right],
    [right[binaryShorthandImpl[opposites[sym]]], right, left],
    [binaryDefaultActions[sym], left, right],
  ];

  return tryCatchSeq(
    ...sequence.map(([fn, a, b]) => () => {
      return () => {
        if (typeof fn === "function") {
          return fn(a, b);
        }
        throw new PassToDefaultBehavior();
      };
    }),
  );
}
