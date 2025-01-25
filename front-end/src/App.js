import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import {BrowserRouter as Router , Routes,Route} from "react-router-dom" 
import SideNavBar from './Components/SideNavBar';
import SubTopbar from './Components/SubTopbar';
import { useState } from 'react';
import PromptInPutContainer from './Components/CommonComponents/PromptInputContainer';

function App() {
  const[showNavBar,setShowNavBar]=useState(true)
  return (
    <div className="App">
      <Router>
        <SideNavBar showNavBar={showNavBar}></SideNavBar>


        
        <SubTopbar setShowNavBar={setShowNavBar} showNavBar={showNavBar}></SubTopbar>
        <div className={`content-section ${showNavBar?"short":"big"}`}>
          <Routes>
            <Route path="guest/generate-image" element={<PromptInPutContainer></PromptInPutContainer>}></Route>
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
