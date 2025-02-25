import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Css/common.css"
import './App.css';
import {BrowserRouter as Router , Routes,Route} from "react-router-dom" 
import { useEffect, useState } from 'react';
import GuestContentPage from './Pages/Guest/GuestContentPage';
import Imagetest from './Pages/Imagetest';
import Login from './Pages/Login';
import UserLayout from './Layouts/UserLayout';
import UserContentPage from './Pages/User/UserContentPage';
import ChatPage from './Pages/User/ChatPage';
import NavLayout from './Layouts/NavLayout';
import RegisterUser from './Pages/RegisterUser';
import VerifyUser from './Pages/VerifyUser';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import CreditPurchasePage from './Pages/Purchase/CreditPurchasePage';
import ProfilePage from './Pages/User/ProfilePage';
import LibraryPage from './Pages/User/LibraryPage';
import PublishImagePage from './Pages/User/PublishImagePage';
import ExplorePage from './Pages/Explore/ExplorePage';
import LandingPage from './Pages/LandingPage/LandingPage';
import AuthenticationLayout from './Layouts/AuthenticationLayout';
import EditUserName from './Components/ProfilePage/EditUserName';


function App() {
  const[showNavBar,setShowNavBar]=useState(false)
  const [width, setWidth] = useState(window.innerWidth);
          
        useEffect(() => {
          const handleResize = () => {
            setWidth(window.innerWidth);
          };
              
          window.addEventListener('resize', handleResize);
              
          return () => {
            window.removeEventListener('resize', handleResize);
          };
    }, []);
  return (
    <div className="App">
      <Router>
          
          <Routes>

            <Route path='/' element={<LandingPage/>}></Route>\

              <Route path='login' element={<Login></Login>}></Route> 
            <Route  element={<AuthenticationLayout></AuthenticationLayout>}>
              <Route path='register' element={<RegisterUser></RegisterUser>}></Route>
              <Route path='user-email-verification/:verification_token' element={<VerifyUser></VerifyUser>}></Route>
              <Route path='forgot-password' element={<ForgotPassword></ForgotPassword>}></Route>
              <Route path='reset-password/:encrypted_email/:reset_token' element={<ResetPassword></ResetPassword>}></Route>
            </Route>
            
            <Route path='edit-user-name' element={<EditUserName></EditUserName>}></Route>

            


            <Route element={<NavLayout setShowNavBar={setShowNavBar} showNavBar={showNavBar} width={width}></NavLayout>}>
              
                <Route path="image-generation" element={<GuestContentPage></GuestContentPage>}></Route>
                <Route path="explore" element={<ExplorePage></ExplorePage>}></Route>
                <Route path='credit-shop'></Route>
                <Route path='u' element={<UserLayout></UserLayout>}>
                  <Route path='profile' element={<ProfilePage></ProfilePage>}></Route>
                  <Route path='c/:chatId' element={<ChatPage></ChatPage>}></Route>
                  <Route path='library' element={<LibraryPage></LibraryPage>}></Route>
                  <Route path='publish' element={<PublishImagePage></PublishImagePage>}></Route>
                </Route>

                <Route path='credit-purchase' element={<CreditPurchasePage></CreditPurchasePage>}></Route>

            </Route>
            
          </Routes>
   
      </Router>
    </div>
  );
}

export default App;

