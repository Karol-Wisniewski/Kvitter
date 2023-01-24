import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import CreateTweetForm from "./CreateTweetForm";
import UserTweets from "./UserTweets";
import '../Style/UserProfile/UserProfileStyle.scss';
import loading from "../Utils/loading.jpg";
import avatar from "../Utils/avatar.png";
import calendar from "../Utils/calendar.PNG"
import UserLikes from "./UserLikes";
import moment from "moment";
import { CurrentUserContext } from "../App";
import { useContext, useMemo } from 'react';
import UserFollowing from "./UserFollowing";
import UserFollowers from "./UserFollowers";
import { useSelector, useDispatch } from 'react-redux';
import { setUserDataReducer, setTweetsReducer, setCommentsReducer, setTweetsCountReducer } from "../Reducers/userSlice";

const UserProfile = () => {

    //-----------------------------------HOOKS, CONSTANCES, REDUX USAGE-----------------------------------

    const [followedUsers, setFollowedUsers] = useState([]);

    const [followers, setFollowers] = useState([]);

    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    const location = useLocation();

    const setUserData = (data) => dispatch(setUserDataReducer(data));

    const userData = useSelector((state) => state.user.user);

    const setTweets = (data) => dispatch(setTweetsReducer(data));

    const tweets = useSelector((state) => state.user.tweets);

    const setComments = (data) => dispatch(setCommentsReducer(data));

    const comments = useSelector((state) => state.user.comments);

    const isViewingOwnProfile = useMemo(() => {
        return currentUser?.id && userData?.id && currentUser.id === userData.id;
    }, [currentUser, userData]);

    const [component, setComponent] = useState("tweets");

    const setTweetsCount = (data) => dispatch(setTweetsCountReducer(data));

    const tweetsCount = useSelector((store) => store.user.tweetsCount);

    const params = useParams();

    const id = params.id

    const dispatch = useDispatch();

    const navigate = useNavigate();



    //-----------------------------------FETCH FUNCTIONS-----------------------------------



    const getUser = async (id) => {
        return axios.get(`http://localhost:3000/users/${id}`)
        .then(res => {
            console.log("USER DATA FROM URL:")
            console.log(res)
            return res.data;
        })
        .catch(err => console.log(err))
    };

    const getFollowedUsers = async (id) => {
        return axios.get(`http://localhost:3000/users/${id}/following`, {
            withCredentials: true
        })
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
    };

    const getFollowers = async (id) => {
        return axios.get(`http://localhost:3000/users/${id}/followers`, {
            withCredentials: true
        })
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
    };

    const followUser = async (followerId, followingId) => {
        return axios.post(`http://localhost:3000/users/${followerId}/follow/${followingId}`, 
        {
            followerId: followerId,
            followingId: followingId
        },
        {
            withCredentials: true
        })
        .then((res) => { 
            setCurrentUser(Object.assign({}, currentUser, {following: [...currentUser.following, id]}))
        })
        .catch(err => console.log(err))
    };

    const unfollowUser = async (followerId, followingId) => {
        return axios.post(`http://localhost:3000/users/${followerId}/unfollow/${followingId}`, 
        {
            followerId: followerId,
            followingId: followingId
        },
        {
            withCredentials: true
        })
        .then((res) => {
            setCurrentUser(Object.assign({}, currentUser, {following: currentUser.following.filter(x => x !== id)}))
        })
        .catch(err => console.log(err))
    };

    const getTweets = async (id) => {
        return axios.get(`http://localhost:3000/tweets/${id}`, {
            withCredentials: true
        })
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
    };

    const deleteTweet = (userId, tweetId) => {
        axios.delete(`http://localhost:3000/tweets/${tweetId}`, {
            withCredentials: true
        })
        .then(
            (res) => { 
                getTweets(userId)
                .then(data => {
                    setTweets(data)
                    setTweetsCount(data.length)
                })
            }
        )
    };

    const countTweets = async (id) => {
        return axios.get(`http://localhost:3000/tweets/${id}/count`)
        .then(res => {
            return res.data.records["0"]["_fields"]["0"]
        })
        .catch(err => console.log(err))
    };

    const getCommentsForUser = async (id) => {
        return axios.get(`http://localhost:3000/tweets/${id}/comments`,
        {
            withCredentials: true
        })
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
    };


    //-----------------------------------USE EFFECT-----------------------------------


    useEffect(() => {
        setComponent("tweets");
        window.scrollTo(0,0);
        if (id) {
            getUser(id).then(data => setUserData(data));
            getTweets(id).then(data => setTweets(data));
            countTweets(id).then(data => setTweetsCount(data));
            getCommentsForUser(id).then(data => setComments(data));
            getFollowedUsers(id).then(data => setFollowedUsers(data));
            getFollowers(id).then(data => setFollowers(data));
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);


    //-----------------------------------PRODUCT-----------------------------------


    return (document.readyState === "complete" && !!userData ?
        <div className="UserProfile">
            <div className="username-div">
                <div className="arrow" onClick={() => navigate(-1)}>&#8592;</div>
                <div className="tweet-info">
                    <p className="user-names-top">{userData.firstName}&nbsp;{userData.lastName}</p>
                    <p className="tweets-counter">{tweetsCount === 1 ? "1 Tweet" : `${tweetsCount } Tweets`}</p>
                </div>
            </div>
            <div className="profile-pictures-div">
                {
                    userData.profilePictureUrl ?
                    <img 
                        alt="avatar"
                        crossOrigin="anonymous"
                        src={`http://localhost:3000/images/${userData.profilePictureUrl}`}
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
            </div>
            <div className="profile-info-div">
                <div className="user-info-div">
                    <p className="user-names">{userData.firstName}&nbsp;{userData.lastName}</p>
                    <p className="at-username">@{userData.username}</p>
                    <div className="following-followers-div">
                        <div>
                            <p>{userData.following ? userData.following.length : 0}</p>
                            <p>Following</p>
                        </div>
                        <div>
                            <p>{userData.followedBy ? userData.followedBy.length : 0}</p>
                            <p>Followers</p>
                        </div>
                    </div>
                    <div className="joined-div">
                        <img src={calendar} alt="" />
                        <p>Joined</p>
                        <p>{moment(userData.dateOfJoin).format('MMMM Do YYYY')}</p>
                    </div>
                </div>
                <div className="button-div">
                    {isViewingOwnProfile ? 
                    <Link 
                        className="link"
                        to="edit"
                        state={{ background: location }}
                    >
                        <button>Edit profile</button>
                    </Link>
                    :
                    currentUser.following.includes(id) ?
                    <Link 
                        className="link-follow"
                    >
                        <button
                        onClick={() => {
                            unfollowUser(currentUser.id, id)
                            .then(() => getFollowers(id)
                            .then(data => setFollowers(data)))
                            .then(() => getUser(id)
                            .then(data => setUserData(data)))
                        }}
                        >
                            Unfollow
                        </button>
                    </Link>
                    :
                    <Link 
                        className="link-follow"
                    >
                        <button
                        onClick={() => {
                            followUser(currentUser.id, id)
                            .then(() => getFollowers(id)
                            .then(data => setFollowers(data)))
                            .then(() => getUser(id)
                            .then(data => setUserData(data)))
                        }}
                        >
                            +&nbsp;&nbsp;Follow
                        </button>
                    </Link>
                    }
                </div>
            </div>
            <div className="user-navbar">
                <Link id="tweets-link" className={component === "tweets" ? "link bc" : "link"} onClick={() => setComponent("tweets")}>Tweets</Link>
                <Link id="likes-link" className={component === "likes" ? "link bc" : "link"} onClick={() => setComponent("likes")}>Likes</Link>
                <Link id="following-link" className={component === "following" ? "link bc" : "link"} onClick={() => setComponent("following")}>Following</Link>
                <Link id="followers-link" className={component === "followers" ? "link bc" : "link"} onClick={() => setComponent("followers")}>Followers</Link>
            </div>
            {isViewingOwnProfile && component === "tweets" &&
                <CreateTweetForm
                    userData={userData}
                    setTweets={setTweets}
                    setTweetsCount={setTweetsCount}
                    getTweets={getTweets}
                />
            }
            {component === "tweets" ?
                <UserTweets 
                    tweets={tweets}
                    userData={userData}
                    deleteTweet={deleteTweet}
                    isViewingOwnProfile={isViewingOwnProfile}
                    getTweets={getTweets}
                    setTweets={setTweets}
                    comments={comments}
                    setComments={setComments}
                    getCommentsForUser={getCommentsForUser}
                />
                :
                component === "likes" ?
                <UserLikes getTweets={getTweets} setTweets={setTweets}/>
                :
                component === "following" ?
                <UserFollowing setComponent={setComponent} followedUsers={followedUsers} />
                :
                <UserFollowers setComponent={setComponent} followers={followers} />
            }
        </div>
        :
        <div className="UserProfile">
            <div className="loading">
                <img src={loading} alt="loading" />
            </div>
        </div>
    );
}

export default UserProfile;
