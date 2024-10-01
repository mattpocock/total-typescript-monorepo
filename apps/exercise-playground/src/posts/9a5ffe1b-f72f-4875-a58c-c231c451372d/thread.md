```ts twoslash
// 1. Import from undici, the HTTP client that drives
// Node's fetch function
import { MockAgent, setGlobalDispatcher } from "undici";

// 2. Create a new MockAgent, and set it as the global
// mechanism for dispatching HTTP requests
const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

// 3. Mock a certain URL
const mockPool = mockAgent.get("http://localhost:3000");

// 4. Mark the URL to intercept,
// and the reply to send back
mockPool
  .intercept({
    path: "/me",
    method: "GET",
  })
  .reply(200, {
    id: "123",
    name: "Matt",
  });

// 5. Any fetch requests to the URL will now be intercepted!
fetch("http://localhost:3000/me")
  .then((res) => res.json())
  .then((user) => {
    console.dir(user); // { id: '123', name: 'Matt' }
  });
```
