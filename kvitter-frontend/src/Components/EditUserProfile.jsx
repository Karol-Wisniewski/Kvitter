import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as uuid from 'uuid';
import { useContext, useState, useEffect } from 'react';
import { CurrentUserContext } from '../App';
import { Formik, Form, Field } from 'formik';
import logoWhite from "../Utils/logo-white.png"
import '../Style/EditUserProfile/EditUserProfile.scss';
import zalBlack from "../Utils/zal-black.png";
import deleteIcon from "../Utils/delete.png";

const EditUserProfile = () => {

    const [msg, setMsg] = useState("");

    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    const deletePicture = (id) => {
        axios.put(`http://localhost:3000/users/${id}/picture/delete`,
        {
            id
        },
        {
            withCredentials: true
        }).then(
            (res) => { 
                if (res.status === 200) {
                    setCurrentUser(Object.assign({}, currentUser, {profilePictureUrl: ""}))
                    setMsg(res.data.message);
                }
            }
        ).catch(err => {
            console.log(err);
            setMsg(err.response.data.message)
        });
    }

    useEffect(() => {
        var infoArea = document.getElementById( 'file-upload-edit' );
        var input = document.getElementById( 'file-field-edit' );
        const showFileName = (event) => {
            var input = event.srcElement;
            var fileName = input.files[0].name;
            infoArea.textContent = fileName;
        }
        input.addEventListener( 'change', showFileName );
    }, []);

    console.log("CURRENT USER:")
    console.log(currentUser);

    return (
        <div className="EditUserProfile">
            <div className="EditUserProfile-div" onClick={goBack}>
            </div>
            <Formik
                initialValues={{
                    email: '',
                    username: '',
                    firstName: '',
                    lastName: '',
                    picture: ''
                }}
                validate={values => {
                    // const errors = {};
                }}
                onSubmit={async (values, { resetForm }) => {

                    const picture = document.querySelector('input[type="file"].file-field-edit').files[0];
                    const data = new FormData();
                    const postName = values.picture ? `${uuid.v4()}@${picture.name}` : "";
                    data.append("name", postName);
                    data.append("file", picture);

                    const updateCurrentUser = ({email, username, firstName, lastName, picture}) => {
                        setCurrentUser({
                            id: currentUser.id,
                            dateOfBirth: currentUser.dateOfBirth,
                            contactEmail: (email ? email : currentUser.contactEmail),
                            username: (username ? username : currentUser.username),
                            firstName: (firstName ? firstName : currentUser.firstName),
                            following: currentUser.following,
                            followedBy: currentUser.followedBy,
                            lastName: (lastName ? lastName : currentUser.lastName),
                            profilePictureUrl: (picture ? postName : currentUser.profilePictureUrl)
                        })
                        console.log("NEW CURRENT USER:")
                        console.log(currentUser);
                    }

                    if (picture) await axios.post("http://localhost:3000/upload/",
                    data,
                    {
                        withCredentials: true
                    });

                    await axios.put(
                        `http://localhost:3000/users/${currentUser.id}`, 
                        {
                            id: currentUser.id,
                            contactEmail: (values.email ? values.email : currentUser.contactEmail),
                            username: (values.username ? values.username : currentUser.username),
                            firstName: (values.firstName ? values.firstName : currentUser.firstName),
                            lastName: (values.lastName ? values.lastName : currentUser.lastName),
                            profilePictureUrl: (values.picture ? postName : currentUser.profilePictureUrl)
                        },
                        {
                            withCredentials: true
                        }
                    ).then(
                        (res) => { 
                            if (res.status === 200) {
                                updateCurrentUser(values);
                                setMsg(res.data.message);
                            }
                        }
                    ).catch(err => {
                        console.log(err);
                        setMsg(err.response.data.message)
                    });

                    document.getElementById("file-field-edit").value = ""
                    resetForm();
                    document.getElementById('file-upload-edit').textContent = "";
                }}
                >
                <Form className="Form">
                    <button onClick={goBack} type="button" className="close-form">&#x2715;</button>
                    <img alt="logo" className="register-logo" src={logoWhite}></img>
                    <label>Change E-mail</label>
                    <Field 
                        className="Field" 
                        type="email" 
                        name="email"
                        placeholder={currentUser.contactEmail}
                    />
                    <label>Change Username</label>
                    <Field 
                        className="Field" 
                        type="text" 
                        name="username"
                        placeholder={currentUser.username}
                    />
                    <label>Change First name</label>
                    <Field 
                        className="Field" 
                        type="text" 
                        name="firstName"
                        placeholder={currentUser.firstName}
                    />
                    <label>Change Last name</label>
                    <Field 
                        className="Field" 
                        type="text" 
                        name="lastName"
                        placeholder={currentUser.lastName}
                    />
                    <div className="file-input-div-edit">
                        <label className="only-label">Change Profile picture</label>
                        <Field 
                            className="file-field-edit"
                            type="file" 
                            name="picture"
                            accept=".png, .jpg, .jpeg"
                            id="file-field-edit"
                        />
                        <div>
                            <img src={zalBlack} alt="" />
                            <label htmlFor="file-field-edit" className="file-label">Choose file</label>
                            <div id="file-upload-edit"></div>
                        </div>
                    </div>
                    <label className="delete-picture-label">Delete Profile picture</label>
                    <div className="delete-picture-div">
                        <img alt="" src={deleteIcon} />
                        <button
                            className="delete-picture-button"
                            type="button"
                            onClick={() => deletePicture(currentUser.id)}
                        >
                            Delete
                        </button>
                    </div>
                    <button 
                        className="submit-form" 
                        type="submit" 
                    >
                        Save
                    </button>
                    <p className="info-p">{msg}</p>
                </Form>
            </Formik>
        </div>
    );
}

export default EditUserProfile;