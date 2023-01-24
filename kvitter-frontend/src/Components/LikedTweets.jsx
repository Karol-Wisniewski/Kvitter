import axios from "axios";
import { useState } from "react";
import '../Style/UserLikes/UserLikesStyle.scss';
import commentIcon from "../Utils/comment-icon.png";
import lock from "../Utils/lock.PNG";
import followers from "../Utils/followers.PNG";
import globe from "../Utils/globe.PNG";
import avatar from "../Utils/avatar.png";
import heart from "../Utils/heart-icon.png";
import redHeart from "../Utils/heart-icon-red.png";
import AddCommentDashboard from "./AddCommentDashboard";
import Comments from "./Comments";
import { useContext } from 'react';
import { CurrentUserContext } from "../App";
import moment from "moment";

const LikedTweets = ({likedTweets, getLikedTweets, setLikedTweets, comments}) => {

    const { currentUser } = useContext(CurrentUserContext);

    const [commentsToOpen, setCommentsToOpen] = useState([]);

    const openComments = (tweetId) => {
        commentsToOpen.includes(tweetId) ?
        setCommentsToOpen(commentsToOpen.filter(x => x !== tweetId))
        :
        setCommentsToOpen([...commentsToOpen, tweetId])
    };

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
                getLikedTweets(currentUser.id)
                .then(data => {
                    setLikedTweets(data)
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
                getLikedTweets(currentUser.id)
                .then(data => {
                    setLikedTweets(data)
                })
            }
        })
        .catch(err => console.log(err))
    };

    return (
        Array.from(likedTweets).sort((tw1, tw2) => {
            return new Date(tw2.t.date) - new Date(tw1.t.date)
        }).map(tweet => (
        currentUser.id === tweet.tc.userId || tweet.t.audience === "public" || (tweet.t.audience === "followers" && currentUser.following.includes(tweet.tc.userId)) ?
        <div key={tweet.t.id}>
            <div className="date-n-icon">
                {
                    tweet.t.audience === "private" ?
                    <div className="private-div">
                        <img src={lock} alt="lock" />
                        <p>Private</p>
                    </div>
                    :
                    tweet.t.audience === "followers" ?
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
                        tweet.t.date.split("/")[1].split(":")[0].length === 1 ?
                        moment(new Date(`${tweet.t.date.split("/")[0]}T0${tweet.t.date.split("/")[1].split(":")[0]}:${tweet.t.date.split("/")[1].split(":")[1]}:${tweet.t.date.split("/")[1].split(":")[2]}`)).fromNow()
                        :
                        moment(new Date(`${tweet.t.date.split("/")[0]}T${tweet.t.date.split("/")[1]}`)).fromNow()
                    }
                </p>
            </div>
            <div>
                {
                    tweet.tc.authorProfilePicture ?
                    <img 
                        alt="avatar-post"
                        src={`http://localhost:3000/images/${tweet.tc.authorProfilePicture}`}
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
                <p>{tweet.tc.firstName}&nbsp;{tweet.tc.lastName}</p>
                <p className="username">@{tweet.tc.username}</p>
            </div>
            <p className="content">{tweet.t.content}</p>
            {tweet.t.pictureUrl && 
            <img 
                src={`http://localhost:3000/images/${tweet.t.pictureUrl}`} alt=""
                crossOrigin="anonymous"
            >
            </img>}
            <div className="comments-button-div">
                <button onClick={() => openComments(tweet.t.id)}>
                    <img alt="" src={commentIcon}/>
                </button>
                {tweet.t.likedBy.includes(currentUser.id) ?
                <div className="rating-div">
                    <p>{tweet.t.likedBy.length}</p>
                    <div 
                        className="heart-image-div-liked"
                        onClick={() => dislikeTweet(currentUser.id, tweet.t.id)}
                        >
                        <img alt="" src={redHeart} className="heart-icon-liked" />
                    </div>
                </div>
                :
                <div className="rating-div">
                    <p>{tweet.t.likedBy.length}</p>
                    <div 
                        className="heart-image-div"
                        onClick={() => likeTweet(currentUser.id, tweet.t.id)}
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
            {commentsToOpen.includes(tweet.t.id) &&
                <>
                    <AddCommentDashboard />
                    <Comments tweetId={tweet.t.id} comments={comments}/>
                </>
            }
        </div>
        :
        null
        ))
    );
}

export default LikedTweets;