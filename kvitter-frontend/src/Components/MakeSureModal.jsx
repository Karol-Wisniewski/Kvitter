import "../Style/MakeSureModal/MakeSureModal.scss"
import { useNavigate } from "react-router";
import { CurrentUserContext } from "../App";
import { useContext } from "react";
import axios from "axios";
import logoWhite from "../Utils/logo-white.png"

const MakeSureModal = () => {

    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    const deleteUser = async () => {
        return axios.delete(`http://localhost:3000/users/${currentUser.id}`)
        .then(res => {
            setCurrentUser(null);
            navigate("/");
        })
        .catch(err => console.log(err))
    };

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="MakeSureModal">
            <div className="MakeSureModal-div" onClick={goBack}></div>
            <div className="MakeSureModal-content">
                <button onClick={goBack} type="button" className="close-modal">&#10005;</button>
                <img alt="logo" className="logo" src={logoWhite}></img>
                <p>Are you sure you want to delete your account?</p>
                <p className="warning-p">This action is permanent!</p>
                <div className="button-div">
                    <button onClick={() => deleteUser(currentUser.id)}>Yes</button>
                    <button onClick={goBack}>No</button>
                </div>
            </div>
        </div>
    );
};

export default MakeSureModal;