export const hasOwnProp = (obj: object, prop: string): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

export const generateVarName = () => {
  let result = "id_";
  while (result.length < 16) {
    result += Math.random().toString(36).slice(2);
  }
  return result.slice(0, 16);
};

export const AsyncFunction = Object.getPrototypeOf(
  async function () {},
).constructor;
