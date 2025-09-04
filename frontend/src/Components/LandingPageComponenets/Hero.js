import React from 'react'
import '../../Css/LandingPage.css'
import heroLogo from '../../images/Hero.jpg'
import { Link } from 'react-router-dom'
import ImageSlider from '../CommonComponents/ImageSlider';
import SI1 from '../../images/hero-img-1.png'
import SI2 from '../../images/hero-img-2.png'
import SI3 from '../../images/hero-img-3.png'
import SI4 from '../../images/hero-img-4.png'
import SI5 from '../../images/hero-img-5.png'


function Hero() {

    const images = [
        {
            img: SI1,
            alt: 'Hero Image 1'
        },
        {
            img: SI2,
            alt: 'Hero Image 2'
        },
        {
            img: SI3,
            alt: 'Hero Image 3'
        },
        {
            img: SI4,
            alt: 'Hero Image 4'
        },
        {
            img: SI5,
            alt: 'Hero Image 5'
        }
    ]

    var settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        arrows:false,
      };
  return (
    <div className='container-fluid hero-outer-sec'>
        <div className='row hero-sec'>
            <div className='hero-left-column col-12 col-md-6 d-flex flex-column justify-content-center align-items-center'>
                <div className='hero-lft-container d-flex flex-column justify-content-center align-items-center text-start'>
                    <h1 className='hero-sec-heading w-100 h-1'>AI Image <span>Generation</span></h1>
                    <p className='mb-4 p-primary'>we are here to generate a quality images for your desired spells.
                    Dream it up, then add it to your design. Watch your words and phrases transform into beautiful images with the best AI image generators available at your fingertips. Stand out with an image perfect for your project.
                    </p>
                    <Link to="/image-generation" className='link hero-sec-link br-5 text-center'>Generate</Link>
                </div>

            </div>
            <div className='hero-right-column col-12 col-md-6'>
                <div className='hero-ryt-container d-flex flex-column justify-content-center align-items-center'>
                    <ImageSlider settings={settings} imageData={images}></ImageSlider>
                    
                </div>
            </div>
        </div>
    </div>
  ) 
}   

export default Hero;