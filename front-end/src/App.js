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

function App() {
  const[showNavBar,setShowNavBar]=useState(true)
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
            <Route path='/login' element={<Login></Login>}></Route> 
            <Route path='/register' element={<RegisterUser></RegisterUser>}></Route>
            <Route path='/user-email-verification/:verification_token' element={<VerifyUser></VerifyUser>}></Route>


            <Route element={<NavLayout setShowNavBar={setShowNavBar} showNavBar={showNavBar} width={width}></NavLayout>}>
              
                <Route path="image-generation" element={<GuestContentPage></GuestContentPage>}></Route>
                
                <Route path='test' element={<Imagetest showNavBar={showNavBar}></Imagetest>}></Route>
                <Route path='u' element={<UserLayout></UserLayout>}>
                  <Route path='c/:chatId' element={<ChatPage></ChatPage>}></Route>
                  <Route path=""></Route>
                </Route>
             
            </Route>
            
          </Routes>
   
      </Router>
    </div>
  );
}

export default App;

