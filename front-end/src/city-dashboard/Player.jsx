import React from "react";
import "./Player.css";

export function PlayerBox({ x, y, size = 60 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 2,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        transform: "translate(-50%, -100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          border: "2px solid #e0e0e0",
        }}
      />
    </div>
  );
}