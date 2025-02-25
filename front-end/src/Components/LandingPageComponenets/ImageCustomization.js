import React from 'react'
import img1 from '../../images/1.png'
import img2 from '../../images/2.png'
import img3 from '../../images/3.png'

function ImageCustomization() {

    const customizationOptions = [
        {
            id: 1,
            img: img1,
            title: "Multiple AI Models",
            desc: "Choose from a variety of AI models tailored for your needs—whether it’s high-detail rendering or rapid generation, we’ve got you covered."
        },
        {
            id: 2,
            img: img2,
            title: "Aspect Ratio Flexibility",
            desc: "Pick the perfect aspect ratio for your vision—landscape, portrait, or square—without the hassle of manual adjustments."
        },
        {
            id: 3,
            img: img3,
            title: "Diverse Artistic Styles",
            desc: "From hyper-realistic to stylized art, easily select the perfect style with built-in presets—no need for lengthy prompts!"
        }
    ];
  return (
        <div className="container text-center">
            <h1 className="customization-heading">Customize Your Image Generation</h1>
            <div className="row justify-content-center">
                {customizationOptions.map((option) => (
                    <div key={option.id} className="col-12 col-md-4 mb-4 d-flex justify-content-center">
                        <div className="customization-card">
                            <div className="customization-img-container mb-3">
                                <img className="customization-img" src={option.img} alt={option.title} />    
                            </div>
                            <h3 className="customization-title text-start">{option.title}</h3>
                            <p className="customization-desc ">{option.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
  )
}

export default ImageCustomization;