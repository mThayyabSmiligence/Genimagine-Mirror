import React from 'react'
import '../../Css/Policies.css'

function TermsAndConditions() {

  const termsAndConditions = {
    'User Access and Image Generation Limits': [
        {
            userType: "Guest Users",
            details: [
                "Guests can generate up to 10 images per day free of charge.",
                "No account registration is required to generate images within this limit.",
                "Guest users cannot accumulate or purchase credit points."
            ]
        },
        {
            userType: "Registered Users",
            details: [
                "Logged-in users can generate up to 20 images per day free of charge.",
                "Registered users can purchase additional credit points for more image generations."
            ]
        }
    ],

    'Credit Points and Purchases': [
        {
            section: "Credit System",
            details: [
                "Users who wish to generate images beyond their daily free limit must purchase credit points.",
                "Credit points are required to use certain AI models, and the cost may vary depending on the selected model.",
                "Credit points are non-refundable and cannot be transferred between accounts."
            ]
        },
        {
            section: "Purchase Options",
            details: [
                "Users can choose from a default package with pre-defined credit points or a custom purchase option.",
                "Payments must be made through the provided payment gateway (e.g., Razorpay).",
                "Any fraudulent transactions will result in the suspension or termination of the account."
            ]
        }
    ],

    'Usage Restrictions': [
        {
            details: [
                "Users must not generate images that violate legal, ethical, or community guidelines.",
                "The platform reserves the right to limit or block access to users who engage in abuse, spamming, or any unauthorized activities.",
                "The generated images are for personal and non-commercial use unless explicitly allowed by the platform."
            ]
        }
    ],

    'Data and Privacy': [
        {
            details: [
                "Guest user-generated images are not stored after session termination.",
                "Registered users may have access to their generated images, but the platform does not guarantee long-term storage.",
                "All data is handled according to our Privacy Policy."
            ]
        }
    ],

    'Modifications and Termination': [
        {
            details: [
                "We reserve the right to update these Terms and Conditions at any time without prior notice.",
                "If a user violates these terms, we may terminate or restrict their access to the platform."
            ]
        }
    ],

    'Contact Information': [
        {
            details: [
                "For any questions or concerns about these Terms and Conditions, please contact us at [Your Contact Email]."
            ]
        }
    ],

    'Acknowledgement': [
        {
            details: [
                "By using our platform, you acknowledge that you have read, understood, and agreed to these Terms and Conditions."
            ]
        }
    ]
};

  return (
    <div className='container terms-and-conditions-container px-md-5'> 
        <h1 className='terms-heading h-1 m-0 text-center'>Terms and Conditions</h1>
      <div className='terms-content text-start'>
        <p className='mt-5 '>Welcome to our Image Generation AI platform. By accessing or using our services, you agree to comply with the following Terms and Conditions. Please read them carefully before using our platform.</p>
          {
              Object.keys(termsAndConditions).map((section, hindex) => {
                  return (
                      <div key={hindex} className='terms-section mb-4'>
                          <h3 className='terms-heading h-3'>{hindex + 1}. {section}</h3>
                          <ul className='terms-section-list'>
                              {
                                  termsAndConditions[section].map((policy, shindex) => {
                                      return (
                                          <li key={shindex} className='terms-list list mt-3'>
                                              {policy.userType &&
                                                  <h4 className='terms-sub-heading h-4'>{hindex + 1}.{shindex + 1}. {policy.userType || policy.section}</h4>
                                              }
                                              <ul className='terms-detail-list'>
                                                  {
                                                      policy.details.map((detail, index) => {
                                                          return (
                                                              <li className='terms-detail' key={index}>{detail}</li>
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

export default TermsAndConditions; 