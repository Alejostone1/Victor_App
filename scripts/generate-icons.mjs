// Genera los íconos PNG de la app (npm run icons). Usa el generador de imágenes de Next (next/og).
import { writeFile } from "node:fs/promises";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const BLUE = "#2563eb";
const DARK = "#1d4ed8";

/** Burbuja de diálogo blanca con "Hi!" sobre fondo azul. `scale` reduce el dibujo (zona segura maskable). */
function icon(size, { scale = 1, rounded = false } = {}) {
  const s = (n) => Math.round(n * (size / 512) * scale);
  return h(
    "div",
    {
      style: {
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(160deg, ${BLUE} 0%, ${DARK} 100%)`,
        borderRadius: rounded ? Math.round(size * 0.22) : 0,
      },
    },
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: s(10) } },
      h(
        "div",
        {
          style: {
            width: s(340),
            height: s(230),
            background: "#ffffff",
            borderRadius: s(70),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: BLUE,
            fontSize: s(150),
            fontFamily: "Nunito",
            fontWeight: 900,
            letterSpacing: -s(4),
            boxShadow: `0 ${s(12)}px 0 rgba(0,0,0,0.18)`,
          },
        },
        "Hi!",
      ),
      // Colita de la burbuja: un cuadrado girado que asoma por debajo.
      h("div", {
        style: {
          width: s(64),
          height: s(64),
          background: "#ffffff",
          marginTop: -s(44),
          marginLeft: -s(150),
          transform: "rotate(45deg)",
          borderRadius: s(10),
        },
      }),
    ),
  );
}

/** Nunito Black (la fuente de la app) desde Google Fonts, en TTF. */
async function loadFont() {
  const css = await (await fetch("https://fonts.googleapis.com/css2?family=Nunito:wght@900")).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error("No encontré la fuente Nunito en TTF");
  return (await fetch(url)).arrayBuffer();
}
const fonts = [{ name: "Nunito", data: await loadFont(), weight: 900, style: "normal" }];

async function save(path, element, size) {
  const res = new ImageResponse(element, { width: size, height: size, fonts });
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
  console.log("✓", path);
}

await save("public/icons/icon-192.png", icon(192), 192);
await save("public/icons/icon-512.png", icon(512), 512);
await save("public/icons/icon-maskable-512.png", icon(512, { scale: 0.78 }), 512);
await save("public/icons/apple-touch-icon.png", icon(180), 180);
await save("src/app/icon.png", icon(64, { rounded: true }), 64);
