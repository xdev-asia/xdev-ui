/** Lower case without diacritics; "đ"/"Đ" fold to "d", so "Đà Nẵng" matches "da nang". */
export function foldText(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/đ/g, "d");
}
