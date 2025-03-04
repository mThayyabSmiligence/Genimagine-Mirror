    import React from "react";
    import Slider from "react-slick";

    export default function ImageSlider({settings, imageData}) {
    
    return (
        <Slider className="slick-slider" {...settings}>
            {imageData.map((image,index) => (
                 
              <img src={image.img} alt={image.alt} key={index}/>
        
            ))}
        
        </Slider>
    );
    }