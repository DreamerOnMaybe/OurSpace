import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Header from "../components/Header.jsx";
import backBtn from "../assets/arrow-left-long.svg";
import { useNavigate } from "react-router-dom";

function Notifications() {
    const [notifications, setNotifications] = useState([])
    const navigate = useNavigate()

    return (
        <div className="app-container">
            <Header
                title="Уведомления"
                leftIcon={backBtn}
                onLeftClick={() => navigate(-1)}
            />

            <Navbar
                activeTab="notifications"
            />
        </div>
    )
}

export default Notifications;