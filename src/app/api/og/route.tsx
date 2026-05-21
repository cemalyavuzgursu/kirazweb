import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Kiraz Tasarım").slice(0, 80);
  const description = (searchParams.get("description") ?? "").slice(0, 120);
  const image = searchParams.get("image");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "#fdf6f0",
          fontFamily: "Georgia, serif",
          overflow: "hidden",
        }}
      >
        {/* Left content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 56px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: "18px",
              color: "#be123c",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "32px",
            }}
          >
            Kiraz Tasarım
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 40 ? "38px" : "48px",
              color: "#1c1917",
              lineHeight: 1.2,
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            {title}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "20px",
                color: "#78716c",
                lineHeight: 1.5,
                marginBottom: "40px",
              }}
            >
              {description}
            </div>
          )}

          {/* URL */}
          <div
            style={{
              fontSize: "16px",
              color: "#a8a29e",
              letterSpacing: "1px",
            }}
          >
            kiraztasarim.com
          </div>
        </div>

        {/* Right image area */}
        {image && (
          <div
            style={{
              width: "420px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f5ede6",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Rose accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#f43f5e",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
