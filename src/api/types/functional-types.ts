/**
 * Типы для функционального программирования
 */

// Монада Maybe для работы с nullable значениями
export abstract class Maybe<T> {
  abstract map<U>(f: (value: T) => U): Maybe<U>;
  abstract flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U>;
  abstract filter(predicate: (value: T) => boolean): Maybe<T>;
  abstract getOrElse(defaultValue: T): T;
  abstract isSome(): boolean;
  abstract isNone(): boolean;
}

export class Some<T> extends Maybe<T> {
  constructor(private value: T) {
    super();
  }

  map<U>(f: (value: T) => U): Maybe<U> {
    return new Some(f(this.value));
  }

  flatMap<U>(f: (value: T) => Maybe<U>): Maybe<U> {
    return f(this.value);
  }

  filter(predicate: (value: T) => boolean): Maybe<T> {
    return predicate(this.value) ? this : new None<T>();
  }

  getOrElse(_defaultValue: T): T {
    return this.value;
  }

  isSome(): boolean {
    return true;
  }

  isNone(): boolean {
    return false;
  }
}

export class None<T> extends Maybe<T> {
  map<U>(_f: (value: T) => U): Maybe<U> {
    return new None<U>();
  }

  flatMap<U>(_f: (value: T) => Maybe<U>): Maybe<U> {
    return new None<U>();
  }

  filter(_predicate: (value: T) => boolean): Maybe<T> {
    return this;
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  isSome(): boolean {
    return false;
  }

  isNone(): boolean {
    return true;
  }
}

// Утилиты для создания Maybe
export const maybe = {
  some: <T>(value: T): Maybe<T> => new Some(value),
  none: <T>(): Maybe<T> => new None<T>(),
  fromNullable: <T>(value: T | null | undefined): Maybe<T> => 
    value != null ? new Some(value) : new None<T>(),
};

// Монада Either для обработки ошибок
export abstract class Either<L, R> {
  abstract map<U>(f: (value: R) => U): Either<L, U>;
  abstract flatMap<U>(f: (value: R) => Either<L, U>): Either<L, U>;
  abstract mapLeft<U>(f: (value: L) => U): Either<U, R>;
  abstract fold<U>(leftF: (left: L) => U, rightF: (right: R) => U): U;
  abstract isLeft(): boolean;
  abstract isRight(): boolean;
}

export class Left<L, R> extends Either<L, R> {
  constructor(private value: L) {
    super();
  }

  map<U>(_f: (value: R) => U): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  flatMap<U>(_f: (value: R) => Either<L, U>): Either<L, U> {
    return new Left<L, U>(this.value);
  }

  mapLeft<U>(f: (value: L) => U): Either<U, R> {
    return new Left<U, R>(f(this.value));
  }

  fold<U>(leftF: (left: L) => U, _rightF: (right: R) => U): U {
    return leftF(this.value);
  }

  isLeft(): boolean {
    return true;
  }

  isRight(): boolean {
    return false;
  }
}

export class Right<L, R> extends Either<L, R> {
  constructor(private value: R) {
    super();
  }

  map<U>(f: (value: R) => U): Either<L, U> {
    return new Right<L, U>(f(this.value));
  }

  flatMap<U>(f: (value: R) => Either<L, U>): Either<L, U> {
    return f(this.value);
  }

  mapLeft<U>(_f: (value: L) => U): Either<U, R> {
    return new Right<U, R>(this.value);
  }

  fold<U>(_leftF: (left: L) => U, rightF: (right: R) => U): U {
    return rightF(this.value);
  }

  isLeft(): boolean {
    return false;
  }

  isRight(): boolean {
    return true;
  }
}

// Утилиты для создания Either
export const either = {
  left: <L, R>(value: L): Either<L, R> => new Left<L, R>(value),
  right: <L, R>(value: R): Either<L, R> => new Right<L, R>(value),
  fromTryCatch: <T>(fn: () => T): Either<Error, T> => {
    try {
      return new Right<Error, T>(fn());
    } catch (error) {
      return new Left<Error, T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
  fromPromise: async <T>(promise: Promise<T>): Promise<Either<Error, T>> => {
    try {
      const result = await promise;
      return new Right<Error, T>(result);
    } catch (error) {
      return new Left<Error, T>(error instanceof Error ? error : new Error(String(error)));
    }
  },
};

// Типы для композиции функций
export type Fn<A, B> = (a: A) => B;
export type AsyncFn<A, B> = (a: A) => Promise<B>;

// Утилиты для композиции
export const compose = {
  // Композиция двух функций
  pipe2: <A, B, C>(f: Fn<A, B>, g: Fn<B, C>) => (a: A): C => g(f(a)),
  
  // Композиция трех функций
  pipe3: <A, B, C, D>(f: Fn<A, B>, g: Fn<B, C>, h: Fn<C, D>) => (a: A): D => h(g(f(a))),
  
  // Композиция массива функций
  pipe: <T>(...fns: Fn<T, T>[]) => (initial: T): T => 
    fns.reduce((acc, fn) => fn(acc), initial),
  
  // Асинхронная композиция
  pipeAsync: <T>(...fns: AsyncFn<T, T>[]) => async (initial: T): Promise<T> => {
    let result = initial;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  },
};

// Типы для каррирования
export type Curry2<A, B, C> = (a: A) => (b: B) => C;
export type Curry3<A, B, C, D> = (a: A) => (b: B) => (c: C) => D;

// Утилиты для каррирования
export const curry = {
  curry2: <A, B, C>(fn: (a: A, b: B) => C): Curry2<A, B, C> => 
    (a: A) => (b: B) => fn(a, b),
  
  curry3: <A, B, C, D>(fn: (a: A, b: B, c: C) => D): Curry3<A, B, C, D> => 
    (a: A) => (b: B) => (c: C) => fn(a, b, c),
};

// Типы для работы с массивами в функциональном стиле
export interface FunctionalArray<T> {
  map<U>(f: (item: T) => U): FunctionalArray<U>;
  filter(predicate: (item: T) => boolean): FunctionalArray<T>;
  reduce<U>(reducer: (acc: U, item: T) => U, initial: U): U;
  find(predicate: (item: T) => boolean): Maybe<T>;
  some(predicate: (item: T) => boolean): boolean;
  every(predicate: (item: T) => boolean): boolean;
  take(n: number): FunctionalArray<T>;
  drop(n: number): FunctionalArray<T>;
  toArray(): T[];
}

// Реализация функционального массива
export class FArray<T> implements FunctionalArray<T> {
  constructor(private items: T[]) {}

  map<U>(f: (item: T) => U): FunctionalArray<U> {
    return new FArray(this.items.map(f));
  }

  filter(predicate: (item: T) => boolean): FunctionalArray<T> {
    return new FArray(this.items.filter(predicate));
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initial: U): U {
    return this.items.reduce(reducer, initial);
  }

  find(predicate: (item: T) => boolean): Maybe<T> {
    const found = this.items.find(predicate);
    return maybe.fromNullable(found);
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.items.every(predicate);
  }

  take(n: number): FunctionalArray<T> {
    return new FArray(this.items.slice(0, n));
  }

  drop(n: number): FunctionalArray<T> {
    return new FArray(this.items.slice(n));
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// Утилита для создания функционального массива
export const farray = <T>(items: T[]): FunctionalArray<T> => new FArray(items);
