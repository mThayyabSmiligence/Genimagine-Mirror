import React from 'react'
import '../../Css/LandingPage.css'
import heroLogo from '../../images/Hero.jpg'
import { Link } from 'react-router-dom'


function Hero() {
  return (
    <div className='container-fluid hero-outer-sec'>
        <div className='blur-hero-sec'></div>
        <div className='row hero-sec'>
            <div className='hero-left-column col-12 col-md-6  d-flex flex-column justify-content-center align-items-center'>
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
                    <img className='hero-img' src={heroLogo} alt=''></img>
                </div>
            </div>
        </div>
    </div>
  ) 
}   

export default Hero;