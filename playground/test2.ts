import { compile, execute } from "../src";
import * as acorn from "acorn";

const code = `
export {a, b as xyz} from "./module.js";
`;

// console.log(
//   JSON.stringify(
//     acorn.parse(code, {
//       ecmaVersion: "latest",
//       sourceType: "module",
//     }),
//     null,
//     2,
//   ),
// );

console.log(
  compile(
    code,
    {},
    {
      importer: async (source: string) => {
        return { a: 12, b: 34, c: 56, default: 999999 };
      },
    },
  ).genCode,
);

execute(
  code,
  {},
  {
    importer: async (source: string) => {
      return { a: 12, b: 34, c: 56, default: 999999 };
    },
  },
).then(console.log);
