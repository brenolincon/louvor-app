export function formatDateBR(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}
