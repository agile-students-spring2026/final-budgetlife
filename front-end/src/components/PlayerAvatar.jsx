import React, { useContext } from "react";
import { PlayerContext } from "../context/Player_Context";
import {
  DEFAULT_EQUIPPED_ITEMS,
  PLAYER_BASE_SPRITE,
  PLAYER_CUSTOMIZATION_ITEMS,
} from "../data/playerCustomization";

export function PlayerAvatar({
  width = 160,
  height = 320,
  equippedItems,
  alt = "Player avatar",
  style,
  imageScale = 1,
  imageOffsetX = 0,
  imageOffsetY = 0,
}) {
  const playerContext = useContext(PlayerContext);
  const resolvedEquipment = equippedItems || playerContext?.equippedItems || DEFAULT_EQUIPPED_ITEMS;

  const overlayLayers = PLAYER_CUSTOMIZATION_ITEMS.filter(
    (item) => resolvedEquipment[item.slotId] === item.id
  ).sort((left, right) => left.layerOrder - right.layerOrder);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        ...style,
      }}
    >
      <img
        src={PLAYER_BASE_SPRITE}
        alt={alt}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `translate(${imageOffsetX}px, ${imageOffsetY}px) scale(${imageScale})`,
          transformOrigin: "center center",
          userSelect: "none",
          WebkitUserDrag: "none",
        }}
      />

      {overlayLayers.map((item) => (
        <img
          key={item.id}
          src={item.overlaySrc}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `translate(${imageOffsetX}px, ${imageOffsetY}px) scale(${imageScale})`,
            transformOrigin: "center center",
            userSelect: "none",
            WebkitUserDrag: "none",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}