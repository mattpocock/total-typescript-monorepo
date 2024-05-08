https://fettblog.eu/typescript-function-overload/

```ts twoslash
function fetchOrder(customer: Customer): Order[];
function fetchOrder(product: Product): Order[];
function fetchOrder(orderId: number): Order;
// the implementation
function fetchOrder(param: any): Order | Order[] {
  //...
}
```

```ts twoslash
function fetchOrder(customer: Customer): Order[];
function fetchOrder(product: Product): Order[];
function fetchOrder(orderId: number): Order;
function fetchOrder(orderId: Customer | Product): Order[];
function fetchOrder(
  orderId: Customer | number
): Order | Order[];
function fetchOrder(
  orderId: number | Product
): Order | Order[];
// the implementation
function fetchOrder(param: any): Order | Order[] {
  //...
}
```

```ts twoslash
type FetchParams = number | Customer | Product;

type FetchReturn<T> = T extends Customer
  ? Order[]
  : T extends Product
  ? Order[]
  : T extends number
  ? Order
  : never;

function fetchOrder<T extends FetchParams>(
  params: T
): FetchReturn<T> {
  //...
}
```
