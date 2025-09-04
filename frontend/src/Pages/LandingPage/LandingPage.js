import React from 'react'
import Navbar from '../../Components/LandingPageComponenets/Navbar';
import Hero from '../../Components/LandingPageComponenets/Hero';
import '../../Css/LandingPage.css'
import HowToGenerate from '../../Components/LandingPageComponenets/HowToGenerate';
import ImageCustomization from '../../Components/LandingPageComponenets/ImageCustomization';
import LaunchToExplore from '../../Components/LandingPageComponenets/LaunchToExplore';
import LaunchToLibrary from '../../Components/LandingPageComponenets/LaunchToLibrary';
import PlatformGallery from '../../Components/LandingPageComponenets/PlatformGallery';
import FAQ from '../../Components/LandingPageComponenets/FAQ';
import Footer from '../../Components/LandingPageComponenets/Footer';

function LandingPage() {
  return (
    <div className=''>
        <section className='hero-section'>
            <Hero/>
        </section>    
        <section className='image-customization-section'>
          <ImageCustomization/>
        </section>
        <section className='launch-to-explore'>
          <LaunchToExplore/>
        </section>
        <section className='launch-to-library'>
          <LaunchToLibrary/>
        </section>
        <section>
          <PlatformGallery/>
        </section>
        <section className='how-to-generate-section d-flex align-items-center justify-content-center'>
          <HowToGenerate/>
        </section>
        <section className='faq-section'>
          <FAQ/>
        </section>
        
    </div>
  )
}   

export default LandingPage;