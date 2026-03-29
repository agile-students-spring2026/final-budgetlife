import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dropdown.css";

function DropdownMenu({ isOpen }) {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Friends", onClick: () => navigate("/friends") },
    { label: "Shop", onClick: () => navigate("/shop") },
    { label: "Look", onClick: () => navigate("/player_customization") },
    { label: "Account", onClick: () => navigate("/account") },
    { label: "Logout", onClick: () => navigate("/") }
  ];

  return (
    <div className={`menu-layer ${isOpen ? "open" : "closed"}`}>
      <div className="dropdown-ellipse"></div>

      <div className="profile-dropdown">
        {menuItems.map((item, index) => (
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