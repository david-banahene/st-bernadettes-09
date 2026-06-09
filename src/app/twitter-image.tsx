import { ImageResponse } from "next/og";

// Twitter/X card image - same design as the OG image with badge logo
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

        {/* Logo badge circle */}
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "80px",
            backgroundColor: "#1B4332",
            border: "4px solid #C8962E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "140px",
              height: "140px",
              borderRadius: "70px",
              border: "1.5px solid rgba(200, 150, 46, 0.35)",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: "#C8962E",
              fontFamily: "serif",
              lineHeight: 1,
              letterSpacing: "4px",
              marginTop: "-8px",
            }}
          >
            SB
          </span>
          <div
            style={{
              display: "flex",
              gap: "2px",
              marginTop: "4px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "22px",
                backgroundColor: "#FAF6F0",
                borderRadius: "2px 0 0 2px",
                transform: "skewY(-2deg)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: "28px",
                height: "22px",
                backgroundColor: "#FAF6F0",
                borderRadius: "0 2px 2px 0",
                transform: "skewY(2deg)",
                display: "flex",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#C8962E",
              fontFamily: "serif",
              letterSpacing: "2px",
            }}
          >
            2009
          </span>
        </div>

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
