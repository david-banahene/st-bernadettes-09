import { ImageResponse } from "next/og";

// Open Graph image matching the app's home screen icon style:
// Dark green background, gold SB logo, cream text
export const runtime = "edge";
export const alt = "St. Bernadette's '09 Association";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1B4332",
          position: "relative",
        }}
      >
        {/* Top gold accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#C8962E",
            display: "flex",
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "70px",
            backgroundColor: "#0D2818",
            border: "3px solid rgba(200, 150, 46, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#C8962E",
              fontFamily: "serif",
              lineHeight: 1,
            }}
          >
            SB
          </span>
          <span
            style={{
              fontSize: "22px",
              color: "#FAF6F0",
              fontFamily: "sans-serif",
              marginTop: "2px",
            }}
          >
            &apos;09
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            color: "#FAF6F0",
            textAlign: "center",
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          St. Bernadette&apos;s &apos;09 Association
        </div>

        {/* Gold underline */}
        <div
          style={{
            width: "80px",
            height: "4px",
            backgroundColor: "#C8962E",
            marginTop: "20px",
            marginBottom: "20px",
            borderRadius: "2px",
            display: "flex",
          }}
        />

        {/* Slogan */}
        <div
          style={{
            fontSize: "26px",
            color: "#FAF6F0",
            opacity: 0.8,
            textAlign: "center",
            display: "flex",
          }}
        >
          One Year Group, One Family
        </div>

        {/* Motto */}
        <div
          style={{
            fontSize: "18px",
            color: "#C8962E",
            marginTop: "16px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Unity &bull; Support &bull; Progress
        </div>

        {/* Bottom gold accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#C8962E",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
