// Numbers stay in Western digits (not Eastern Arabic numerals) to match how
// this business already reads its figures — see docs/UI-UX.md.
export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatSyp(amountSyp: number): string {
  return `${formatNumber(amountSyp)} ل.س`;
}

// Arabic has distinct singular/dual/plural forms; this covers the small
// counts relative-time strings actually produce (1–10) and falls back to the
// singular-with-number form used for 11+, which is standard for this range.
function pluralize(count: number, forms: [string, string, string]): string {
  const [singular, dual, plural] = forms;
  if (count === 1) return singular;
  if (count === 2) return dual;
  if (count >= 3 && count <= 10) return `${formatNumber(count)} ${plural}`;
  return `${formatNumber(count)} ${singular}`;
}

export function formatRelativeArabic(date: Date, now = new Date()): string {
  const diffSeconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));

  if (diffSeconds < 60) {
    return "الآن";
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `منذ ${pluralize(diffMinutes, ["دقيقة", "دقيقتين", "دقائق"])}`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `منذ ${pluralize(diffHours, ["ساعة", "ساعتين", "ساعات"])}`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `منذ ${pluralize(diffDays, ["يوم", "يومين", "أيام"])}`;
}
