import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/user_icon_temp.png";
import user1 from "../data/mock_user.js";
import "./Account.css";

function Account() {
    
    const navigate = useNavigate();

    const [name, setName] = useState(user1.name);
    const [email, setEmail] = useState(user1.email);

    function changeName() {
        const newName = prompt("Enter new name");
        if (newName) {
            setName(newName);
        }
    }

    function changeEmail() {
        const newE = prompt("Enter new Email");
        if (newE) {
            setEmail(newE);
        }
    }

    return (
        <div className="account-page">
            <div className="account-screen">
            <div className="account-header">
            <h1 className="account-title">Edit Profile</h1>
            <button className="close-button" onClick={() => navigate("/home")}>
                ×
            </button>
            </div>

            <div className="profile-row">
                <button
                    className="user-icon-button"
                    >
                    <img src={userIcon} alt="User Icon" className="user-icon" />
                </button>

                <div className="info-column">
                    <button
                        className="information"
                        onClick={() => changeName()}>
                            {name}
                    </button>
                    <button
                        className="information"
                        onClick={() => changeEmail()}>
                            {email}
                    </button>
                </div>
            </div>

            <button
                    className="big">
                        Save Changes
            </button>

            <button
                className="big"
                onClick={() => navigate("/login")}>
                    Log Out
            </button>

            <button
                className="small"
                onClick={() => navigate("/login")}>
                    Delete Account
            </button>
            </div>
        </div>
    );
}


export default Account;