import { useNavigate } from "react-router-dom";
import '../Style/UserFollowing/UserFollowingStyle.scss';
import avatar from "../Utils/avatar.png";

const UserFollowing = ({setComponent, followedUsers}) => {

    const navigate = useNavigate();

    return (
        followedUsers[0] !== null ?
        <div className="UserFollowing">
            <div className="count-div">Users followed: {followedUsers.length}</div>
            {Array.from(followedUsers).map(user => {
                return (
                    <div className="followed-user-div" key={user.id}>
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
                                setComponent("tweets");
                                document.querySelector('#following-link').classList.remove('bc');
                            }}
                        >
                            {user.firstName}&nbsp;{user.lastName}
                        </button>
                        <p className="username">@{user.username}</p>
                    </div>
                );
            })}
        </div>
        :
        <div className="UserFollowing">
            <p className="no-following-p">This user doesn't follow anyone.</p>
        </div>
    );

};

export default UserFollowing;
