"use client";

export default function ReportButton() {
  const goToForm = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("lapor")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  return (
    <button
      onClick={goToForm}
      className="rounded-full bg-primary px-7 py-3 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
    >
      Buat laporan satwa terdampak
    </button>
  );
}
