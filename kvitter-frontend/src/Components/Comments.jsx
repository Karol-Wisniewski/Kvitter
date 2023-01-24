import { useNavigate } from 'react-router';
import "../Style/Comments/CommentsStyle.scss"
import avatar from "../Utils/avatar.png";

const Comments = ({comments, tweetId}) => {

    const navigate = useNavigate();

    return (
        <div className="Comments">
            {Array.from(comments).sort((c1, c2) => {
                return new Date(c2.date) - new Date(c1.date)
            }).map(comment => {
                if (comment.tweetId === tweetId) {
                    return (<div key={comment.id} className="comment-div">
                        <div>
                            {
                                comment.commenterProfilePicture ?
                                <img 
                                    alt="avatar"
                                    src={`http://localhost:3000/images/${comment.commenterProfilePicture}`}
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
                                    window.scrollTo({ top: 0 })
                                    navigate(`/profile/${comment.commenterId}`)
                                }}
                            >
                                {comment.commenterFirstName}&nbsp;{comment.commenterLastName}
                            </button>
                        </div>
                        <p>{comment.comment}</p>
                    </div>)
                } else {
                    return null;
                }
            })}
        </div>
    );
};

export default Comments;