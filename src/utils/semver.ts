export function compareSemver(a: string, b: string) {
  const parse = (value: string) =>
    value
      .split('.')
      .map(part => Number.parseInt(part, 10))
      .map(num => (Number.isNaN(num) ? 0 : num));

  const [a1 = 0, a2 = 0, a3 = 0] = parse(a);
  const [b1 = 0, b2 = 0, b3 = 0] = parse(b);

  if (a1 !== b1) return a1 > b1 ? 1 : -1;
  if (a2 !== b2) return a2 > b2 ? 1 : -1;
  if (a3 !== b3) return a3 > b3 ? 1 : -1;
  return 0;
}
