import logo from './logo.svg';
import './App.css';
import axios from "axios"
import { useEffect } from 'react';

function App() {

  useEffect(()=>{
    get_cookie()
  },[])


    const get_cookie=async()=>{
    await axios.get("http://localhost:3001/get-token",
    {
      withCredentials:true,
    })
    .then((response)=>{
      console.log(response)
    })
    .catch(
      (error)=>{
        console.error("error :"+error.response?error:error);
      }
    )
  }

  const post_cookie=async()=>{
    await axios.post("http://localhost:3001/post-token",{},
    {
      withCredentials:true,
    }).then(()=>console.log("post request")).catch(
      (error)=>{
        console.error("error :"+error.response?error:error);
      }
    )
  }

  return (
    <div className="App">
      <button onClick={()=>{post_cookie()}}>post</button>
         
    </div>
  );
}

export default App;
