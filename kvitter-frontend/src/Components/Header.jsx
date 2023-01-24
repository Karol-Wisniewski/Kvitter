import '../Style/App/AppStyle.scss';
import logo from "../Utils/logo.png"
import { useNavigate } from "react-router-dom";
import { useContext } from "react";

import { CurrentUserContext } from "../App";
import axios from "axios";

const Header = () => {

	const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    const navigate = useNavigate();

    const handleLogoutButtonClick = () => {
        axios.post("http://localhost:3000/auth/logout", {}, { withCredentials: true })
        .then((response) => {
            setCurrentUser(null);
            navigate("/");
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <header>
            <div>
                <img alt="logo" src={logo} className="logo"></img>
                <p>Kvitter</p>
                {currentUser && (
                    <button onClick={() => navigate("/")}>Home</button>
                )}
                {currentUser === undefined && (
                    <div></div>
                )}
                {currentUser && (
                    <button onClick={() => navigate(`profile/${currentUser.id}`)}>Profile</button>
                )}
                {currentUser && (
                    <button onClick={() => navigate("search")}>Search</button>
                )}
                {currentUser && (
                    <button onClick={() => navigate(`profile/${currentUser.id}/settings`)}>Settings</button>
                )}
                {currentUser && (
                    <button onClick={handleLogoutButtonClick}>Log out</button>
                )}
            </div>
        </header>
    );
}

export default Header;
