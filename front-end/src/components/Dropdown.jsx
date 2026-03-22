import React from "react";
import "./Dropdown.css";

function DropdownMenu({ isOpen, items = [] }) {
  return (
    <div className={`menu-layer ${isOpen ? "open" : "closed"}`}>
      <div className="dropdown-ellipse"></div>

      <div className="profile-dropdown">
        {items.map((item, index) => (
          <button
            key={item.label}
            className="dropdown-item"
            onClick={item.onClick}
            style={{ transitionDelay: `${0.02 + index * 0.03}s` }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DropdownMenu;