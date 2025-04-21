import axios from "axios";
import useAuth from "../Hooks/useAuth";
import config from "../Config";


const BASE_URL = config.apiUrl;
console.log(BASE_URL)

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

const axiosAuth= axios.create({
  baseURL: `${BASE_URL}/auth/`,
  withCredentials: true,
})

const axiosNoAUth = axios.create({
  baseURL: `${BASE_URL}/no-auth/`,
  withCredentials: true,
});

const axiosAdmin = axios.create({
  baseURL: `${BASE_URL}/admin/`,
  withCredentials: true,
})

const axiosModerator = axios.create({
  baseURL: `${BASE_URL}/moderator/`,
  withCredentials: true,
})

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
    console.log(BASE_URL);
    if (window.location.pathname.startsWith("/u/")) {
      window.location.href = "/login";
    }
         // Redirect user to login page
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

axiosAdmin.interceptors.response.use(
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
          return axiosAdmin(originalRequest); // Retry original request
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      // If another request is already refreshing, queue this request
      return new Promise((resolve) => {
        refreshSubscribers.push(() => {
          resolve(axiosAdmin(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

axiosModerator.interceptors.response.use(
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
          return axiosModerator(originalRequest); // Retry original request
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      // If another request is already refreshing, queue this request
      return new Promise((resolve) => {
        refreshSubscribers.push(() => {
          resolve(axiosModerator(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export { axiosInstance, useAxiosGenerateImage, axiosPrivate, axiosNoAUth , axiosAuth, axiosAdmin, axiosModerator };



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