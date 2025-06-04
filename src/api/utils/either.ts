// Either тип для функционального программирования
export type Either<L, R> = Left<L> | Right<R>;

export interface Left<L> {
  readonly _tag: "Left";
  readonly left: L;
}

export interface Right<R> {
  readonly _tag: "Right";
  readonly right: R;
}

// Конструкторы
export const left = <L>(value: L): Either<L, never> => ({
  _tag: "Left",
  left: value,
});

export const right = <R>(value: R): Either<never, R> => ({
  _tag: "Right",
  right: value,
});

// Утилиты
export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> =>
  either._tag === "Left";

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> =>
  either._tag === "Right";

export const fold =
  <L, R, T>(onLeft: (left: L) => T, onRight: (right: R) => T) =>
  (either: Either<L, R>): T =>
    isLeft(either) ? onLeft(either.left) : onRight(either.right);

export const map =
  <L, R, T>(f: (right: R) => T) =>
  (either: Either<L, R>): Either<L, T> =>
    isRight(either) ? right(f(either.right)) : either;

export const flatMap =
  <L, R, T>(f: (right: R) => Either<L, T>) =>
  (either: Either<L, R>): Either<L, T> =>
    isRight(either) ? f(either.right) : either;
