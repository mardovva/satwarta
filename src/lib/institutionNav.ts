export const INSTITUTION_EVENT = "satwarta:institution";

/** Gulir ke bagian Lembaga dan sorot barisnya (dipakai popup lingkaran posko di peta). */
export function goToInstitution(id: string) {
  window.dispatchEvent(new CustomEvent(INSTITUTION_EVENT, { detail: id }));
  const row = document.getElementById(`lembaga-${id}`) ?? document.getElementById("lembaga");
  row?.scrollIntoView({ behavior: "smooth", block: "center" });
}
