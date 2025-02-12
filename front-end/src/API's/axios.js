import axios from "axios";
import useAuth from "../Hooks/useAuth";

const BASE_URL = "http://localhost:3001/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const useAxiosGenerateImage = () => {
  const {auth, loggedIn} = useAuth();

  const instance = axios.create({
    baseURL: loggedIn 
      ? `${BASE_URL}/user/generate-image`
      : `${BASE_URL}/generate-image`,
    withCredentials: loggedIn || false,
  });

  return instance;
};

const axiosPrivate=axios.create({
    baseURL:`${BASE_URL}/user/`,
    withCredentials:true
})

export { axiosInstance, useAxiosGenerateImage,axiosPrivate };
