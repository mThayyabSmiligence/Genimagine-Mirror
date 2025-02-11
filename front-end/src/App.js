import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Css/common.css"
import './App.css';
import {BrowserRouter as Router , Routes,Route} from "react-router-dom" 
import SideNavBar from './Components/SideNavBar';
import SubTopbar from './Components/SubTopbar';
import { useEffect, useState } from 'react';
import PromptInPutContainer from './Components/CommonComponents/PromptInputContainer';
import GuestContentPage from './Pages/Guest/GuestContentPage';
import Imagetest from './Pages/Imagetest';
import Login from './Pages/Login';
import UserLayout from './Layouts/UserLayout';
import UserContentPage from './Pages/User/UserContentPage';
import ChatPage from './Pages/User/ChatPage';

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
        <SideNavBar showNavBar={showNavBar}></SideNavBar>


        
          <SubTopbar setShowNavBar={setShowNavBar} showNavBar={showNavBar} width={width}></SubTopbar>
        <div className={`content-section ${!showNavBar?"big":"short"}  d-flex flex-column` } style={{ width:`${showNavBar?width-250:width}px` }}>
          <Routes>
            <Route path="/image-generation" element={<GuestContentPage></GuestContentPage>}></Route>
            
            <Route path='/login' element={<Login></Login>}></Route>
            <Route path='/test' element={<Imagetest></Imagetest>}></Route>
            <Route path='/c/:chatId' element={<ChatPage></ChatPage>}></Route>
            <Route path='/u' element={<UserLayout></UserLayout>}>
              <Route path='image-generation' element={<UserContentPage></UserContentPage>}></Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
// useEffect(()=>{
//   get_cookie()
// },[])

//   const get_cookie=async()=>{
//   await axios.get("http://localhost:3001/get-token",
//   {
//     withCredentials:true,
//   })
//   .then((response)=>{
//     console.log(response)
//   })
//   .catch(
//     (error)=>{
//       console.error("error :"+error.response?error:error);
//     }
//   )
// }

// const post_cookie=async()=>{
//   await axios.post("http://localhost:3001/post-token",{},
//   {
//     withCredentials:true,
//   })
// .then(()=>console.log("post request")).catch(
//     (error)=>{
//       console.error("error :"+error.response?error:error);
//     }
//   )
// }
