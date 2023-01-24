import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import logoWhite from "../Utils/logo-white.png"
import { useState } from 'react';
import '../Style/Login/LoginStyle.scss';
import { CurrentUserContext } from "../App";
import { useContext } from 'react';

const Login = () => {

    const { setCurrentUser } = useContext(CurrentUserContext);

    const navigate = useNavigate();

    const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="Login">
            <div className="Login-div" onClick={goBack}>
            </div>
            <Formik
                initialValues={{
                    email: '',
                    password: ''
                }}
                validate={values => {
                    const errors = {};
                    if (!values.email) {
                        errors.email = 'E-mail field is required';
                    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) 
                    {
                        errors.email = 'Invalid email address';
                    } else if (!values.password) {
                        errors.password = 'Provide a password!'
                    } 
                    return errors;
                }}
                onSubmit={(values) => {
                    axios.post(
                        'http://localhost:3000/auth/login', 
                        {
                            email: values.email,
                            password: values.password
                        },
                        {
                            withCredentials: true
                        }
                    ).then(
                        (res) => { 
                            if (res.status === 200) {
                                setCurrentUser(res.data.userData);
                                setLoggedInSuccessfully("Successfully logged in!");
                                navigate("/");
                            }
                        }
                    ).catch(err => {
                        console.log(err);
                        setLoggedInSuccessfully("Invalid e-mail or password!")
                    });
                }}
            >
                <Form className="Form">
                    <button onClick={goBack} type="button" className="close-form">&#10005;</button>
                    <img alt="logo" className="register-logo" src={logoWhite}></img>
                    <label>E-mail</label>
                    <Field 
                        className="Field" 
                        type="email" 
                        name="email" 
                    />
                    <ErrorMessage 
                        className="Error-field" 
                        name="email" 
                        component="div" 
                    />
                    <label>Password</label>
                    <Field 
                        className="Field" 
                        type="password" 
                        name="password" 
                    />
                    <ErrorMessage 
                        className="Error-field" 
                        name="password" 
                        component="div" 
                    />
                    <button 
                        className="submit-form" 
                        type="submit" 
                    >
                        Sign in
                    </button>
                    <p className="logged-in-p">{loggedInSuccessfully}</p>
                </Form>
            </Formik>
        </div>
    );
}

export default Login;