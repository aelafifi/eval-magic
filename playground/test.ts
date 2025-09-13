import { compile, execute, Py } from "../src";

export type PointLike = [number, number];

export function isPointLike(pt: PointLike): pt is PointLike {
  return (
    Array.isArray(pt) &&
    pt.length === 2 &&
    typeof pt[0] === "number" &&
    typeof pt[1] === "number"
  );
}

class Point {
  [Py.__radd__] = this[Py.__add__];

  constructor(
    public x: number,
    public y: number,
  ) {}

  static buildPoint(pt: any): Point {
    if (pt instanceof Point) {
      return pt;
    }

    if (isPointLike(pt)) {
      return new Point(pt[0], pt[1]);
    }

    if (typeof pt === "number") {
      return new Point(pt, pt);
    }

    if (pt && typeof pt.x === "number" && typeof pt.y === "number") {
      return new Point(pt.x, pt.y);
    }

    throw new Error(`Can't build point based on given value: ${pt}`);
  }

  [Py.__add__](this: Point, other: any) {
    if (other instanceof Point) {
      return new Point(this.x + other.x, this.y + other.y);
    }

    if (isPointLike(other)) {
      return new Point(this.x + other[0], this.y + other[1]);
    }

    if (typeof other === "number") {
      return new Point(this.x + other, this.y + other);
    }

    // TODO: this fallback to default behaviour of JS, it should throw instead!
    throw new Error("Can only add Point to Point");
  }

  [Py.__cmp__](this: Point, other: any) {
    const otherPoint = Point.buildPoint(other);

    const a = this[Py.__pos__]();
    const b = otherPoint[Py.__pos__]();

    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  }

  [Py.__pos__](this: Point) {
    return Math.hypot(this.x, this.y);
  }

  [Py.__lshift__](this: Point, other: any) {
    const otherPoint = Point.buildPoint(other);
    return (
      (Math.atan2(otherPoint.y - this.y, otherPoint.x - this.x) * 180) / Math.PI
    );
  }

  [Py.__rshift__](this: Point, other: any) {
    const otherPoint = Point.buildPoint(other);
    return (
      (Math.atan2(this.y - otherPoint.y, this.x - otherPoint.x) * 180) / Math.PI
    );
  }

  [Py.__urshift__](this: Point, other: any) {
    const otherPoint = Point.buildPoint(other);
    return Math.hypot(this.y - otherPoint.y, this.x - otherPoint.x);
  }

  toString() {
    return `Point(${this.x}, ${this.y})`;
  }
}

const code = `
import d, {a} from "./test";
import * as ns from "./test";
export const pt1 = new Point(10, 10);
export const pt2 = new Point(20, 20);
export const pt3 = pt1 + pt2;
export const pt4 = pt3 + 20;

export default +pt1;

console.log("###", pt1 + [1, 2]);
console.log("###", [1, 2] + pt1);
console.log("###", pt1 > [1, 2]);
console.log("###", [1, 2] > pt1);

console.log("###", pt1 >> [1, 2]);
console.log("###", pt1 << [1, 2]);
console.log("###", pt1 >>> [1, 2]);

export {a, d, ns}
`;

const res = execute(
  code,
  { Point, console },
  {
    importer: async (source: string) => {
      return { a: 12, b: 34, c: 56 };
    },
  },
);

(res as Promise<any>).then((r) => console.log(r));

console.log(
  compile(
    code,
    { Point },
    {
      importer: async (source: string) => ({ a: 12 }),
    },
  ).genCode,
);
