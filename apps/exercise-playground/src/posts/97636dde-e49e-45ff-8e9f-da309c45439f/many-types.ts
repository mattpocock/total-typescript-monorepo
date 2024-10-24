type MyTypeHelper<T1, T2> = T1 extends T2 ? true : false;

type MyType1 = MyTypeHelper<1, 2>;
type MyType2 = MyTypeHelper<1, number>;
type MyType3 = MyTypeHelper<number, number>;
type MyType4 = MyTypeHelper<number, string>;
type MyType5 = MyTypeHelper<number, unknown>;
type MyType6 = MyTypeHelper<number, any>;
type MyType7 = MyTypeHelper<number, never>;
type MyType8 = MyTypeHelper<number, object>;
type MyType9 = MyTypeHelper<number, {}>;
type MyType10 = MyTypeHelper<number, []>;
type MyType11 = MyTypeHelper<number, [number]>;
type MyType12 = MyTypeHelper<number, [number, number]>;
type MyType13 = MyTypeHelper<number, [number, ...number[]]>;
type MyType14 = MyTypeHelper<number, [number, ...string[]]>;
type MyType15 = MyTypeHelper<number, [number, ...[number, number]]>;
