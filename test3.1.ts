const arr = [undefined, 2, 3];
const obj = { a: 1, b: 2, c: 3 };

// const [a = 12, b, ...c] = arr;
// console.log(a, b, c);

const { a = 10, b = 20, d = 30, ...x } = obj;

console.log(a, b, d, x);
