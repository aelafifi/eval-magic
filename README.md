# Eval-Magic

A Node.js package that lets you evaluate JavaScript code with enhanced features like Python-style operator overloading, custom imports, and export-based returns.

## ✨ Features
- **Scoped evaluation:** Run JS code with custom-defined scope objects
- **Python-like magic methods:** Bring operator overloading to JavaScript  
- **Export instead of return:** Write modular code snippets that feel natural
- **Custom imports:** Define your own import resolution logic

## 📦 Installation

```shell
npm install eval-magic
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { evaluate } from "eval-magic";

const result = evaluate(
    `export const sum = x + y;`,
    { x: 10, y: 20 }
);

console.log(result); // { sum: 30 }
```

### Operator Overloading

```javascript
import { compile, Py } from "eval-magic";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    [Py.__add__](other) {
        return new Point(this.x + other.x, this.y + other.y);
    }
}

const compiled = compile(
    `const p1 = new Point(1, 2);
     const p2 = new Point(3, 4);
     export const result = p1 + p2;`,
    { Point }
);

console.log(compiled.run()); // { result: Point(4, 6) }
```

## 📚 Documentation

- **[API Reference](./docs/API.md)** - Complete documentation for `compile`, `evaluate`, and all configuration options
- **[Magic Method Operators](./docs/OPERATORS.md)** - Comprehensive guide to Python-style operator overloading

## 💡 Why Eval-Magic?

Perfect for developers working with:
- Domain-Specific Languages (DSLs)
- Creative coding and mathematical expressions
- Sandbox-like script evaluation
- Custom operator behaviors

## 🔒 Security Note

⚠️ This package evaluates arbitrary JavaScript code. Security is your responsibility - validate and sanitize input in production environments.

## TODOs

- [ ] Allow compiled functions to be called with different `globals` several times without re-compilation
- [ ] Improve await detection for better async behavior control