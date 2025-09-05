export function keyify(str = "") {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase().trim().replace(/\s+/g, "-");
}
