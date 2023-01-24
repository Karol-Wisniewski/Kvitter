import { Link, useLocation, Outlet } from "react-router-dom";
import '../Style/Home/HomeStyle.scss';
import logo from "../Utils/logo.png"

const Home = () => {

    const location = useLocation();

    return (
        <div className="Home">
            <div className="theme-div">
                <div className="theme-text">Explore.</div>
                <div className="theme-text">Talk.</div>
                <div className="theme-text">Anywhere.</div>
                <div className="theme-text">Anytime.</div>
            </div>
            <div className="meet-div">
                <div className="meet-kvitter-div">
                    <img alt="logo" src={logo} className="logo"></img>
                    <p className="meet-p">Meet Kvitter!</p>
                </div>
                <Link 
                    to="register"
                    state={{ background: location }}
                    className="link"
                >
                    Sign Up
                </Link>
                <Outlet />
                <p className="meet-p-bottom">Already have an account?</p>
                <Link 
                    to="login" 
                    className="link-bottom" 
                    state={{ background: location }}
                >
                    Sign In
                </Link>
            </div>
        </div>
    );
}

export default Home;
