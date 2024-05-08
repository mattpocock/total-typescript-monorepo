// Scopes and closures in TypeScript

let channels = [
  { id: 1, messages: [1, 2, 3] },
  { id: 2, messages: [4, 5] },
];

let channel = channels.find((c) => c.id === 1);

if (channel) {
  console.log(channel.id);

  channel.messages.map((message) => {
    // Why is channel possibly undefined?
    console.log(channel.id);
  });
}
