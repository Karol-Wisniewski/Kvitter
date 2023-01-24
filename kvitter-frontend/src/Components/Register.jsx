import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as uuid from 'uuid';
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import logoWhite from "../Utils/logo-white.png"
import '../Style/Register/RegisterStyle.scss';

const Register = () => {

    const navigate = useNavigate();

    const [registeredSuccessfully, setRegisteredSuccessfully] = useState("");

    const goBack = () => {
        navigate(-1);
    };

    const currentDate = new Date().toJSON().slice(0, 10);

    return (
        <div className="Register">
            <div className="Register-div" onClick={goBack}>
            </div>
            <Formik
                initialValues={{
                    email: '',
                    username: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    profilePictureUrl: '',
                    dateOfBirth: ''
                }}
                validate={values => {
                    const errors = {};
                    if (!values.email) {
                        errors.email = 'E-mail field is required';
                    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) 
                    {
                        errors.email = 'Invalid email address';
                    } else if (!values.username) {
                        errors.username = 'Provide your username'
                    } else if (values.username.includes(" ")) {
                        errors.username = 'Username cannot contain spaces'
                    } else if (!values.password) {
                        errors.password = 'Provide a password!'
                    } else if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(values.password)) {
                        errors.password = 'Provide stronger password (At least 1 special character, 6-16 characters, at least 1 number)'
                    } else if (!values.firstName) {
                        errors.firstName = 'Provide your first name'
                    } else if (!values.lastName) {
                        errors.lastName = 'Provide your last name'
                    } else if (!values.dateOfBirth) {
                        errors.dateOfBirth = 'Provide your date of birth'
                    }
                    return errors;
                }}
                onSubmit={(values, {resetForm}) => {
                    const currentDate = new Date().toJSON().slice(0, 10);
                    axios.post(
                        'http://localhost:3000/auth/register', 
                        {
                            id: uuid.v4(),
                            contactEmail: values.email,
                            username: values.username,
                            password: values.password,
                            firstName: values.firstName,
                            lastName: values.lastName,
                            dateOfBirth: values.dateOfBirth,
                            profilePictureUrl: "",
                            dateOfJoin: currentDate
                        },
                        {
                            withCredentials: true
                        }
                    ).then(
                        (res) => { 
                            if (res.status === 200) {
                                resetForm();
                                setRegisteredSuccessfully("Your account was created successfully!");
                            }
                        }
                    ).catch(err => {
                        console.log(err);
                        setRegisteredSuccessfully(err.response.data.message)
                    });
                }}
                >
                <Form className="Form">
                    <button onClick={goBack} type="button" className="close-form">&#x2715;</button>
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
                    <label>Username</label>
                    <Field 
                        className="Field" 
                        type="text" 
                        name="username" 
                    />
                    <ErrorMessage 
                        className="Error-field" 
                        name="username" 
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
                    <label>First name</label>
                    <Field 
                        className="Field" 
                        type="text" 
                        name="firstName" 
                    />
                    <ErrorMessage 
                        className="Error-field" 
                        name="firstName" 
                        component="div" 
                    />
                    <label>Last name</label>
                    <Field 
                        className="Field" 
                        type="text" 
                        name="lastName" 
                    />
                    <ErrorMessage 
                        className="Error-field" 
                        name="lastName" 
                        component="div" 
                    />
                    <label>Date of birth</label>
                    <Field 
                        className="Field" 
                        type="date" 
                        max={currentDate} 
                        name="dateOfBirth"
                    />
                    <ErrorMessage 
                        className="Error-field" 
                        name="dateOfBirth" 
                        component="div" 
                    />
                    <button 
                        className="submit-form" 
                        type="submit" 
                    >
                        Submit
                    </button>
                    <p className={
                            registeredSuccessfully === "Your account was created successfully!" ? 
                            "logged-in-p-succes" 
                            :
                            "logged-in-p-failure"
                        }
                    >{registeredSuccessfully}</p>
                </Form>
            </Formik>
        </div>
    );
}

export default Register;