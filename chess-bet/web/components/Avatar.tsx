"use client";
/* Аватар игрока: загруженная картинка или круг с первой буквой. */
export default function Avatar({ src, name, size = 40 }: { src?: string; name?: string; size?: number }) {
  const st = { width: size, height: size, fontSize: size * 0.45 };
  if (src) return <img src={src} alt="" style={st} className="rounded-full object-cover shrink-0" />; // eslint-disable-line @next/next/no-img-element
  return (
    <span style={st} className="rounded-full shrink-0 inline-flex items-center justify-center font-bold text-white bg-gradient-to-br from-brand-500 to-brand-violet">
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}
