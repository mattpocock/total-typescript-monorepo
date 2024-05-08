declare const num: 2 | 3;

(async () => {
  const filename = `example-${num}` as const;
  const { default: example } = await import(
    `./${filename}`
  );
  example();
})();
