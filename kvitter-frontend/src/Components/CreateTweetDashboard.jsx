import * as uuid from 'uuid';
import { Formik, Form, Field, useField } from 'formik';
import zal from "../Utils/zal.png";
import axios from 'axios';
import { CurrentUserContext } from '../App';
import { useContext } from 'react';
import avatar from "../Utils/avatar.png";

const CreateTweetDashboard = ({getAllTweets, setAllTweets}) => {

    const { currentUser } = useContext(CurrentUserContext);

    const MyTextArea = ({label, ...props}) => {
        const [field, meta] = useField(props);
        return (
            <>
                <textarea {...field} {...props} />
                {meta.touched && meta.error ? (
                    <div className="error">{meta.error}</div>
                ) : null}
            </>
        );
    };

    var input = document.getElementById( 'file-field' );
    var infoArea = document.getElementById( 'file-upload-filename' );

    input?.addEventListener( 'change', showFileName );

    function showFileName( event ) {
        var input = event.srcElement;
        var fileName = input.files[0].name;
        infoArea.textContent = fileName;
    }

    return (
        <Formik
            initialValues={{
                content: '',
                pictureUrl: '',
                audience: ''
            }}
            validate={values => {
                // const errors = {};
            }}
            onSubmit={async (values, { resetForm }) => {

            const today = new Date();
            const hours = today.getHours();
            const minutes = String(today.getMinutes()).padStart(2, "0");
            const seconds = String(today.getSeconds()).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const todayDate = yyyy + '-' + mm + '-' + dd + '/' + hours + ':' + minutes + ':' + seconds;

            // read from the file input field

            const picture = document.querySelector('input[type="file"].file-field').files[0];
            const data = new FormData();
            const postName = values.pictureUrl ? `${uuid.v4()}@${picture.name}` : "";
            data.append("name", postName);
            data.append("file", picture);

            try {
                if (values.pictureUrl) await axios.post("http://localhost:3000/upload/", 
                data,
                {
                    withCredentials: true
                });

                await axios.post(
                    'http://localhost:3000/tweets/add', 
                    {
                        id: uuid.v4(),
                        userId: currentUser.id,
                        date: todayDate,
                        content: values.content,
                        pictureUrl: values.pictureUrl ? postName : "",
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        username: currentUser.username,
                        authorProfilePicture: currentUser.profilePictureUrl,
                        audience: values.audience ? values.audience : "public"
                    },
                    {
                        withCredentials: true
                    }
                ).then(
                    (res) => { 
                        console.log(res)
                        if (res.status === 200) {
                            getAllTweets()
                            .then(data => {
                                setAllTweets(data)
                            })
                        }
                    }
                ).catch(err => {
                    console.log(err);
                });

                console.log("Picture:");
                console.log(picture);

                document.getElementById("file-field").value = ""
                resetForm();
                document.getElementById('file-upload-filename').textContent = "";

                } catch (e) {
                    console.log(e);
                } 
            }}
            >
            <Form className="Form" id="form">
                <Field 
                    as="select"
                    name="audience"
                    className="audience-select"
                >
                    <option value="public">Public</option>
                    <option value="followers">Followers</option>
                    <option value="private">Private</option>
                </Field>
                <div className='avatar-text-area'>
                    {
                        currentUser.profilePictureUrl ?
                        <img 
                            alt="avatar"
                            src={`http://localhost:3000/images/${currentUser.profilePictureUrl}`}
                            crossOrigin="anonymous"
                            className="avatar"
                        >
                        </img>
                        :
                        <img
                            alt="avatar"
                            src={avatar}
                            className="avatar"
                        >
                        </img>
                    }
                    <MyTextArea
                        className="content-field"
                        name="content"
                        placeholder={`What's on your mind ${currentUser.firstName}?`}
                    />
                </div>
                <div className="file-input-div">
                    <img src={zal} alt=""/>
                    <Field 
                        className="file-field" 
                        type="file" 
                        name="pictureUrl"
                        accept=".png, .jpg, .jpeg"
                        id="file-field"
                    />
                    <label htmlFor="file-field">Choose file</label>
                    <div id="file-upload-filename"></div>
                </div>
                <button 
                    className="submit-form" 
                    type="submit" 
                >
                    Tweet
                </button>
            </Form>
        </Formik>
    );
}

export default CreateTweetDashboard;