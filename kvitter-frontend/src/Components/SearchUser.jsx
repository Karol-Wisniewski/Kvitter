import { Formik, Form, Field } from 'formik';
import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import "../Style/SearchUser/SearchUserStyle.scss";
import avatar from "../Utils/avatar.png";
import { CurrentUserContext } from '../App';
import chat from "../Utils/chat.jpg";
import Chat from "./Chat";

const SearchUser = () => {

    const [searchResult, setSearchResult] = useState([]);

    const [resultsFor, setResultsFor] = useState("");

    const [noResults, setNoResults] = useState("");

    const [openChatUser, setOpenChatUser] = useState({});
    
    const {currentUser} = useContext(CurrentUserContext);

    const navigate = useNavigate();
    
    const noResultHelper = () => {
        setSearchResult([])
        setResultsFor("");
        setNoResults("No results...")
    };

    const resultHelper = (values, res) => {
        setSearchResult(res.data)
        setResultsFor(values.search);
        setNoResults("")
    };

    return (
        <div className="SearchUser">
            <Formik
                initialValues={{
                    search: ''
                }}
                validate={values => {}}
                onSubmit={(values) => {
                    values.search.split(" ").length > 1 ?
                    axios.post(
                        'http://localhost:3000/users/search/nameAndSurname',
                        {
                            search: values.search,
                            search_opt_name: values.search.includes(" ") ? values.search.split(" ")[0] : values.search,
                            search_opt_surname: values.search.includes(" ") ? values.search.split(" ")[1] : values.search,
                        },
                        {
                            withCredentials: true
                        }
                    ).then(
                        (res) => { 
                            if (res.status === 200) {
                                console.log("NAME AND SURNAME");
                                console.log(res);
                                res.data[0] === null ? noResultHelper() : resultHelper(values, res);
                            }
                        }
                    ).catch(err => {
                        console.log(err);
                    })
                    :
                    axios.post(
                        'http://localhost:3000/users/search/nameOrUsernameOrSurname',
                        {
                            search: values.search,
                            search_opt_name: values.search.includes(" ") ? values.search.split(" ")[0] : values.search,
                            search_opt_surname: values.search.includes(" ") ? values.search.split(" ")[1] : values.search,
                        },
                        {
                            withCredentials: true
                        }
                    ).then(
                        (res) => { 
                            if (res.status === 200) {
                                console.log("NAME OR USERNAME OR SURNAME");
                                console.log(res);
                                res.data[0] === null ? noResultHelper() : resultHelper(values, res);
                            }
                        }
                    ).catch(err => {
                        console.log(err);
                    })
                }}
            >
                <Form className="Form">
                    <Field
                        className="search-field" 
                        name="search"
                        placeholder="Search user..."
                        required
                    />
                    <button 
                        className="submit-form" 
                        type="submit" 
                    >
                        Search
                    </button>
                </Form>
            </Formik>
            <div className="results-for-div">
                {resultsFor ? `Results for: ${resultsFor}` : null}
            </div>
            <div className="search-results-div">
                {!!searchResult.length ?
                    Array.from(searchResult).map(user => {
                        return (
                            <div className="searched-user-div" key={user.id}>
                                {
                                user.profilePictureUrl ?
                                <img 
                                    alt="avatar"
                                    src={`http://localhost:3000/images/${user.profilePictureUrl}`}
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
                                <button
                                    className="profile-link"
                                    onClick={() => {
                                        navigate(`/profile/${user.id}`);
                                    }}
                                >
                                    {user.firstName}&nbsp;{user.lastName}
                                </button>
                                <p className="username">@{user.username}</p>
                                <button className="chat-btn" onClick={() => {
                                        setOpenChatUser(user)
                                        console.log("OPENING CHAT WITH:")
                                        console.log(currentUser.firstName)
                                        console.log("AND:")
                                        console.log(user.firstName)
                                    }
                                }>
                                    <p>Chat</p>
                                    <img src={chat} alt="" className="chat-icon"/>
                                </button>
                            </div>
                        );
                    })
                    :
                    <div className="no-result-div">
                        {noResults}
                    </div>
                }
            </div>
            {
                !!Object.keys(openChatUser).length 
                && 
                <Chat 
                    sender={currentUser} 
                    receiver={openChatUser} 
                    setOpenChatUser={setOpenChatUser}
                />
            }
        </div>
    );
};

export default SearchUser;