import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import "../Style/UserSettings/UserSettings.scss"

const UserSettings = () => {

    const location = useLocation();

    return (
        <div className="UserSettings">
            <Link 
                // to="delete"
                state={{ background: location }}
                className="link"
            >
                <button>
                    Change password
                </button>
            </Link>
            <Link 
                to="delete"
                state={{ background: location }}
                className="link"
            >
                <button>
                    Delete account
                </button>
            </Link>
        </div>
    )
};

export default UserSettings;