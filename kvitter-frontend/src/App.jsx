import {  Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, createContext, useState } from "react";
import axios from 'axios';
import "./Style/App/AppStyle.scss"
import Home from "./Components/Home.jsx"
import Register from "./Components/Register.jsx"
import Login from "./Components/Login.jsx"
import UserProfile from "./Components/UserProfile.jsx"
import Dashboard from "./Components/Dashboard.jsx"
import Header from "./Components/Header.jsx"
import Footer from "./Components/Footer.jsx"
import EditUserProfile from "./Components/EditUserProfile";
import UserSettings from "./Components/UserSettings";
import MakeSureModal from "./Components/MakeSureModal";
import SearchUser from "./Components/SearchUser";

const CurrentUserContext = createContext();


const App = () => {

  const location = useLocation();
  /*
    undefined - nie wiadomo
    null - niezalogowany
    object - zalogowany
  */
  const [currentUser, setCurrentUser] = useState(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    console.log('checking auth')

    
    axios.get('http://localhost:3000/auth/me', { withCredentials: true }
    ).then(res => {
      setCurrentUser(res.data.userData); // nie używać w zapytaniach nic oprócz id
      navigate("/")
    }).catch(err => {
      if (err.response.status === 401) {
        console.log('unauthorized')
        setCurrentUser(null);
      } else {
        throw err;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const background = location.state && location.state.background

  return (
    <div className="App">
      <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
        <Header />
        <main>
          {currentUser === undefined ? <div>...</div> : (
            <>
            <Routes location={background || location}>
              <Route path="/" element={ currentUser ? <Dashboard /> : <Home />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="profile/:id" element={<UserProfile />} />
              <Route path="profile/:id/settings" element={<UserSettings />} />
              <Route path="search" element={<SearchUser />} />
            </Routes>
            {background && (
              <Routes>
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
                <Route path="profile/:id/edit" element={<EditUserProfile />} />
                <Route path="profile/:id/settings/delete" element={<MakeSureModal />} />
              </Routes>
            )}
            </>
          )}
        </main>
        <Footer />
      </CurrentUserContext.Provider>
    </div>
  );
}

export {CurrentUserContext};

export default App;
