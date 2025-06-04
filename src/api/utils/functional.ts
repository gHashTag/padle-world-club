// Функциональные утилиты

// Pipe функция для композиции
export const pipe = <T, R>(value: T, fn: (value: T) => R): R => fn(value);

// Compose функция
export const compose =
  <A, B, C>(f: (b: B) => C, g: (a: A) => B) =>
  (a: A): C =>
    f(g(a));

// Identity функция
export const identity = <T>(x: T): T => x;

// Curry функция
export const curry =
  <A, B, C>(fn: (a: A, b: B) => C) =>
  (a: A) =>
  (b: B) =>
    fn(a, b);

// Partial application
export const partial =
  <A extends any[], B>(fn: (...args: A) => B, ...partialArgs: Partial<A>) =>
  (...restArgs: any[]): B =>
    fn(...(partialArgs.concat(restArgs) as A));

// Memoization
export const memoize = <Args extends any[], Return>(
  fn: (...args: Args) => Return
): ((...args: Args) => Return) => {
  const cache = new Map<string, Return>();
  return (...args: Args): Return => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
