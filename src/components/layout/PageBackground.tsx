// background.png sudah memiliki alpha ~10% bawaan, jadi tidak diberi opacity tambahan.
export default function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative bg-cream bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/images/background/background.png')" }}
    >
      {children}
    </div>
  );
}
