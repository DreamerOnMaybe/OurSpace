import React from "react";
import { auth } from "../firebase"; // Импорт конфига Firebase
import { signOut } from "firebase/auth"; // Импорт функции выхода
import "./Profile.css"
import Header from "../components/Header.jsx"
import Navbar from "../components/Navbar.jsx"

function Profile() {
  const handleSignOut = async () => {
    await signOut(auth);
  };


  return (
    <div className="app-container">
      <Header
        title={auth.currentUser?.displayName || 'Профиль'}
        onRightClick={handleSignOut}
      />

      

      <Navbar activeTab='profile' isChatCenter={true} />
    </div>
  );
}

export default Profile;
