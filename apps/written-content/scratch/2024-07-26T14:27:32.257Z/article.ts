function isValid(value: string | number, options: any) {
  return value < options.max ?? 100;
}
