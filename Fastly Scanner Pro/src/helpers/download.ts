type AcceptableObject = Record<string, unknown>;
type CreateFn = (arr: AcceptableObject[]) => Blob;
const createJSON: CreateFn = (arr) => {
  const jsonString = JSON.stringify(arr, null, 2);
  const footer = `\n\n// Designed with ❤️ by mehdisedighinasab\n// https://t.me/mehdisedighinasab`;
  const blob = new Blob([jsonString + footer], {
    type: "application/json;charset=utf-8;",
  });
  return blob;
};
const createCSV: CreateFn = (arr) => {
  const keys = Object.keys(arr[0] as AcceptableObject);
  const csvHeader = keys.join(",");
  const csvContent = arr
    .map((el) => keys.map((key) => String(el[key] || "")).join(","))
    .join("\n");
  const csvString = `${csvHeader}\n${csvContent}\n\n# Designed with ❤️ by mehdisedighinasab\n# https://t.me/mehdisedighinasab`;
  const blob = new Blob([csvString], { type: "text/csv" });
  return blob;
};
export function download(arr: AcceptableObject[], format: "json" | "csv") {
  if (!arr.length) return;
  const blob = format === "json" ? createJSON(arr) : createCSV(arr);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ip-list.${format}`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
