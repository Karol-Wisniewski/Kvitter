import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../Style/UserLikes/UserLikesStyle.scss';
import LikedTweets from "./LikedTweets";

const UserLikes = ({getTweets, setTweets}) => {

    const [likedTweets, setLikedTweets] = useState([]);

    const params = useParams();

    const id = params.id

    const [comments, setComments] = useState([]);


    const getAllComments = async () => {
        return axios.get(`http://localhost:3000/tweets/comments/all`, {
            withCredentials: true
        })
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
    };

    const getLikedTweets = async (id) => {
        return axios.get(`http://localhost:3000/tweets/${id}/liked`, {
            withCredentials: true
        })
        .then(res => {
            getTweets(id).then(data => setTweets(data));
            return res.data
        })
        .catch(err => console.log(err))
    };

    useEffect(() => {

        if (id) {
            getLikedTweets(id).then(data => setLikedTweets(data));
            getAllComments().then(data => setComments(data));
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const obj = likedTweets?.length > 0 ? likedTweets[0] : {}

    return (
        <div className="UserLikes">
            {Object.keys(obj).length ?
                <>
                    <div className="count-div">Tweets liked: {likedTweets.length}</div>
                    <LikedTweets 
                        likedTweets={likedTweets} 
                        getLikedTweets={getLikedTweets}
                        setLikedTweets={setLikedTweets}
                        comments={comments}
                    />
                </>
                :
                <div className="no-likes-div">No liked tweets</div>
            }
        </div>
    );
}

export default UserLikes;
