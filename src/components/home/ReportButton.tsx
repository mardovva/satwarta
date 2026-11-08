"use client";

export default function ReportButton() {
  const goToForm = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("lapor")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  return (
    <button
      onClick={goToForm}
      className="inline-flex w-full max-w-[19rem] items-center justify-center rounded-full border border-white/40 bg-primary/75 backdrop-blur-xl backdrop-saturate-150 shadow-nav px-7 py-3 sm:w-[19rem] text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      Buat laporan satwa terdampak
    </button>
  );
}
