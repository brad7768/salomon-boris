import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

// ─── Category labels & accent colors ─────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; accent: string }> = {
  methodes:   { label: "Méthodes",    accent: "#48CAE4" },
  cours:      { label: "Cours",       accent: "#90E0EF" },
  tablatures: { label: "Tablatures",  accent: "#CAF0F8" },
  blog:       { label: "Blog",        accent: "#ADE8F4" },
};

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title       = (searchParams.get("title")       ?? "Salomon Boris").slice(0, 80);
  const description = (searchParams.get("description") ?? "Guitare & Musique").slice(0, 120);
  const category    = searchParams.get("category") ?? "";
  const level       = searchParams.get("level") ?? "";

  const catMeta = CATEGORY_META[category] ?? null;
  const accent  = catMeta?.accent ?? "#90E0EF";

  // Trim title to 2 lines of ~35 chars
  const displayTitle = title.length > 55
    ? title.slice(0, 55).trim() + "…"
    : title;

  const displayDesc = description.length > 95
    ? description.slice(0, 95).trim() + "…"
    : description;

  return new ImageResponse(
    (
      <div
        style={{
          display:        "flex",
          flexDirection:  "column",
          width:          "100%",
          height:         "100%",
          background:     "linear-gradient(150deg, #03045E 0%, #01013A 55%, #020228 100%)",
          padding:        "52px 60px",
          position:       "relative",
          overflow:       "hidden",
          fontFamily:     "'Georgia', 'Times New Roman', serif",
        }}
      >
        {/* ── Decorative: guitar strings (6 horizontal lines) ── */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              position:   "absolute",
              left:       0,
              right:      0,
              top:        `${18 + i * 11}%`,
              height:     i < 3 ? "1px" : "1.5px",
              background: `rgba(144, 224, 239, ${0.04 + i * 0.012})`,
            }}
          />
        ))}

        {/* ── Decorative: ambient glow ── */}
        <div
          style={{
            position:     "absolute",
            top:          "-120px",
            right:        "-120px",
            width:        "500px",
            height:       "500px",
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(0, 119, 182, 0.18) 0%, transparent 70%)",
          }}
        />

        {/* ── TOP ROW: logo + optional category badge ── */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            marginBottom:   "auto",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display:     "flex",
              alignItems:  "center",
              gap:         "12px",
            }}
          >
            {/* Guitar icon */}
            <div
              style={{
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                width:           "44px",
                height:          "44px",
                borderRadius:    "10px",
                background:      "rgba(255,255,255,0.10)",
                border:          "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <span
              style={{
                color:      "rgba(255,255,255,0.70)",
                fontSize:   "20px",
                fontWeight: "600",
                letterSpacing: "-0.3px",
              }}
            >
              Salomon Boris
            </span>
          </div>

          {/* Category badge */}
          {catMeta && (
            <div
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          "6px",
                background:   "rgba(255,255,255,0.08)",
                border:       `1px solid ${accent}40`,
                borderRadius: "100px",
                padding:      "6px 16px",
              }}
            >
              <div
                style={{
                  width:        "7px",
                  height:       "7px",
                  borderRadius: "50%",
                  background:   accent,
                }}
              />
              <span
                style={{
                  color:       accent,
                  fontSize:    "16px",
                  fontWeight:  "700",
                  fontFamily:  "system-ui, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {catMeta.label}
              </span>
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ── */}
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            gap:           "20px",
            marginTop:     "auto",
            marginBottom:  "auto",
            paddingTop:    "40px",
            paddingBottom: "32px",
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontSize:      displayTitle.length > 42 ? "52px" : "64px",
              fontWeight:    "700",
              color:         "#FFFFFF",
              margin:        0,
              lineHeight:    1.12,
              letterSpacing: "-1px",
              maxWidth:      "860px",
            }}
          >
            {displayTitle}
          </h1>

          {/* Accent line */}
          <div
            style={{
              width:        "56px",
              height:       "3px",
              borderRadius: "2px",
              background:   `linear-gradient(90deg, ${accent}, transparent)`,
            }}
          />

          {/* Description */}
          {displayDesc && (
            <p
              style={{
                fontSize:   "24px",
                color:      "rgba(255,255,255,0.58)",
                margin:     0,
                maxWidth:   "780px",
                lineHeight: 1.45,
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: "400",
              }}
            >
              {displayDesc}
            </p>
          )}
        </div>

        {/* ── BOTTOM BAR ── */}
        <div
          style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "space-between",
            paddingTop:      "20px",
            borderTop:       "1px solid rgba(255,255,255,0.08)",
            marginTop:       "auto",
          }}
        >
          <span
            style={{
              color:      "rgba(255,255,255,0.35)",
              fontSize:   "16px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            salomonboris.com
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {["Guitare", "Méthodes", "Tablatures", "Cours"].map((tag, idx) => (
              <span
                key={tag}
                style={{
                  color:        "rgba(255,255,255,0.30)",
                  fontSize:     "14px",
                  fontFamily:   "system-ui, sans-serif",
                  paddingLeft:  idx > 0 ? "8px" : "0",
                  borderLeft:   idx > 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Level badge */}
          {level && (
            <span
              style={{
                background:   "rgba(255,255,255,0.08)",
                color:        "rgba(255,255,255,0.50)",
                fontSize:     "14px",
                fontFamily:   "system-ui, sans-serif",
                padding:      "4px 12px",
                borderRadius: "100px",
                border:       "1px solid rgba(255,255,255,0.10)",
              }}
            >
              {level}
            </span>
          )}
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  );
}
