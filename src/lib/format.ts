export function formatMegabytes(bytes: number, locale: string): string {
  const megabytes = bytes / 1_000_000;
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(megabytes);
  return `${formatted} MB`;
}

export function regionLabel(
  regionName: string | null | undefined,
  regionCode: string | null | undefined,
  notSpecified: string
): string {
  return regionName || regionCode || notSpecified;
}
