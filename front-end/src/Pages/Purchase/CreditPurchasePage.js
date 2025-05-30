import React, { useContext, useEffect, useState } from 'react'
import CreditPurchaseCard from '../../Components/CreditPurchase/CreditPurchaseCard';
import '../../Css/CreditPurchasePage.css'
import { axiosInstance, axiosPrivate } from "../../API's/axios";
import RefreshDataContext from '../../Context/RefreshDataProvider';
import logo from '../../images/genimagin_short_logo.png'
import AuthContext from '../../Context/AuthProvider';
import SuccessMessageContainer from '../../Components/CommonComponents/SuccessMessageContainer';
import { Link, useLocation, useNavigate } from 'react-router-dom';


function CreditPurchasePage() {

    const { refreshCreditBalance,setRefreshCreditBalance,refreshUserData,setRefreshUserData} = useContext(RefreshDataContext)

    const {loggedIn} = useContext(AuthContext)
    const location = useLocation()
    const Navigate = useNavigate();

    const [credits, setCredits] = useState("") 
    const [Amount, setAmount] = useState("")
    const[CreditPurchaseOptions,setCreditPurchaseOptions] = useState(null)
    const [loading, setLoading] = useState(true)


    const[error,setError] = useState(false)
    const[errorMessage,setErrorMessage] = useState("")

    const [success,setSuccess] = useState(false)
    const [successMessage,setSuccessMessage] = useState("")

    const [purchaseSuccess, setPurchaseSuccess] = useState(false);

    // const[customCreditsFocus,setCustomCreditsFocus]=useState(false)
    // const[customCreditsValidation,setCustomCreditsValidation]=useState(true)

    
    useEffect(() => {
        setAmount(credits)
    },[credits])

    useEffect(() => {
        setTimeout(() =>{
            setSuccess(false)
            setError(false)
        },5000)
    },[success,error])

    const user= JSON.parse(localStorage.getItem("user_data"))

    useEffect(() => {
        getCreditPurchaseOptions()
    }, [])

    useEffect(() => {
        if(purchaseSuccess){
            setTimeout(() =>{
               setPurchaseSuccess(false)
            },2000)
        }
    },[purchaseSuccess])
    
    const getCreditPurchaseOptions = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get('/no-auth/get-packages');
            console.log(response.data , "credit purchase options")
            setCreditPurchaseOptions(response.data.data);
            sessionStorage.setItem('creditPurchaseOptions', JSON.stringify(response.data.data))
            setLoading(false)
        } catch (error) {
            console.error(error);
        }
    }
  
     const buyCredits=async(package_id,custom_credits,e)=>{
        if(!loggedIn){
            Navigate('/login',{state: {from: location},replace:true})

        }
        try{
            const response = await axiosPrivate.post('/order',
                {
                    package_id: package_id,
                    custom_credits: custom_credits,
                    currency:"INR",
                    amount:100
                }
            )
            console.log(response)

            const order= response.data.data
            var options = {
                key: "rzp_test_cqxn2lF5OP2J7z", // Enter the Key ID generated from the Dashboard
                amount:order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                currency:order.currency, // Currency
                name: "Genimagin", //your business name
                description: "Test Transaction",
                image: logo,
                order_id: order.id, 
                handler: async function (response) {
                    console.log(response)
                  const body = {
                    ...response,
                    receipt_id:order.receipt_id,
                  };
                  console.log(body);
                  try{
                        const transactionValidity= await axiosPrivate.post('/validate-payment',body)
                        console.log(transactionValidity)
                        // if(transactionValidity.status==200){
                        //     const currentCreditsBalance= localStorage.getItem('credit_balance')

                        //     localStorage.setItem("credit_balance",Number(transactionValidity.data.credits_received)+Number(currentCreditsBalance))
                        //     setRefreshCreditBalance(!refreshCreditBalance)
                        //     setPurchaseSuccess(true);
                        // }

                        console.log("Transaction validity response:", transactionValidity);
                        if (transactionValidity.data.status === 200) {

                            const newBalance = transactionValidity.data.credits_received;
                            localStorage.setItem("credit_balance", JSON.stringify(newBalance));
                            setRefreshCreditBalance(!refreshCreditBalance); 
                            setPurchaseSuccess(true);
                        }       
                    
                    }  
                    catch(error){
                        console.error(error)
                    }
                    finally{
                        setCredits(0)
                    }
                },
                prefill: {
                  //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
                  name: user.username, //your customer's name
                  email: user.email,
                //   contact: "9999999999", //Provide the customer's phone number for better conversion rates
                },
                notes: {
                    messsage:order.message||" "
                },
                theme: {
                  color: "#000000",
                },
              };

              var rzp1=new window.Razorpay(options);
              
              rzp1.open();
              e.preventDefault();

              rzp1.on("payment.failed", async function (response) {
                try{
                    console.log(1)
                    const result = await axiosPrivate.post('/falied-payment',response)
                }catch(err){
                    console.error(err)
                }finally{
                    setCredits(0)
                }
              });
        }
        catch(err){
            console.error(err)
        }
    }
  return (
    <div className='mt-5'>
        <div className='container'>
            {
                loading&&
                <h5>Loading...</h5>
            }
            <div className='text-center mb-4'>
                <Link to={'/u/top-up'} className='h-50 w-50'>top up</Link>
                <h3>Purchase Credits</h3>
            </div>
            {
                error &&
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            }
            {
                success &&
                <div className="alert alert-success" role="alert">
                    {successMessage}
                </div>
            }
            {
                purchaseSuccess&&
                <SuccessMessageContainer
                    message = "ThankYou, purchase successfully completed!" 
                    purchaseSuccess={purchaseSuccess}    
                />
            }

            <div className='row d-flex flex-wrap justify-content-start'>
                
                {CreditPurchaseOptions&&CreditPurchaseOptions.map((option, index) => (
                    
                    <div key={index} className='col-md-3 mb-4 '>
                        <CreditPurchaseCard data={option} buyCredits={buyCredits} loggedIn={loggedIn}/>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default CreditPurchasePage;