import AlienCharacterBudgetLife from "../../ArtAssets/Player/AlienCharacterBudgetLife.png";
import BowOverlay from "../../ArtAssets/Player/Customization/AlienCharacterBudgetLife_Customizations_Bow.png";
import CapOverlay from "../../ArtAssets/Player/Customization/AlienCharacterBudgetLife_Customizations_Cap.png";
import EaringOverlay from "../../ArtAssets/Player/Customization/AlienCharacterBudgetLife_Customizations_Earing.png";
import GlassesOverlay from "../../ArtAssets/Player/Customization/AlienCharacterBudgetLife_Customizations_Glasses.png";
import BowIcon from "../../ArtAssets/Player/Customization/Icons/AlienCharacterBudgetLife_Customizations_BowIcon.png";
import CapIcon from "../../ArtAssets/Player/Customization/Icons/AlienCharacterBudgetLife_Customizations_CapIcon.png";
import EaringIcon from "../../ArtAssets/Player/Customization/Icons/AlienCharacterBudgetLife_Customizations_EaringIcon.png";
import GlassesIcon from "../../ArtAssets/Player/Customization/Icons/AlienCharacterBudgetLife_Customizations_GlassesIcon.png";

export const PLAYER_BASE_SPRITE = AlienCharacterBudgetLife;

export const PLAYER_CUSTOMIZATION_SLOTS = [
  {
    id: "collar",
    label: "Collar",
    items: [
      {
        id: "collar-bow",
        label: "Bow Collar",
        iconSrc: BowIcon,
        overlaySrc: BowOverlay,
        price: 120,
        info: "A neat collar accessory for the alien.",
        layerOrder: 10,
      },
    ],
  },
  {
    id: "eyewear",
    label: "Eyewear",
    items: [
      {
        id: "eyewear-glasses",
        label: "Glasses",
        iconSrc: GlassesIcon,
        overlaySrc: GlassesOverlay,
        price: 180,
        info: "Clean eyewear for the city dashboard.",
        layerOrder: 20,
      },
    ],
  },
  {
    id: "hat",
    label: "Hat",
    items: [
      {
        id: "hat-cap",
        label: "Cap",
        iconSrc: CapIcon,
        overlaySrc: CapOverlay,
        price: 160,
        info: "A casual cap that sits above the alien's eyes.",
        layerOrder: 30,
      },
    ],
  },
  {
    id: "earring",
    label: "Earring",
    items: [
      {
        id: "earring-stud",
        label: "Earring",
        iconSrc: EaringIcon,
        overlaySrc: EaringOverlay,
        price: 140,
        info: "A small earring overlay for the alien.",
        layerOrder: 40,
      },
    ],
  },
];

export const DEFAULT_EQUIPPED_ITEMS = PLAYER_CUSTOMIZATION_SLOTS.reduce(
  (equipped, slot) => ({
    ...equipped,
    [slot.id]: null,
  }),
  {}
);

export const PLAYER_CUSTOMIZATION_ITEMS = PLAYER_CUSTOMIZATION_SLOTS.flatMap(
  (slot) => slot.items.map((item) => ({ ...item, slotId: slot.id }))
);

export const PLAYER_CUSTOMIZATION_SHOP_ITEMS = PLAYER_CUSTOMIZATION_ITEMS.map(
  (item) => ({
    id: item.id,
    name: item.label,
    info: item.info,
    price: item.price,
    iconSrc: item.iconSrc,
    slotId: item.slotId,
    type: "customization",
  })
);

export function getCustomizationSlot(slotId) {
  return PLAYER_CUSTOMIZATION_SLOTS.find((slot) => slot.id === slotId) || null;
}

export function getCustomizationItem(itemId) {
  return PLAYER_CUSTOMIZATION_ITEMS.find((item) => item.id === itemId) || null;
}