import axios from "axios";
import useAuth from "../Hooks/useAuth";

const BASE_URL = "http://localhost:3001/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Ensure cookies are sent with requests
});

const useAxiosGenerateImage = () => {
  const { auth, loggedIn } = useAuth();

  
  const instance = axios.create({
    baseURL: `${BASE_URL}/generate-image`,
    withCredentials: true, // Include cookies
  })

  return instance;
};

const axiosPrivate = axios.create({
  baseURL: `${BASE_URL}/user/`,
  withCredentials: true, // Include cookies
});

const axiosNoAUth = axios.create({
  baseURL: `${BASE_URL}/no-auth/`,
  withCredentials: false,
});

// Variable to track token refreshing process
let isRefreshing = false;
let refreshSubscribers = [];

// Function to refresh the token (cookies-based authentication)
const refreshAccessToken = async () => {
  try {
    await axios.post(`${BASE_URL}/refresh-token`, {}, { withCredentials: true });

    // Notify all queued requests that token is refreshed
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = []; // Clear the queue
  } catch (error) {
    console.error("Refresh token expired. Redirecting to login.");
    window.location.href = "/login"; // Redirect user to login page
    refreshSubscribers = []; // Clear queue if refresh fails
    return Promise.reject(error);
  }
};

// Response interceptor for axiosPrivate
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshAccessToken();
          isRefreshing = false;
          return axiosPrivate(originalRequest); // Retry original request
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      // If another request is already refreshing, queue this request
      return new Promise((resolve) => {
        refreshSubscribers.push(() => {
          resolve(axiosPrivate(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export { axiosInstance, useAxiosGenerateImage, axiosPrivate, axiosNoAUth };



// Response interceptor for axiosInstance

// axiosInstance.interceptors.response.use(
//   (response) => response, // If response is OK, return it
//   async (error) => {
//     const originalRequest = error.config;

//     // If the error is 401 Unauthorized
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (!isRefreshing) {
//         isRefreshing = true;
//         try {
//           await refreshAccessToken();
//           isRefreshing = false;

//           console.log("Got new token with refresh token");

//           // Notify all waiting requests that refresh is complete
//           onTokenRefreshed();

//           // Retry the original request (cookies are automatically sent)
//           return axiosInstance(originalRequest);
//         } catch (refreshError) {
//           isRefreshing = false;
//           return Promise.reject(refreshError);
//         }
//       }

//       // If another request is already refreshing the token, queue this request
//       return new Promise((resolve) => {
//         refreshSubscribers.push(() => {
//           resolve(axiosInstance(originalRequest));
//         });
//       });
//     }

//     return Promise.reject(error);
//   }
// );