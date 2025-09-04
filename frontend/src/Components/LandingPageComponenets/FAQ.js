import React from 'react'

function FAQ() {

    const faq = [
        {
            heading: "How many images can I generate?",
            body: "As a guest user, you can generate up to 10 free images per day. If you log in, this limit increases to 20 free images daily. Need even more? You can purchase additional credits to continue generating images without limits.",
        },
        {
            heading: "How much does the AI Image Generator cost?",
            body: "Our basic features are free, but if you need more images beyond the daily limit, you can buy credits or subscribe to a premium plan. Check our pricing section for more details on the best plan for your needs.You can contact our support team at 1-800-555-1234 or email us at support@example.com",
        },
        {
            heading: "Why do I get different images when using the same prompt?",
            body: "AI models interpret prompts uniquely due to variations in algorithms, data training, and processing techniques. Even with the same prompt, you may get different results each time, allowing for creative flexibility and exploration.",
        },
        {
            heading: "How do I write good prompts?",
            body: "For the best results, use clear and descriptive prompts. Specify details such as the subject, style, lighting, and colors you prefer. Need help? Check out our prompt-writing guide for expert tips and examples."
        },
        {
            heading: "Why use an AI Image Generator?",
            body: "AI-generated images offer a fast and efficient way to create stunning visuals without the need for professional design skills. Whether you need artwork, concept designs, or social media content, AI helps bring your ideas to life instantly."
        },
        {
            heading: "Can I use the AI Image Generator on both desktop and mobile?",
            body: "Yes! Our AI Image Generator is available through our website, which is fully responsive and works seamlessly on all devices, including desktops, tablets, and mobile phones. You can access it anytime without needing to download an app."
        }
    ]

  return (
    <div className='faq-sec container mt-md-5 py-md-4 pt-5'>
        <div className='faq-container'>
            <h1 className='faq-heading text-center mb-4 h-2'>Frequently asked questions</h1>
            <div className='accordion mb-4' id='faqAccordion'>  
                {
                    faq.map((faqOption, index) => (
                        <div key={index} className='accordion-item'>
                            <h2 className='accordion-header' id={`h${index}`}>
                            <button className='accordion-button collapsed p-topic' type='button' data-bs-toggle='collapse' data-bs-target={`#b${index}`} aria-expanded='false' aria-controls={`b${index}`}>
                                {faqOption.heading}
                            </button>
                            </h2>
                            <div id={`b${index}`} className='accordion-collapse collapse' aria-labelledby={`h${index}`} data-bs-parent='#faqAccordion'>
                            <div className='accordion-body p-primary'>
                                {faqOption.body}
                            </div>
                            </div>
                        </div>
                    ))
                }    
            </div>
            <p className='contact-us'>If you need further information, <span><a href="mailto:silambarasang318@gmail.com" className="ms-1 text-decoration-none">please contact us</a></span></p>
        </div>
    </div>
  )
}

export default FAQ;