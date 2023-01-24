import '../Style/UserTweets/UserTweetsStyle.scss';
import { useContext, useState } from 'react';
import { CurrentUserContext } from '../App';
import heart from "../Utils/heart-icon.png";
import redHeart from "../Utils/heart-icon-red.png";
import axios from 'axios';
import AddComment from './AddComment';
import Comments from './Comments';
import commentIcon from "../Utils/comment-icon.png";
import lock from "../Utils/lock.PNG";
import followers from "../Utils/followers.PNG";
import globe from "../Utils/globe.PNG";
import avatar from "../Utils/avatar.png";
import trash from "../Utils/trash.jpg";
import moment from "moment";

const UserTweets = (
    {
        tweets, 
        isViewingOwnProfile, 
        deleteTweet, 
        userData,
        getTweets,
        setTweets,
        comments,
        setComments,
        getCommentsForUser
    }
) => {

    const [commentsToOpen, setCommentsToOpen] = useState([]);

    const openComments = (tweetId) => {
        commentsToOpen.includes(tweetId) ?
        setCommentsToOpen(commentsToOpen.filter(x => x !== tweetId))
        :
        setCommentsToOpen([...commentsToOpen, tweetId])
    }

    const { currentUser } = useContext(CurrentUserContext);

    const likeTweet = async (userId, tweetId) => {
        return axios.post(`http://localhost:3000/tweets/${userId}/like/${tweetId}`, 
        {
            userId: userId,
            tweetId: tweetId
        },
        {
            withCredentials: true
        })
        .then(res => {
            if (res.status === 200) {
                getTweets(userData.id)
                .then(data => {
                    setTweets(data)
                })
            }
        })
        .catch(err => console.log(err))
    };

    const dislikeTweet = async (userId, tweetId) => {
        return axios.post(`http://localhost:3000/tweets/${userId}/dislike/${tweetId}`, 
        {
            userId: userId,
            tweetId: tweetId
        },
        {
            withCredentials: true
        })
        .then(res => {
            if (res.status === 200) {
                getTweets(userData.id)
                .then(data => {
                    setTweets(data)
                })
            }
        })
        .catch(err => console.log(err))
    };

    return (
        <div className="UserTweets">
            {Array.from(tweets).sort((tw1, tw2) => {
                return new Date(tw2.date) - new Date(tw1.date)
            }).map(tweet => (
                currentUser.id === userData.id || tweet.audience === "public" || (tweet.audience === "followers" && currentUser.following.includes(userData.id)) ?
                <div key={tweet.id}>
                    <div className="date-n-icon">
                        {
                            tweet.audience === "private" ?
                            <div className="private-div">
                                <img src={lock} alt="lock" />
                                <p>Private</p>
                            </div>
                            :
                            tweet.audience === "followers" ?
                            <div className="private-div">
                                <img src={followers} alt="lock" />
                                <p>Followers</p>
                            </div>
                            :
                            <div className="private-div">
                                <img src={globe} alt="lock" />
                                <p>Public</p>
                            </div>
                        }
                        <p className="date">
                            {
                                tweet.date.split("/")[1].split(":")[0].length === 1 ?
                                moment(new Date(`${tweet.date.split("/")[0]}T0${tweet.date.split("/")[1].split(":")[0]}:${tweet.date.split("/")[1].split(":")[1]}:${tweet.date.split("/")[1].split(":")[2]}`)).fromNow()
                                :
                                moment(new Date(`${tweet.date.split("/")[0]}T${tweet.date.split("/")[1]}`)).fromNow()
                            }
                        </p>
                        {isViewingOwnProfile && <button>
                            <img 
                                className="trash-icon" 
                                alt="trash-icon"
                                src={trash} 
                                onClick = {() => deleteTweet(userData.id, tweet.id)}
                            />
                        </button>}
                    </div>
                    <div>
                        {
                            userData.profilePictureUrl ?
                            <img 
                                alt="avatar-post"
                                src={`http://localhost:3000/images/${userData.profilePictureUrl}`}
                                crossOrigin="anonymous"
                                className="avatar"
                            >
                            </img>
                            :
                            <img
                                alt="avatar-post"
                                src={avatar}
                                className="avatar"
                            >
                            </img>
                        }
                        <p>{userData.firstName}&nbsp;{userData.lastName}</p>
                        <p className="username">@{userData.username}</p>
                    </div>
                    <p className="content">{tweet.content}</p>
                    {tweet.pictureUrl && 
                    <img 
                        src={`http://localhost:3000/images/${tweet.pictureUrl}`} alt=""
                        crossOrigin="anonymous"
                    >
                    </img>}
                    <div className="comments-button-div">
                        <button onClick={() => openComments(tweet.id)}>
                            <img alt="" src={commentIcon}/>
                        </button>
                        {tweet.likedBy.includes(currentUser.id) ?
                        <div className="rating-div">
                            <p>{tweet.likedBy.length}</p>
                            <div 
                                className="heart-image-div-liked"
                                onClick={() => dislikeTweet(currentUser.id, tweet.id)}
                                >
                                <img alt="" src={redHeart} className="heart-icon-liked" />
                            </div>
                        </div>
                        :
                        <div className="rating-div">
                            <p>{tweet.likedBy.length}</p>
                            <div 
                                className="heart-image-div"
                                onClick={() => likeTweet(currentUser.id, tweet.id)}
                            >
                                <div className="img-in">
                                    <img alt="" src={heart} className="heart-icon" />
                                </div>
                                <div className="img-hover">
                                    <img alt="" src={redHeart} className="heart-icon" />
                                </div>
                            </div>
                        </div>
                        }
                    </div>
                    {commentsToOpen.includes(tweet.id) &&
                        <>
                            <AddComment 
                                getCommentsForUser={getCommentsForUser}
                                setComments={setComments}
                                tweetId={tweet.id}
                            />
                            <Comments tweetId={tweet.id} comments={comments}/>
                        </>
                    }
                </div>
                :
                null
                ))
            }
        </div>
    );
}

export default UserTweets;