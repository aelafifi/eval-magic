Everything started when I wanted to create a paper.js jupyter-like notebook.
I had to use their paper script, which has some bugs and also some lag of features!
Also, I wanted to add some custom features to my project.

I decided to create my custom "eval-like" function.
and while my main stacks are Node.js and Python,
I decided to add the python magic methods support to JS.

I know that when we write JS code we usually use the IDE, not writing it as a string and then calling `eval` over that string!
but this is not intended to replace JS, but just to provide functionality to projects similar to paper script.



> ## Introduction
> 
> `ExecuteJS` was born out of a need for flexibility and customization while building a Jupyter-like notebook experience for paper.js. PaperScript—the scripting layer provided by [paper.js](http://paperjs.org/)—has its limitations: subtle bugs, missing features, and a lack of extensibility for more advanced use cases.
> 
> To overcome those issues, I set out to build a custom `eval`-like execution layer for JavaScript—one that’s not meant to replace standard JS development, but to enable dynamic scripting in creative, interactive environments like PaperScript.
> 
> Given my background in both Node.js and Python, I wanted to bring the expressiveness of Python—especially its “magic methods”—into the JavaScript world. The result is `ExecuteJS`: a lightweight runtime that adds syntactic and functional enhancements to JS when it’s written and executed as a string, making it ideal for environments where embedding code is part of the workflow.

## Example

```javascript
import {Py} from "src";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    pointify(value, allowSingleNumber = true) {
        // Point(x, y) -> return as is
        if (value instanceof Point) {
            return value;
        }
        
        // [x, y] -> Point(x, y)
        if (Array.isArray(value) && value.length === 2) {
            return new Point(value[0], value[1]);
        }
        
        // {x: x, y: y} -> Point(x, y)
        if (typeof value === 'object' && 'x' in value && 'y' in value) {
            return new Point(value.x, value.y);
        }
        
        // number -> Point(number, number)
        if (typeof value === 'number' && allowSingleNumber) {
            return new Point(value, value);
        }
        
        // Otherwise, throw an error
        throw new TypeError("Cannot convert to Point: " + value);
    }

    [Py.__add__](other) {
        // Allow adding any Point-like object or a number
        // Usage:
        //  - `p1 + p2`
        //  - `p1 + [x, y]`
        //  - `p1 + {x: x, y: y}`
        //  - `p1 + number`
        
        other_p = this.pointify(other);
        return new Point(this.x + other_p.x, this.y + other_p.y);
    }

    [Py.__radd__](other) {
        // Allow adding an array [x, y] to Point
        // Usage: `[x, y] + p1`
        
        // Just call the normal `__add__` method, while addition is commutative
        return this[Py.__add__](other);
    }
    
    [Pt.__sub__](other) {
        // Allow subtracting any Point-like object or a number
        // Usage:
        //  - `p1 - p2`
        //  - `p1 - [x, y]`
        //  - `p1 - {x: x, y: y}`
        //  - `p1 - number`
        
        other_p = this.pointify(other);
        return new Point(this.x - other_p.x, this.y - other_p.y);
    }
    
    [Py.__rsub__](other) {
        // Allow subtracting Point from an array [x, y]
        // Usage: `[x, y] - p1`
        
        // Just call the normal `__sub__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__sub__](this);
    }
    
    [Py.__mul__](other) {
        // Allow multiplying by any Point-like object or a number
        // Usage:
        //  - `p1 * p2`
        //  - `p1 * [x, y]`
        //  - `p1 * {x: x, y: y}`
        //  - `p1 * number`
        
        other_p = this.pointify(other);
        return new Point(this.x * other_p.x, this.y * other_p.y);
    }
    
    [Py.__rmul__](other) {
        // Allow multiplying an array [x, y] by Point
        // Usage: `[x, y] * p1`
        
        // Just call the normal `__mul__` method, while multiplication is commutative
        return this[Py.__mul__](other);
    }
    
    [Py.__div__](other) {
        // Allow dividing by any Point-like object or a number
        // Usage:
        //  - `p1 / p2`
        //  - `p1 / [x, y]`
        //  - `p1 / {x: x, y: y}`
        //  - `p1 / number`
        
        other_p = this.pointify(other);
        return new Point(this.x / other_p.x, this.y / other_p.y);
    }
    
    [Py.__rdiv__](other) {
        // Allow dividing an array [x, y] by Point
        // Usage: `[x, y] / p1`
        
        // Just call the normal `__div__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__div__](this);
    }
    
    [Py.__mod__](other) {
        // Allow modulus by any Point-like object or a number
        // Usage:
        //  - `p1 % p2`
        //  - `p1 % [x, y]`
        //  - `p1 % {x: x, y: y}`
        //  - `p1 % number`
        
        other_p = this.pointify(other);
        return new Point(this.x % other_p.x, this.y % other_p.y);
    }
    
    [Py.__rmod__](other) {
        // Allow modulus of an array [x, y] by Point
        // Usage: `[x, y] % p1`
        
        // Just call the normal `__mod__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__mod__](this);
    }
    
    [Py.__pow__](other) {
        // Allow power by any Point-like object or a number
        // Usage:
        //  - `p1 ** p2`
        //  - `p1 ** [x, y]`
        //  - `p1 ** {x: x, y: y}`
        //  - `p1 ** number`
        
        other_p = this.pointify(other);
        return new Point(this.x ** other_p.x, this.y ** other_p.y);
    }
    
    [Py.__rpow__](other) {
        // Allow power of an array [x, y] by Point
        // Usage: `[x, y] ** p1`

        // Just call the normal `__pow__` method, but reverse the order
        other_p = this.pointify(other);
        return other_p[Py.__pow__](this);
    }
    
    [Py.__neg__]() {
        // Negate the point
        // Usage: `-p1`
        return new Point(-this.x, -this.y);
    }

    // The same logic applies for all binary operators:
    //   - subtraction (-): `__sub__` and `__rsub__`
    //   - multiplication (*): `__mul__` and `__rmul__`
    //   - division (/): `__div__` and `__rdiv__`
    //   - modulus (%): `__mod__` and `__rmod__`
    //   - power (**): `__pow__` and `__rpow__`
    //   - right shift (>>): `__rshift__` and `__rrshift__`
    //   - unsigned right shift (>>>): `__urshift__` and `__rurshift__`
    //   - left shift (<<): `__lshift__` and `__rlshift__`
    //   - bitwise AND (&): `__and__` and `__rand__`
    //   - bitwise OR (|): `__or__` and `__ror__`
    //   - bitwise XOR (^): `__xor__` and `__rxor__`
    //   - logical AND (&&): `__land__` and `__rland__`
    //   - logical OR (||): `__lor__` and `__rlor__`
    //   - nullish coalescing (??): `__nullish__` and `__rnullish__`
    //   - containment (in): `__in__`, `__rin__`
    //   - instance check (instanceof): `__instanceof__`, `__rinstanceof__`

    // The only exception is the comparison operators, which are:
    //   `__lt__`, `__le__`, `__eq__`, `__ne__`, `__gt__`, `__ge__`
    // The opposite versions are as follows:
    //   - `__eq__` -> `__eq__`
    //   - `__ne__` -> `__ne__`
    //   - `__lt__` -> `__gt__`
    //   - `__le__` -> `__ge__`
    //   - `__gt__` -> `__lt__`
    //   - `__ge__` -> `__le__`

    // You can define all comparison operators in one method: `__cmp__`
    //   - If the method returns a negative number, it means "less than"
    //   - If it returns zero, it means "equal to"
    //   - If it returns a positive number, it means "greater than"

    [Py.__rshift__](other) {
        // Get angle between two points
        // Usage: `p1 >> p2`
        if (other instanceof Point) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.atan2(dy, dx) * (180 / Math.PI);
        }

        throw new TypeError("Unsupported operand type(s) for >>: 'Point' and '" + typeof other + "'");
    }

    [Py.__lshift__](other) {
        // Get angle between two points (in the opposite direction)
        // Usage: `p1 << p2`
        return other[Py.__rshift__](this);
    }

    [Py.__urshift__](other) {
        // Get distance between two points
        // Usage: `p1 >>> p2`
        if (other instanceof Point) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            return Math.hypot(dx, dy);
        }

        throw new TypeError("Unsupported operand type(s) for >>>: 'Point' and '" + typeof other + "'");
    }
}
```