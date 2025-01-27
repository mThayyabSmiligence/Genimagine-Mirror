import React, { useEffect, useState } from 'react'
import axios from "axios"


export default function Imagetest() {
    const[image,setImage]=useState(null)
    useEffect(()=>{
        generateImage()
    },[])
    const generateImage=async()=>{
        try{
            const responce = await axios.post("http://localhost:3001/api/v1/generate-image",
                {
                    prompt:"super cow"
                })
            setImage(responce.data)
        }catch(error){
            console.error(error)
        }

    }
  return (
    <div>
        <img src={image}></img>
    </div>
  )
}
