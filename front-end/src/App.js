import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Css/common.css"
import './App.css';
import {BrowserRouter as Router , Routes,Route, Navigate} from "react-router-dom" 
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
import PublishedImages from './Pages/User/PublishedImages';
import ChangePassword from './Pages/User/ChangePassword';
import TermsAndConditions from './Pages/policies/TermsAndConditions';
import PrivacyPolicy from './Pages/policies/PrivacyPolicy';
import HomeLayout from './Layouts/HomeLayout';



function App() {

  const[showNavBar,setShowNavBar]=useState(false)
  const [width, setWidth] = useState(window.innerWidth);
  const [fresh,setFresh]=useState(true)
          
        useEffect(() => {
          const handleResize = () => {
            setWidth(window.innerWidth);
          };
              
          window.addEventListener('resize', handleResize);
              
          return () => {
            window.removeEventListener('resize', handleResize);
          };
    }, []);


  useEffect(()=>{
    if(fresh){
      if(localStorage.getItem('side-nav-open')){
        setShowNavBar(localStorage.getItem('side-nav-open')=="true"?true:false);
        setFresh(false)
        return
      }
    }
    
    localStorage.setItem('side-nav-open',showNavBar)
  },[showNavBar])
  useEffect(()=>{},[])
  return (
    <div className="App">

          
          <Routes>
            <Route element={<HomeLayout></HomeLayout>}>
                <Route path='' element={<LandingPage/>}></Route>
                <Route path='terms-and-conditions' element={<TermsAndConditions></TermsAndConditions>}></Route>
                <Route path='privacy-policy' element={<PrivacyPolicy></PrivacyPolicy>}></Route>
            </Route>


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
                  <Route path='published-images' element={<PublishedImages></PublishedImages>}></Route>
                  <Route path='change-password' element={<ChangePassword></ChangePassword>}></Route>
                </Route>

                <Route path='credit-purchase' element={<CreditPurchasePage></CreditPurchasePage>}></Route>

            </Route>
            <Route
              path='*'
              element={<Navigate to="/"/>}
            ></Route>
          </Routes>

    </div>
  );
}

export default App;

