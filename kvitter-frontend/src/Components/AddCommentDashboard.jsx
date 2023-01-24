import * as uuid from 'uuid';
import { useContext } from 'react';
import { CurrentUserContext } from '../App';
import { Formik, Form, useField } from 'formik';
import "../Style/AddComment/AddComment.scss"
import axios from 'axios';
import avatar from "../Utils/avatar.png";

const AddCommentDashboard = ({getAllComments, setAllComments, authorId, tweetId}) => {

    const { currentUser} = useContext(CurrentUserContext);

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

    return (
        <Formik
            initialValues={{
                comment: ''
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

                axios.post(
                    `http://localhost:3000/tweets/${currentUser.id}/comment/${tweetId}`, 
                    {
                        commentId: uuid.v4(),
                        tweetId: tweetId,
                        comment: values.comment,
                        date: todayDate,
                        idOfTweetAuthor: authorId,
                        commenterId: currentUser.id,
                        commenterFirstName: currentUser.firstName,
                        commenterLastName: currentUser.lastName,
                        commenterProfilePicture: currentUser.profilePictureUrl
                    },
                    {
                        withCredentials: true
                    }
                ).then(
                    (res) => { 
                        console.log(res)
                        if (res.status === 200) {
                            getAllComments()
                            .then(data => {
                                setAllComments(data)
                            })
                        }
                    }
                ).catch(err => {
                    console.log(err);
                });

                resetForm();
            }}
            >
            <Form className="Form-comment">
                <div className='avatar-content'>
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
                        className="text-area"
                        name="comment"
                        placeholder={`Write a comment...`}
                    />
                </div>
                <button type="submit">
                    &#8250;
                </button>
            </Form>
        </Formik>
    );

};

export default AddCommentDashboard;