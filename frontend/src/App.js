import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./Css/common.css"
import './App.css';
import 'boxicons/css/boxicons.min.css';
import {BrowserRouter as Router , Routes,Route, Navigate} from "react-router-dom" 
import { useContext, useEffect, useState } from 'react';
import GuestContentPage from './Pages/Guest/GuestContentPage';
import Imagetest from './Pages/Imagetest';
import Login from './Pages/Login';
import UserLayout from './Layouts/UserLayout';
import UserContentPage from './Pages/User/UserContentPage';
import ChatPage from './Pages/User/ChatPage';
import NavLayout from './Layouts/NavLayout';
import RegisterUser from './Pages/RegisterUser';
import VerifyUser from './Pages/VerifyUser';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import CreditPurchasePage from './Pages/Purchase/CreditPurchasePage';
import ProfilePage from './Pages/User/ProfilePage';
import LibraryPage from './Pages/User/LibraryPage';
import PublishImagePage from './Pages/User/PublishImagePage';
import ExplorePage from './Pages/Explore/ExplorePage';
import LandingPage from './Pages/LandingPage/LandingPage';
import AuthenticationLayout from './Layouts/AuthenticationLayout';
import EditUserName from './Components/ProfilePage/EditUserName';
import PublishedImages from './Pages/User/PublishedImages';
import ChangePassword from './Pages/User/ChangePassword';
import TermsAndConditions from './Pages/policies/TermsAndConditions';
import PrivacyPolicy from './Pages/policies/PrivacyPolicy';
import HomeLayout from './Layouts/HomeLayout';

import OtherUserProfile from './Pages/OtherUserProfile';

import ExploreImageDetail from './Pages/Explore/ExploreImageDetail';
import AdminLayout from './Layouts/AdminLayout';
import ModeratorLayout from './Layouts/ModeratorLayout';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ModeratorDashboard from './Pages/Moderator/ModeratorDashboard';
import UserManagement from './Pages/Moderator/UserManagement';
import UserDetail from './Pages/Moderator/UserDetail';
import Reports from './Pages/Moderator/Reports';
import ReportImageDetail from './Pages/Moderator/ReportImageDetail';

import { Slide, ToastContainer, toast } from 'react-toastify';
import ModeratorFeedbacks from './Pages/Moderator/ModeratorFeedbacks';
import AdminModelManagement from './Pages/Admin/AdminModelManagement';
import PlansManagement from './Pages/Admin/PlansManagement';
import CreateModelForm from './Pages/Admin/CreateModelForm';
import ModelDetail from './Pages/Admin/ModelDetail';
import CreatePlanForm from './Pages/Admin/CreatePlanForm';
import PlanDetail from './Pages/Admin/PlanDetail';
import TopUpManagement from './Pages/Admin/TopUpManagement';
import CreateTopUpForm from './Pages/Admin/CreateTopUpForm';
import TopUpPage from './Pages/Purchase/TopUpPage';
import { updateCreditsInLocalStorage } from './utils/creditUtils';
import RefreshDataContext from './Context/RefreshDataProvider';
import ModeratorManagement from './Pages/Admin/ModeratorManagement';
import CreateModeratorForm from './Pages/Admin/CreateModeratorForm';
import ModeratorDetail from './Pages/Admin/ModeratorDetail';
import ModeratorProfilePage from './Pages/Moderator/ModeratorProfilePage';
import StyleManagement from './Pages/Admin/StyleManagement';
import AdminProfilePage from './Pages/Admin/AdminProfilePage';
import ImageToPrompt from './Pages/Common/ImageToPrompt';
import { Toaster } from 'react-hot-toast';
import Scheduled from './Pages/User/Scheduled';
import StoriesPage from './Pages/User/StoriesPage';
import CreateStories from './Pages/User/CreateStories';
import CreateCharacters from './Pages/User/CreateCharacters';
import CreateScenes from './Pages/User/CreateScenes';


function App() {
  const { setRefreshCreditBalance } = useContext(RefreshDataContext);

  const[showNavBar,setShowNavBar]=useState(false)
  const [width, setWidth] = useState(window.innerWidth);
  const [fresh,setFresh]=useState(true)
          
        useEffect(() => {
          const handleResize = () => {
            setWidth(window.innerWidth);
          };
              
          window.addEventListener('resize', handleResize);
              
          return () => {
            window.removeEventListener('resize', handleResize);
          };
    }, []);

    useEffect(() => {
    const fetchCredits = async () => {
      await updateCreditsInLocalStorage();
      setRefreshCreditBalance(prev => !prev); // notify UI to re-read localStorage
    };

    fetchCredits();
  }, [setRefreshCreditBalance]);


    useEffect(()=>{
      if(fresh){
        if(localStorage.getItem('side-nav-open')){
          setShowNavBar(localStorage.getItem('side-nav-open')=="true"?true:false);
          setFresh(false)
          return
        }
      }
      
      localStorage.setItem('side-nav-open',showNavBar)
    },[showNavBar])

    useEffect(()=>{},[])
  return (
    <div className="App">

          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover={false}
            theme="light"
            transition={Slide}
          />
          <Routes>
            <Route element={<HomeLayout></HomeLayout>}>
                <Route path='' element={<LandingPage/>}></Route>
                <Route path='register' element={<RegisterUser></RegisterUser>}></Route>
                <Route path='login' element={<Login></Login>}></Route> 
                <Route path='terms-and-conditions' element={<TermsAndConditions></TermsAndConditions>}></Route>
                <Route path='privacy-policy' element={<PrivacyPolicy></PrivacyPolicy>}></Route>
                
            </Route>


            <Route  element={<AuthenticationLayout></AuthenticationLayout>}>
              <Route path='user-email-verification/:verification_token' element={<VerifyUser></VerifyUser>}></Route>
              <Route path='forgot-password' element={<ForgotPassword></ForgotPassword>}></Route>
              <Route path='reset-password/:encrypted_email/:reset_token' element={<ResetPassword></ResetPassword>}></Route>
            </Route>
            
            <Route path='edit-user-name' element={<EditUserName></EditUserName>}></Route>

            
            

            <Route element={<NavLayout setShowNavBar={setShowNavBar} showNavBar={showNavBar} width={width}></NavLayout>}>

              
                <Route path="image-generation" element={<GuestContentPage></GuestContentPage>}></Route>
                <Route path="image-to-prompt" element={<ImageToPrompt></ImageToPrompt>}></Route>
                <Route path="explore" element={<ExplorePage></ExplorePage>}></Route>
                <Route path="explore/image/:published_id" element={<ExploreImageDetail></ExploreImageDetail>}></Route>
                <Route path='credit-shop'></Route>
                <Route path='user/:userId' element={<OtherUserProfile></OtherUserProfile>}></Route>
                <Route path='user/:userId/published-images' element={<PublishedImages></PublishedImages>}></Route>
                <Route path='u' element={<UserLayout></UserLayout>}>
                  <Route path='profile' element={<ProfilePage></ProfilePage>}></Route>
                  <Route path='c/:chatId' element={<ChatPage></ChatPage>}></Route>
                  <Route path='library' element={<LibraryPage></LibraryPage>}></Route>
                  <Route path='publish' element={<PublishImagePage></PublishImagePage>}></Route>
                  <Route path='published-images' element={<PublishedImages></PublishedImages>}></Route>
                  <Route path='published-images/:published_id' element={<ExploreImageDetail></ExploreImageDetail>}></Route>
                  <Route path='change-password' element={<ChangePassword></ChangePassword>}></Route>
                  <Route path='scheduled' element={<Scheduled></Scheduled>}></Route>
                  <Route path='stories' element={<StoriesPage></StoriesPage>}></Route>
                  <Route path='stories/create' element={<CreateStories></CreateStories>}></Route>
                  <Route path='stories/edit/:id' element={<CreateStories></CreateStories>}></Route>
                  <Route path='stories/:id/characters' element={<CreateCharacters></CreateCharacters>}></Route>
                  <Route path='scenes/create/:storyid' element={<CreateScenes></CreateScenes>}></Route>
                </Route>
                <Route path='credit-purchase' element={<CreditPurchasePage></CreditPurchasePage>}></Route>



            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path='moderator-management' element={<ModeratorManagement/>}></Route>
                <Route path='moderator-management/create-moderator' element={<CreateModeratorForm/>}></Route>
                <Route path="/admin/moderator/update/:userId" element={<CreateModeratorForm isEditMode={true} />}></Route>
                <Route path='moderator-detail/:userId' element={<ModeratorDetail/>}></Route>
                <Route path='model-management' element={<AdminModelManagement/>}></Route>
                <Route path='model-detail/:modelId' element={<ModelDetail/>}></Route>
                <Route path='model-management/create-model' element={<CreateModelForm/>}></Route>
                <Route path="/admin/model/edit/:modelId" element={<CreateModelForm isEditMode={true} />} />
                <Route path='plans-management' element={<PlansManagement/>}></Route>
                <Route path='plan-detail/:packageId' element={<PlanDetail/>}></Route>
                <Route path='plans-management/create-plan' element={<CreatePlanForm/>}></Route>
                <Route path="/admin/plan/edit/:packageId" element={<CreatePlanForm isEditMode={true} />} />
                <Route path='top-up-management' element={<TopUpManagement/>}></Route>
                <Route path='top-up-management/create-plan' element={<CreateTopUpForm/>}></Route>
                <Route path="/admin/topup/edit/:planId" element={<CreateTopUpForm isEditMode={true} />} />
                <Route path='style-management' element={<StyleManagement/>}></Route>
                <Route path = "profile-page" element={<AdminProfilePage/>} ></Route>
                <Route path='change-password' element={<ChangePassword></ChangePassword>}></Route>
                <Route path='*' element={<Navigate to={'/dashboard'}></Navigate>}></Route>
            </Route>

            {/* Moderator Layout */}
            <Route path="/moderator" element={<ModeratorLayout />}>  
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ModeratorDashboard />} />
                <Route path = "user-management" element={<UserManagement/>} ></Route>
                <Route path = "user-Detail/:user_id" element={<UserDetail/>} ></Route>
                <Route path = "reports" element={<Reports/>} ></Route>
                <Route path= "report-image-detail/:report_id" element={<ReportImageDetail/>}></Route>
                <Route path = "feedbacks" element={<ModeratorFeedbacks/>} ></Route>
                <Route path = "profile-page" element={<ModeratorProfilePage/>} ></Route>
                <Route path='change-password' element={<ChangePassword></ChangePassword>}></Route>
                {/* <Route path = "image-management" element={<div>Image Management</div>} ></Route>
                <Route path = "model-management" element={<div>Model Management</div>} ></Route> */}
                <Route path='*' element={<Navigate to={'/dashboard'}></Navigate>}></Route>
            </Route>

            </Route>


            <Route
              path='*'
              element={<Navigate to="/"/>}
            ></Route>
          </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;

