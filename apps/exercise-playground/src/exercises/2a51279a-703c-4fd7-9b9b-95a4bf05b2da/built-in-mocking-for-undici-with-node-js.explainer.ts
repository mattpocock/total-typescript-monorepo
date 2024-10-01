// http://localhost:3004/courses/exercises/2a51279a-703c-4fd7-9b9b-95a4bf05b2da/edit

import { MockAgent, setGlobalDispatcher } from "undici";

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

const mockPool = mockAgent.get("http://localhost:3000");

mockPool
  .intercept({
    path: "/me",
    method: "GET",
  })
  .reply(200, {
    id: "123",
    name: "Matt",
  });

fetch("http://localhost:3000/me")
  .then((res) => res.json())
  .then((user) => {
    console.dir(user);
  });
