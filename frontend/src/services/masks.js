export const digits = (value) => value.replace(/\D/g, '');
export function cpfMask(value) {
  const n = digits(value).slice(0, 11);
  return n.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}
export function phoneMask(value) {
  const n = digits(value).slice(0, 11);
  if (n.length < 3) return n ? `(${n}` : '';
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  const part = n.length > 10 ? 7 : 6;
  return `(${n.slice(0, 2)}) ${n.slice(2, part)}-${n.slice(part)}`;
}
export function dateMask(value) {
  const n = digits(value).slice(0, 8);
  return [n.slice(0, 2), n.slice(2, 4), n.slice(4, 8)].filter(Boolean).join('/');
}
