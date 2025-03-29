import React, { useEffect } from 'react'
import '../../Css/Policies.css'

function PrivacyPolicy() {
  const privacyPolicy = {
    
    'Data Collection': [
        {
            userType: "Guest Users",
            details: [
                "No personal data is collected from guest users.",
                "Temporary data related to image generation is stored only for the duration of the session."
            ]
        },
        {
            userType: "Registered Users",
            details: [
                "When registering, we collect basic information such as name, email address, and password.",
                "Additional data related to credit purchases and generated images is stored in our database to enhance user experience.",
                "Basic payment details may be stored in case of payment failures or if users request billing information."
            ]
        }
    ],
    
    'Data Usage' :[ {
        details: [
            "Data collected is used to provide and improve our services, process transactions, and offer support.",
            "Generated images are stored in our database for registered users, subject to storage limits.",
            "We do not sell or share personal data with third parties for marketing purposes."
        ]
    }],
    
    'Data Storage Security':[ {
      details: [
        "Guest user-generated images are not stored after session termination.",
        "Registered users may access their generated images, subject to storage limits.",
        "Basic payment details are securely stored to manage payment-related issues.",
        "We implement reasonable security measures to protect your data, but no system is entirely secure."
      ],
    }],
    
    'Third Party Services': [{
        details: [
          "Payments are processed through third-party gateways (e.g., Razorpay), and we do not store complete payment details.",
          "External services used for hosting and AI processing may handle data according to their own policies."
        ]
    }],
    
    'User Rights': [{
      details: [
        "Registered users can access, update, or delete their personal data upon request."
      ]
    }],
    
    'Policy Updates': [{
      details: [
       "We reserve the right to update this Privacy Policy at any time without prior notice.",
        "Continued use of the platform after changes implies acceptance of the updated policy."
      ]
    }],
    
    'Acknowledgement': [{
      details: [
        "By using our platform, you acknowledge that you have read, understood, and agreed to this Privacy Policy."
      ]
    }]
};
useEffect(() => {
    // Scroll to the top of the page when the component mounts or loading changes
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className='container privacy-policy-container '>
        <h1 className='policy-heading h-1 m-0 text-center'>Privacy Policy</h1>
      <div className='policy-content text-start'>
        <p className='mt-5'>Welcome to our Image Generation AI platform. Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your data. By accessing or using our services, you agree to the collection and use of information in accordance with this policy.</p>
        {
          Object.keys(privacyPolicy).map((policySection, hindex) => {
            return (
              <div key={hindex} className='policy-section mb-4'>
                <h3 className='poliicy-heading h-3'>{hindex+1}. {policySection}</h3>
                <ul className='policy-section-list'>
                  {
                    privacyPolicy[policySection].map((policy, shindex) => {
                      return (
                        <li key={shindex} className='policy-list list mt-3'>
                          {policy.userType &&                  
                           <h4 className='policy-sub-heading h-4'>{hindex+1}.{shindex+1}. {policy.userType}</h4>
                          }
                          <ul className='policy-detail-list'>
                            {
                              policy.details.map((detail, index) => {
                                return (
                                  <li className='policy-detail ' key={index}>{detail}</li>
                                )
                              })
                            }
                          </ul>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default PrivacyPolicy