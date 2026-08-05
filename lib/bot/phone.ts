export function phoneVariants(raw: string): string[] {
  const digits = (raw || '').replace(/\D/g, '')
  if (!digits) return []

  const set = new Set<string>()
  set.add(digits)

  if (digits.startsWith('0') && digits.length >= 11) {
    set.add('2' + digits.slice(1))
    set.add('+20' + digits.slice(1))
  } else if (digits.startsWith('20') && digits.length >= 12) {
    set.add('0' + digits.slice(2))
    set.add('+' + digits)
  } else {
    set.add('+' + digits)
  }

  return Array.from(set)
}

export function phoneOrFilter(raw: string): string {
  return phoneVariants(raw).map((v) => `phone.eq.${v}`).join(',')
}
