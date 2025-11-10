
const Story = require('../models/Story');
const axios = require('axios');
const { Scene, Character } = require('../models');
const { extractValidJson } = require('../helper/JsonHelper');
const { llama3BInstructText } = require('../API/CloudFlare.api');
const autoStoryQueue = require('../queue/AutoStoryQueue');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
require('dotenv').config();


exports.createAutoStoryService = async (user_id, name, description, total_scenes, style_id) => {
    try{
        const story =await Story.create({name, user_id, description, total_scenes, style_id,type:'auto'});
        // console.log(story);
        return{
          success: true,
          story,
          message: 'Story created successfully',
          status: 201
        }
      }catch(e){
        console.error(e);
        return{
          success: false,
          message: 'Failed to create story',
          status: 500
        }
      }
}


exports.UpdateAutoStoryJobId= async(story_id,job_id)=>{
  try{
    const story =await Story.update({job_id},{where:{id:story_id}});
    return{
      success: true,
      story,
      message: 'Story created successfully',
      status: 201
    }
  }catch(e){
    console.error(e);
    return{
      success: false,
      message: 'Failed to create story',
      status: 500
    }
  }
}
exports.extractScenesAndCharactersService = async (description, no_of_scene) => {

    try{

      
      const cloud_flare_acc_id= process.env.CLOUD_FLARE_ACC_ID;
      const cloud_flare_api_key= process.env.CLOUD_FLARE_API_KEY;
      const model_id= process.env.CLOUD_FLARE_LLAMA_3_8B_INSTRUCT;
      // const model_id= "@hf/mistral/mistral-7b-instruct-v0.2";   

      const systemPrompt = `
      You are a JSON-only story parser.

      You must always return **valid JSON only** — no text outside JSON.

      Your task:
      1. Extract every unique character mentioned in the input story. Each character must include their "name" and "description" (based on what is said or implied in the text).
      2. Divide the story into **exactly the number of scenes specified by the user** — no more, no less.
        - If the story is short, expand it logically or add plausible transitional details to reach the required scene count.
        - Each scene prompt should be a clear, self-contained visual description that continues the story flow.
      3. Return only this JSON structure:

      {
        "characters": [
          {"name": "string", "description": "string"}
        ],
        "scenes": [
          {"scene_number": number, "prompt": "string"}
        ]
      }

      You must ensure that:
      - The "scenes" array length is **exactly equal** to the user-specified number.
      - Each "scene_number" starts at 1 and increases sequentially.
      - Do not include any text or explanation outside the JSON.
      `;


      const userPrompt = `Story prompt:
        ${description}

        Number of scenes: ${no_of_scene}
        `;

      // const result = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${cloud_flare_acc_id}/ai/run/${model_id}`, 
      //   {prompt: `${systemPrompt}\n\nUser: ${userPrompt}`}, 
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${cloud_flare_api_key}`,
      //       'Content-Type': 'application/json',
      //     },
      //     responseType: 'json',
      //   }
      // );

      message =[
        {
          "role": "system",
          "content": systemPrompt
        },
        {
          "role": "user",
          "content": userPrompt
        }
      ]

      let response = await llama3BInstructText(message,2000);
      response= extractValidJson(response);
      return {
        success: true,
        data: response,
        message: 'Story created successfully',
        status: 201
      };
    }catch(e){
      console.error(e);
      return {
        success: false,
        message: 'Failed to create story',
        status: 500
      };
    }
}

exports.printNumbers = async (number) => {
  try {
    console.log("number", number);
    const story = await Scene.findOne({ where: { id: 56 } });

    if (!story) {
      console.log("Story not found");
      return;
    }

    story.scene_order = number;
    await story.save(); // await is important

    console.log("Updated story:", story);
  } catch (e) {
    console.error("Error:", e);
  }
}

exports.getStoryStatusService = async (story_id, user_id) => {
  try {
    const story = await Story.findOne({ where: { id: story_id , user_id} });
    if (!story) {
      return { success: false, message: 'Story not found', status: 404 };
    }

    const characterCount = await Character.count({ where: { story_id } });
    const sceneCount = await Scene.count({ where: { story_id } });

    const data={
      id:story.id,
      status:story.status,
      total_scenes:story.total_scenes,
      generated_scenes:sceneCount,
      characters:characterCount
    }
    

    return { success: true, data, message: 'Story fetched successfully', status: 200 };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to fetch story', status: 500 };
  }
}


exports.stuckHandler= async()=>{

  console.log("running the stuck handler")
  try{
    const stories = await Story.findAll({
      where: {
        status: {
          [Op.in]: ['started', 'in_progress', 'generating_characters', 'generating_scenes']
        },
        updatedAt: {
          [Op.lte]: new Date(Date.now() - 30 * 60 * 1000)
        },
        type: 'auto'
      },
      logging:console.log
    });

    console.log("stories :",stories)

    for (const story of stories) {
      let new_job_id;
      if(story.job_id){
        new_job_id = await RestartAutoStoryWorker(story.id,story.job_id,story.user_id);
      }else{
        new_job_id = await RestartAutoStoryWorker(story.id,null,story.user_id);
      }

      if(new_job_id){
          await this.UpdateAutoStoryJobId(story.id,new_job_id);
      }else{
        await Story.update({ status: 'failed' }, { where: { id: story.id } });
      }
    }

  }
  catch(err){
    console.error("error in Auto Story Stuck handler",err)
    console.error("error message",err.message)
  }
}

exports.manuallStruckAutoStoryRestartService=async(story_id,user_id)=>{
  try{
    const story = await Story.findOne({ where: { id: story_id , user_id , type:'auto'} });
    if(!story){
      throw new AppError("Story not found",404);
    }
    if(story.status=="completed"){
      throw new AppError("Story already completed",400);
    }
    if(story.status!="failed" &&  story.updatedAt > new Date(Date.now() - 30 * 60 * 1000)){
      throw new AppError("Story not failed and still in progress, if the progress seems stuck in the same status, it will be resolved automatically within 30 minutes to 1 hour",400);
    }
    story.status="started";
    await story.save();
    const new_job_id = await RestartAutoStoryWorker(story_id,null,user_id);
    if(!new_job_id){
      throw new AppError("Failed to restart story");
    }
    await this.UpdateAutoStoryJobId(story_id,new_job_id);

    return{
      success: true,
      message: 'Story restarted successfully',
      status: 201
    }

  }catch(e){
    console.error(e);
    if(e instanceof AppError){
      throw e;
    }
    throw new AppError(e.message||"Failed to restart story");
  }
  
}

const RestartAutoStoryWorker = async (story_id,job_id=null,user_id) => {
  try {
    if(job_id){
      const job = await autoStoryQueue.getJob(job_id);
      if(!job){
        throw new Error("Job not found");
      }
      const jobId = job.id;
      
      if (jobId) {
        await autoStoryQueue.remove(jobId);
      }
    }

    const newJob = await autoStoryQueue.add("generateStory", { storyId: story_id , userId: user_id });  
    console.log("restarted the queue for story: ",story_id," with new job id: ",newJob.id);
    return newJob.id;
  } catch (error) {
    console.error('Error restarting worker:', error);
    return{
      success: false,
      message: error.message || 'Failed to restart worker',
      status: 500
    }
  }
};
