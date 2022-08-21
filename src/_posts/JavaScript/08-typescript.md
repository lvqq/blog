---
category: JavaScript
tags:
  - TypeScript
date: 2022-08-22
title: 超详细的 TypeScript 入门总结
vssue-title: 超详细的 TypeScript 入门总结
---

![](https://img.chlorine.site/2022-08-21/typescript.png)

本文旨在总结 `TypeScript` 的体系化知识，帮助你了解并熟悉 `TypeScript` 的各项特性

<!-- more -->

## 什么是 TypeScript
`TypeScript` 是 `JavaScript` 的超集，通过添加静态类型定义与检查来对 `JavaScript` 进行扩展，`TypeScript` 与 `JavaScript` 的关系类似 `Less/Sass` 与 `Css`

## 为什么需要 TypeScript
`JavaScript` 是弱类型语言，很多错误会在运行时才被发现，而 `TypeScript` 提供的静态类型检查可以帮助开发者避免大部分运行时的错误，并且能够大大增强代码的可维护性。相应的，付出的代价则是开发阶段需要书写相关的类型，成本方面有一定的提升

## Playground
`TypeScript` 官方提供了一个在线的 `TypeScript` 开发环境 Playground，你可以很方便地在上面进行 `TypeScript` 的相关练习，支持配置 `tsconfig`，静态类型检测以及 `TypeScript` 代码编译执行等
- [Playground](https://www.typescriptlang.org/zh/play)

## 原始数据类型
在 `TypeScript` 中，对于 `JavaScript` 中的原始数据类型都有对应的类型：
- string
- number
- boolean
- undefined
- null
- symbol
- bigint

e.g.
```typescript
const str: string = 'text'
const num: number = 1
const bool: boolean = true
const undef: undefined = undefined
const null: null = null
const symb: symbol = Symbol('symb')
const bigint: bigint = BigInt(9007199254740993)
```


### object
- `object` 表示所有的非原始类型，包括数组、对象、函数等

e.g.
```typescript
let demo: object 
demo = []
demo = {}
demo = () => {}
demo = 1 // Error: Type 'number' is not assignable to type 'object'
```

### Object 与 {}
在 `JavaScript` 里 `Object` 是所有原型链的最上层，在 `TypeScript` 里则表现为 `Object` 可以表示所有的类型， 而 `{}` 均表示所有非 `null` 和 `undefined` 的类型
```typescript
let demo1: Object
demo1 = []
demo1 = {}
demo1 = 1
// null, undefined 需要在 strictNullChecks=false 时才可以
demo1 = null 
demo1 = undefined 

let demo2: {}
demo2 = []
demo2 = {}
demo2 = 1
demo2 = null // Error: Type 'null' is not assignable to type '{}'
demo2 = undefined // Error: Type 'undefined' is not assignable to type '{}'
```

>使用建议：
>1. 在任何时候都不要使用 `Object` 及类似的装箱类型
>2. 避免使用 `{}`，它表示任何非 `null/undefined` 的值，与 `any` 类似
>3. 对于无法确定类型，但可以确定不为原始类型的，可以使用 `object` -- 更推荐使用具体的描述：`Record<string, any>` 或者 `unknown[]` 等

## 其他类型
### 数组
数组定义有两种方式：
```typescript
const arr: string[] = []
// 等价于
const arr: Array<string> = []
```

### 元组
数组合并了相同的类型，元组则合并不同的类型：
```typescript
const tup: [string, number] = ['LiHua', 18]
```

元祖中的选项还可以是可选的
```typescript
// 支持可选
const tup1: [string, number?] = ['LiHua']
// 支持对属性命名
const tup2: [name: string, age?: number] = ['LiHua']
// 一个 react useState 的例子
const [state, setState] = useState();
```

### 函数
函数定义方式可以是以下几种：
```typescript
// 函数式声明
function test1(x: number, y: number): number {
    return x + y
}
// 表达式声明
const test2: (x: number, y: number) => number = (x, y) => {
    return x + y
}
// 或
const test3 = (x: number, y: number): number => {
    return x + y
}
```

### void
在 `JavaScript` 中，`void` 作为立即执行的函数表达式，用于获取 `undefined`：
```javascript
// 返回 undefined
void 0 
// 等价于 
void(0)
```

在 `TypeScript` 中则描述了一个函数没有显示返回值时的类型，例如下面这几种情况都可以用 void 来描述：
```typescript
// case 1
function test1() {}

// case 2
function test2() {
    return;
}

// case 3
function test3() {
    return undefined;
}
```

### any 与 unknown
- any: 表示任意类型，且不会对其进行类型推断和类型校验
- unknown: 表示一个未知的类型，会有一定的类型校验

**区别**
1. 任意类型都能赋值给 `any`，`any` 也可以赋值给任意类型；任意类型都能赋值给 `unknown`，但是 `unknown` 只能赋值给 `unknown/any` 类型：
```typescript
let type1: any
// 被任意类型赋值
type1 = 1
// 赋值给任意类型
let type2: number = type1 

let type3: unknown
// 被任意类型赋值
type3 = 1 
// 赋值给任意类型
let type4: number = type3 // Error: Type 'unknown' is not assignable to type 'number'
```

2. unknown 在不进行类型推断的时候，无法直接使用；any 则没有这个限制
```typescript
let str1: unknown = 'string';
str1.slice(0, 1) // Error: Object is of type 'unknown'.

let str2: any = 'string';
str2.slice(0, 1) // Success
```

添加类型推断后则可以正常使用：
```typescript
let str: unknown = 'string';
// 1. 通过 as 类型断言
(str as string).slice(0, 1) 

// 2. 通过 typeof 类型推断
if (typeof str === 'string') {
    str.slice(0, 1)
}
```

> 滥用 any 的一些场景以及使用建议：
> 1. 类型不兼容时使用 `any`：推荐使用 `as` 进行类型断言
> 2. 类型太复杂不想写使用 `any`：推荐使用 `as` 进行类型断言，找到你所需要的最小单元
> 3. 不清楚具体类型是什么而使用 `any`：推荐声明时使用 `unknown` 来代替，在具体调用的地方再进行断言

### never
表示不存在的类型，一般在抛出异常以及出现死循环的时候会出现，对于数组而言，定义的时候未指定类型，`TypeScript` 会将其视为 `never[]`
```typescript
// 1.抛出异常
function test1(): never {
    throw new Error('err')
}

// 2. 死循环
function test2(): never {
    while(true) {}
}

// 3. 数组未定义类型
const arr = []  // never[]
```
`never` 也存在主动的使用场景，比如我们可以进行详细的类型检查，对穷举之后剩下的 else 条件分支中的变量设置类型为 `never`，这样一旦 `value` 发生了类型变化，而没有更新相应的类型判断的逻辑，则会产生报错提示
```typescript
const checkValueType = (value: string | number) => {
    if (typeof value === 'string') {
        // do something
    } else if (typeof value === 'number') {
        // do something
    } else {
        const check: never = value
        // do something
    }
}
```

例如这里 value 发生类型变化而没有做对应处理，此时 else 里的 `value` 则会被收窄为 `boolean`，无法赋值给 `never` 类型，导致报错，这样可以确保处理逻辑总是穷举了 `value` 的类型：
```typescript
const checkValueType = (value: string | number | boolean) => {
    if (typeof value === 'string') {
        // do something
    } else if (typeof value === 'number') {
        // do something
    } else {
        const check: never = value // Error: Type 'boolean' is not assignable to type 'never'.
        // do something
    }
}
```
## 字面量类型
指定具体的值作为类型，一般与联合类型一起使用：
```typescript
const num_literal: 1 | 2 = 1
const str_literal: "text1" | "text2" = "text1"
```

## 枚举
枚举使用 `enum` 关键字来声明：
```typescript
enum TestEnum {
    key1 = 'value1',
    key2 = 2
}
```

`JavaScript` 对象是单向映射，而对于 `TypeScript` 中的枚举，字符串类型是单向映射，数字类型则是双向映射的，上面的枚举编译成 `JavaScript` 会被转换成如下内容：
```javascript
"use strict";
var TestEnum;
(function (TestEnum) {
    TestEnum["key1"] = "value1";
    TestEnum[TestEnum["key2"] = 2] = "key2";
})(TestEnum || (TestEnum = {}));
```

对于数字类型的枚举，相当于执行了 `obj[k] = v` 和 `obj[v] = k`，以此来实现双向映射

## 常量枚举
使用 `const` 定义，与普通枚举的区别主要在于不会生成上面的辅助函数 `TestEnum`，编译产物只有 `const val = 2`
```typescript
const enum TestEnum {
    key1 = 'value1',
    key2 = 2
}
const val = TestEnum.key2
```

## 接口
接口 `interface` 是对行为的抽象， `TypeScript` 里常用来对对象进行描述

### 可选
可选属性，通过`?` 将该属性标记为可选
```typescript
interface Person {
    name: string
    addr?: string
}
```

### readonly
只读属性，对于对象修饰对象的属性为只读；对于 数组/元组 只能将整个 数组/元组 标记为只读
```typescript
interface Person {
    name: string
    readonly age: number
}
const person: Person = { name: 'LiHua', age: 18 }
person.age = 20 // Cannot assign to 'age' because it is a read-only property

const list: readonly number[] = [1, 2]
list.push(3) // Property 'push' does not exist on type 'readonly number[]'.
list[0] = 2 // Index signature in type 'readonly number[]' only permits reading
```

### 类型别名
类型别名主要利用 `type` 关键字，来用于对一组特定类型进行封装，我们在 `TypeScript` 里的类型编程以及各种类型体操都离不开类型别名
```typescript
type Person = {
    name: string;
    readonly age: number;
    addr?: string;
}
```

### Interface 与 type 的异同点
相同点：
- 都可以用来定义对象，都可以实现扩展
```typescript
type Person = {
    name: string
}

// 接口通过继承的方式实现类型扩展：
interface Person1 extends Person {
    age: number
}

// 类型别名通过交叉类型的方式实现类型扩展：
type Person2 = Person & {
    age: number
}
```

不同点：
1. `type` 可以用来定义原始类型、联合/交叉类型、元组等，`interface` 则不行
```typescript
type str = string
type num = number
type union = string | number
type tup = [string, number]
```

2. `interface` 声明的同名类型可以进行合并，而 `type` 则不可以，会报标识符重复的错误
```typescript
interface Person1 {
    name: string
}
interface Person1 {
    age: string
}
let person: Person1 // { name: string; age: string } 
type Person2 {
    name: string
}
// Error: Duplicate identifier 'Person2'
type Person2 {
    age: string
}
```

3. `interface` 会有索引签名的问题，而 `type` 没有
```typescript
interface Test1 {
    name: string
}
type Test2 = {
    name: string
}
const data1: Test1 = { name: 'name1' }
const data2: Test2 = { name: 'name2' }
interface PropType {
    [key: string]: string
}
let prop: PropType
prop = data1 // Error: Type 'Test2' is not assignable to type 'PropType'. Index signature for type 'string' is missing in type 'Test2'
prop = data2 // success
```
因为只有当该类型的所有属性都已知并且可以对照该索引签名进行检查时，才允许将子集分配给该索引签名类型。而 `interface` 允许类型合并，所以它的最终类型是不确定的，并不一定是它定义时的类型；`type` 声明的类型时的索引签名是已知的

> 建议：<br>
> 官方推荐使用 `interface`，当 `interface` 无法满足，例如需要定义联合类型等，再选择使用 `type`<br>
> [TypeScript/type-aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)

## 联合类型与交叉类型
### 联合类型
表示一组可用的类型集合，只要属于其中之一就属于这个联合类型
```typescript
const union: string | number = 'text'
```

### 交叉类型
表示一组类型的叠加，需要满足所有条件才可以属于这个交叉类型，一般用于接口的合并
```typescript
interface A {
    field1: string
}

interface B {
    field2: number
}

const test: A & B = { field1: 'text', field2: 1 }
```

如果新的类型不可能存在，则会被转换为 `never`，例如这里的 `number & string`：
```typescript
type A = number
type B = string
type Union = A & B // never
```

对于对象类型的交叉类型，会按照同名属性进行交叉，例如下面的 `common` 需要即包含 `fieldA` 也包含 `fieldB`：
```typescript
interface A {
        field1: string
        common: {
        fieldA: string
    }
}

interface B {
        field2: number
        common: {
        fieldB: number
    }
}

const fields: A & B = { 
    field1: 'text1', 
    field2: 1, 
    common: { fieldA: 'text2', fieldB: 2 } 
} 
// success
```

## 如何绕过类型检测
### [鸭子类型](https://zh.m.wikipedia.org/zh-hans/%E9%B8%AD%E5%AD%90%E7%B1%BB%E5%9E%8B)

> “当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。”<br>

鸭子类型放在 `TypeScript` 里来说就是我们可以在鸟上构建走路、游泳、叫等方法，创建一只像鸭子的鸟，来绕开对鸭子的类型检测

e.g.
```typescript
interface Param {
    field1: string
}

const func = (param: Param) => param
func({ field1: '111', field2: 2 }) // Error

const param1 = { field1: '111', field2: 2 }
func(param1) // success
```
在这里我们构造了一个函数 `func` 接受参数为 `Param` ，当我们直接调用 `func` 传参时，相当于是赋值给变量 `param`，此时会严格按照参数校验进行，因此会报错；

而如果我们使用一个变量存储，再将变量传递给 `func`，此时则会应用鸭子类型的特性，因为 `param1` 中 包含 `field1` ，`TypeScript` 会认为 `param1` 已经完全实现了 `Param` ，可以认为 `param1` 对应的类型是 `Param` 的子类，这个时候则可以绕开对多余的 `field2` 的检测

### 类型断言
类型断言也可以绕过类型检测，上面的例子可以改成用类型断言来实现：
```typescript
interface Param {
    field1: string
}

const func = (param: Param) => param
func({ field1: '111', field2: 2 } as Param) // success
```

另外一种断言方式是非空断言，利用 `!` 关键词，可以从类型中排除 `undefined` 和 `null` ：
```typescript
const func = (str: string) => str
const param = ['text1', 'text2'].find(str => str === 'text1')
func(param) // Error
func(param!) // success
```

## 泛型
泛型是一种抽象类型，只有在调用时才知道具体的类型。如果将类型类比为函数，那么泛型就相当于函数中的参数了
```typescript
// 定义
type Test<T> = T | string;
// 使用
const test: Test<number> = 1
// react 中的例子
const [state, setState] = useState<number>(0)
```

函数中定义泛型
```typescript
// 函数式声明
function func<T>(param: T): T {
    return param;
}

// 表达式声明
const func: <T>(param: T) => T = (param) => {
    return param;
}
```

### 类型操作符
在 `TypeScript` 中，可以通过类型操作符来对类型进行操作，基于已有的类型创建新的类型，主要包括以下几种：

### typeof
`typeof` 可以获取变量或者属性对应的类型，返回的是一个 TypeScript 类型：
```typescript
const str = 'text'
type Str = typeof str // string
```

对于对象类型的变量，则会保留键名，返回推断得到的键值的类型：
```typescript
const obj = {
    field1: 'text',
    field2: 1,
    field3: {
        field: 'text'
    }
}

type ObjType = typeof obj
// {
// field1: string;
// field2: number;
// field3: {
// field: string;
// };
// }
```

> 注意：<br>
> 如果你为变量指定了相应的类型，例如 `any`，那么 `typeof` 将会直接返回你预定义的类型而不会进行类型推断

### keyof
`keyof` 用于获取类型中所有的键，返回一个联合类型：
```typescript
interface Test {
    field1: string;
    field2: number;
}

type Fields = keyof Test
// "field1" | "field2"
```

### in
`in` 用于遍历类型，它是 `JavaScript` 里已有的概念：
```typescript
type Fields = 'field1' | 'field2'
type Test = {
 [key in Fields]: string
}
// Test: { field1: string; field2: string }
```

### extends
`extends` 用于对泛型添加约束，使得泛型必须继承这些类型，例如这里要求泛型 `T` 必须要属于 `string` 或者 `number`：
```typescript
type Test<T extends string | number> = T[]
type TestExtends1 = Test<string> // success
type TestExtends2 = Test<boolean> // Type 'boolean' does not satisfy the constraint 'string | number'.
```

`extends` 还可以在条件判断语句中使用：
```typescript
type Test<T> = T extends string | number ? T[] : T
type TestExtends1 = Test<string> // string[]
type TestExtends2 = Test<boolean> // boolean
```

### infer
`infer` 主要用于声明一个待推断的类型，只能结合 `extends` 在条件判断语句中使用，我们以内置的工具类 `ReturnType` 为例，它主要作用是返回一个函数返回值的类型，这里用 `infer` 表示待推断的函数返回值类型：
```typescript
type ReturnType<T extends (...args: any) => any> = T extends (
    ...args: any
) => infer R ? R : any
```

## 索引类型与映射类型
### 索引类型
这里声明了一个包含索引签名且键为 `string` 的类型：
```typescript
interface Test {
    [key: string]: string;
}
```

包含索引签名时，其他具体键的类型也需要符合索引签名声明的类型：
```typescript
interface Test {
    // Error: Property 'field' of type 'number' is not assignable to 'string' index type 'string'
    field: number;
    [key: string]: string;
}
```

获取索引类型，通过 `keyof` 关键字，返回一个由索引组成的联合类型：
```typescript
interface Test {
    field1: string;
    field2: number;
}

type Fields = keyof Test
// "field1" | "field2"
```

访问索引类型，通过访问键的类型，来获取对应的索引签名的类型：
```typescript
interface Test {
    field1: string;
    field2: number
}

type Field1 = Test["field1"] // string
type Field2 = Test["field2"] // number
// 配合 keyof，可以获取索引签名对应类型的联合类型
type Fields = Test[keyof Test] // string | number
```

> 注意：<br>
> 这里的 field1/field2 不是字符串，而是字面量类型

因此我们还可以通过键的类型来访问：
```typescript
interface Test {
    [key: string]: number;
}

type Field = Test[string] // number
```

### 映射类型
与索引类型常常搭配使用的是映射类型，主要概念是根据键名映射得到键值类型，从旧的类型生成新的类型。我们利用 `in` 结合 `keyof` 来对泛型的键进行遍历，即可得到一个映射类型，很多 TypeScript 内置的工具类的实现都离不开映射类型。

以实现一个简单的 `ToString` ，能将接口中的所有类型映射为 `string` 类型为例：
```typescript
type ToString<T> = {
    [key in keyof T]: string
}

interface Test {
    field1: string;
    field2: number;
    field3: boolean;
}

type Fields = ToString<Test>
```

## 工具类型
这里我们列举了一些 `TypeScript` 内置的常用工具链的具体实现：

### Partial
将所有属性变为可选，首先通过 `in` 配合 `keyof` 遍历 `T` 的所有属性赋值给 `P`，然后配合 `?` 将属性变为可选，最后 `T[P]` 以及 `undefined` 作为返回类型：
```typescript
type Partial<T> = { 
    [P in keyof T]?: T[P] | undefined; 
}
```

使用示例：
```typescript
interface Person {
    name: string;
    age?: number;
}
type PersonPartial = Partial<Person>
// { name?: string | undefined; age?: number | undefined }
```

`Partial` 只能将最外层的属性变为可选，类似浅拷贝，如果要想把深层地将所有属都变成可选，可以手动实现一下：
```typescript
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] | undefined
}
```

### Required
将所有属性变为必选，与 `Partial` 实现的思路类似，只不过变成了通过 `-?` 来去除可选符号：
```typescript
type Required<T> = { 
    [P in keyof T]-?: T[P]; 
}
```

使用示例：
```typescript
interface Person {
    name: string;
    age?: number;
}

type PersonRequired = Required<Person>
// { name: string; age: number }
```

### Readonly
将所有属性都变成只读，不可修改，与 `Partial` 实现的思路类似，利用 `readonly` 关键字来标识：
```typescript
type Readonly<T> = { 
    readonly [P in keyof T]: T[P]; 
}
```

使用示例：
```typescript
interface Person {
    name: string;
    age?: number;
}

type PersonReadonly = Readonly<Person>
// { readonly name: string; readonly age?: number | undefined }
```

### Record
以指定的类型生成对应类型的键值对，例如我们经常会使用 `Record<string, unknown>` 或者 `Record<string, any>` 来对对象的类型进行声明，这里主要通过 `K extends string | number | symbol` 来限制 `K` 必须符合索引的类型：
```typescript
type Record<K extends string | number | symbol, T> = { 
    [P in K]: T; 
}
```

### Exclude
移除属于指定类型的部分，通过判断如果 `T` 继承自 `U`，那么返回 `never` ，则会移除 `T` 中属于 `U` 的类型：
```typescript
type Exclude<T, U> = T extends U ? never : T
```

使用示例：
```typescript
type Test = string | number
type TestExclude = Exclude<Test, string> // number
```

### Extract
保留属于指定类型的部分，与 `Exclude` 逻辑相对应，在这里则指保留 `T` 中属于 `U` 的类型：
```typescript
type Extract<T, U> = T extends U ? T : never
```

使用示例：
```typescript
type Test = string | number
type TestExclude = Extract<Test, string> // string
```

### NonNullable
去除类型中的 `null` 和 `undefined` ：
```typescript
type NonNullable<T> = T extends null | undefined ? never : T
```

使用示例：
```typescript
type Test = string | number | null | undefined
type TestExclude = NonNullable<Test> // string | number
```

### Pick
以选中的属性生成新的类型，类似 `lodash.pick`，这里首先通过 `extends` 配置 `keyof` 获取到 `T` 中的所有子类型并赋值给 `K`，当 `P` 属于 `K` 中的属性时，返回 `T` 对应的类型 `T[P]`：
```typescript
type Pick<T, K extends keyof T> = { 
    [P in K]: T[P]; 
}
```

使用示例：
```typescript
interface Person {
    name: string;
    age?: number;
}

type PersonPick = Pick<Person, 'age'>
// { age?: number }
```

### Omit
排除选中的属性，以剩余的属性生成新的类型，与 `Pick` 作用刚好相反，类似 `lodash.omit` ，这里首先通过 `Exclude<keyof T, K>` 来去除掉 `T` 中包含的属性 `K`，然后当 `P` 属于该去除后的类型时，返回 `T` 对应的类型 `T[P]`：
```typescript
type Omit<T, K extends string | number | symbol> = { 
    [P in Exclude<keyof T, K>]: T[P]; 
}
```

使用示例：
```typescript
interface Person {
    name: string;
    age?: number;
}

type PersonOmit = Omit<Person, 'name'>
// { age?: number }
```

### Parameters
获得函数参数的类型，返回一个元组，这里首先通过扩展运算法，将泛型函数中的参数通过 `infer` 定义为 `P`，然后判断 `T` 是否符合函数的类型定义，如果是则返回 `P`：
```typescript
type Parameters<T extends (...args: any) => any> = T extends (
    ...args: infer P
) => any ? P : never
```

使用示例：
```typescript
type Func = (param: string) => string[]
type FuncReturn = Parameters<Func> // [param: string]
```

### ReturnType
获取函数返回值的类型，实现与 `Parameters` 类似，将定义的类型从函数参数调整为函数的返回值类型：
```typescript
type ReturnType<T extends (...args: any) => any> = T extends (
    ...args: any
) => infer R ? R : any
```

```typescript
type Func = (param: string) => string[]
type FuncReturn = ReturnType<Func> // string[]
```

## tsconfig
`tsconfig` 是 `TypeScript` 的项目配置文件，通过它你可以配置 `TypeScript` 的各种类型检查以及编译选项，这里主要介绍一些常用的 `compilerOptions` 选项：
```json
// tsconfig.json
{
    "compilerOptions": {
        /* 构建、工程化选项 */

        // baseUrl: 解析的根目录
        "baseUrl": "src"
        // target: 编译代码到目标 ECMAScript 版本，一般是 es5/es6
        "target": "es5", 
        // lib: 运行时环境支持的语法，默认与 tagert 的值相关联
        "lib": ["dom", "es5", "es6", "esnext"], 
        // module: 编译产物对应的模块化标准，常用值包括 commonjs/es6/esnext 等
        "module": "esnext", 
        // moduleResolution: 模块解析策略，支持 node/classic，后者基本不推荐使用
        "moduleResolution": "node",
        // allowJs：是否允许引入 .js 文件
        "allowJs": true,
        // checkJs: 是否检查 .js 文件中的错误
        "checkJs": true,
        // declaration: 是否生成对应的 .d.ts 类型文件，一般作为 npm 包提供时需要开启
        "declaration": false,
        // sourceMap: 是否生成对应的 .map 文件
        "sourceMap": true, 
        // noEmit: 是否将构建产物写入文件系统，一个常见的实践是只用 tsc 进行类型检查，使用单独的打包工具进行打包
        "noEmit": true,
        // jsx: 如何处理 .tsx 文件中对于 jsx 的生成，常用值包括：react/preserve
        // 详细比对：https://www.typescriptlang.org/tsconfig#jsx
        "jsx": "preserve",
        // esModuleInterop: 开启后会生成辅助函数以兼容处理在 esm 中导入 cjs 的情况
        "esModuleInterop": true,
        // allowSyntheticDefaultImports: 在 cjs 没有默认导出时进行兼容，配合 esModuleInterop 使用
        "allowSyntheticDefaultImports": true,
        // forceConsistentCasingInFileNames: 是否强制导入文件时与系统文件的大小写一致
        "forceConsistentCasingInFileNames": true,
        // resolveJsonModule：是否支持导入 json 文件，并做类型推导和检查
        "resolveJsonModule": true,
        // experimentalDecorators: 是否支持装饰器实验性语法
        "experimentalDecorators": true,

        /* 类型检查选项 */
        
        // strict: 是否启动严格的类型检查，包含一系列选项：https://www.typescriptlang.org/tsconfig#strict
        "strict": true,
        // skipLibCheck: 是否跳过非源代码中所有类型声明文件（.d.ts）的检查
        "skipLibCheck": true,
        // strictNullChecks: 是否启用严格的 null 检查
        "strictNullChecks": true,
        // noImplicitAny: 包含隐式 any 声明时是否报错
        "noImplicitAny": true,
        // noImplicitReturns: 是否要求所有函数执行路径中都有返回值
        "noImplicitReturns": true,
        // noUnusedLocals: 存在未使用的变量时是否报错
        "noUnusedLocals": false,
        // noUnusedParameters: 存在未使用的参数时是否报错
        "noUnusedParameters": false,
    }
}
```

## 关于
- 完整的示例代码可以参考：[blog-samples/typescript](https://github.com/lvqq/blog-samples/tree/master/typescript)