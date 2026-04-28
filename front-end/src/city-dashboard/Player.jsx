import React from "react";
import { PlayerAvatar } from "../components/PlayerAvatar";
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
      <PlayerAvatar width="100%" height="100%" alt="Player character" />
    </div>
  );
}