// Do a fetch against localhost:3005 100,000 times
for (let i = 0; i < 100000; i++) {
  await fetch("http://localhost:3006").then((res) => res.text());
}
