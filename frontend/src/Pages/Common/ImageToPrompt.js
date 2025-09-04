import React from 'react'
import ImageUpload from '../../Components/ImageToPrompt/ImageUpload'
import ConversationHistory from '../../Components/ImageToPrompt/ConversationHistory'
import { useState } from 'react';
import { useInView } from "react-intersection-observer";
import { useEffect } from 'react';
import { axiosPrivate } from '../../API\'s/axios';

export default function ImageToPrompt() {

    const [conversationHistory, setConversationHistory] = useState([]);
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState("desc");
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const { ref, inView } = useInView(); 

    useEffect(()=>{
        setPage(1);
        setConversationHistory([]);
        setHasMore(true);
        getConversation(1, true);
    },[])

    useEffect(()=>{
        console.log("checking");
        if(inView && hasMore && !loading){
            console.log("inView");
            getConversation(page);
        }
    },[inView])


    const getConversation=async(page, reset=false)=>{
        try{
            setLoading(true);
            const response=await axiosPrivate.get(`/image-to-prompt?page=${page}&sort=${sort}`);

            if(response.data.result.success ){
                setConversationHistory((prevHistory) =>reset ? response.data.result.images : [...prevHistory, ...response.data.result.images]);
                setHasMore(response.data.result.pagination.nextPage??false);
                setPage(page+1);
            }
            setLoading(false);
        }catch(err){
            setLoading(false);
            console.log(err);
            setHasMore(false);
            if(err.status===401){
                const prevHistory = JSON.parse(sessionStorage.getItem('GuestImageToPromptHistory'));
                setConversationHistory(prevHistory);
            }
        }
    }
    return (
        <main className='mt-5 container-fluid image-to-prompt-page' id=''>
            <section>
                <div class="text-center my-4">
                    <h2 class="h3 font-weight-bold text-dark">
                        Upload Image, Get AI Prompt
                    </h2>
                    <p class="lead text-muted mx-auto" style={{ maxWidth: '500px' }} >
                        Upload any image and our AI will analyze it to generate a detailed prompt description
                        that captures the essence, style, and composition of your image.
                    </p>
                    <ImageUpload setConversationHistory={setConversationHistory} conversationHistory={conversationHistory}></ImageUpload>
                </div>
            </section>

            <section>
                <ConversationHistory conversationHistory={conversationHistory} />
                { loading &&
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                 }
                <div ref={ref} style={{ height: '10px', background: "transparent"  }}></div>
            </section>
        </main>
    )
}
