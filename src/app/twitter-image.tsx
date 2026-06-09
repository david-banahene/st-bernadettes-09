import { ImageResponse } from "next/og";

// Twitter/X card image - same design as the Open Graph image
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
          backgroundColor: "#FAF6F0",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "#1B4332",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "#1B4332",
            display: "flex",
          }}
        />
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "60px",
            backgroundColor: "#1B4332",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#C8962E",
              fontFamily: "serif",
            }}
          >
            SB
          </span>
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#1B4332",
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
            marginTop: "16px",
            marginBottom: "16px",
            borderRadius: "2px",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: "24px",
            color: "#1B4332",
            opacity: 0.7,
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
            marginTop: "12px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Unity &bull; Support &bull; Progress
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "#1B4332",
            opacity: 0.5,
            marginTop: "24px",
            display: "flex",
          }}
        >
          Tafo Nhyiaeso, Kumasi, Ghana
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
