Here's a list of examples where discriminated unions can be useful in TypeScript:

- Restricting the properties of an object based on another property

```typescript
type Order =
  | {
      id: number;
      status: "pending" | "processing";
    }
  | {
      id: number;
      status: "shipped";
      shippingDate: Date;
    };

function getOrderInfo(order: Order) {
  if (order.status === "pending") {
    // shippingDate is not required for pending orders
    return `Order ${order.id} is pending`;
  } else if (order.status === "processing") {
    // shippingDate is required for processing orders
    return `Order ${order.id} is processing and will be shipped on ${order.shippingDate}`;
  } else {
    // shippingDate is required for shipped orders
    return `Order ${order.id} has been shipped on ${order.shippingDate}`;
  }
}

const order1: Order = {
  id: 1,
  status: "pending",
}; // Works
const order2: Order = {
  id: 2,
  status: "processing",
  shippingDate: new Date(),
}; // Works
const order3: Order = {
  id: 3,
  status: "shipped",
}; // Type error! shippingDate is required
```
