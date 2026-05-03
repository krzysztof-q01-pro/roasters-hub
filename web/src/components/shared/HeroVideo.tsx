export function HeroVideo() {
  return (
    <video
      className="absolute inset-0 w-full h-full object-cover opacity-[0.55]"
      src="/videos/hero-bg-loop.mp4"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
    />
  );
}
