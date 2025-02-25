import React from 'react'
import '../../Css/LandingPage.css'
import heroLogo from '../../images/Hero.jpg'

function HowToGenerate() {

  const stepsToGenerate = [
    {
      step: 1,
      title: 'Select your model, prompt and ratio',
      description: 'A short line or even a word will do. Then, just select the aspect ratio you need—don’t worry, you can change it later if necessary!'
    },
    {
      step: 2,
      title: 'Customize it',
      description: <>You're all set with the previous step. Now, you can select specific AI styles such as <span className='header-highlight'>Photo</span>, <span className='header-highlight'>Vintage</span>, and <span className='header-highlight'>Painting</span>. Additionally, you can use our presets for colors, framing, and lighting to refine your results..</>
    },
    {
      step: 3,
      title:  'Save, download, upscale, or keep creating',
      description: <>If you like one or several images, you can save them in your profile, download them, upscale them, or explore additional versions by using the new Reimagine tool. Everything is just a click away.</>
    }
  ]

  return (
    <div className='container-fluid row how-to-generate-sec d-flex align-items-center justify-content-center'>
        <h1 className='mb-5 mt-5'>HOW TO <span className='header-highlight'>GENERATE</span> IMAGE</h1>
        <div className='col-12 col-md-6'>
          {stepsToGenerate.map((steps) => (
            <div key={steps.step} className='steps-to-generate text-start'>
              <h2>{steps.step}. {steps.title}</h2>
              <p className='mb-4'>{steps.description}</p>
            </div>
          ))}
        </div>
        <div className='col-12 col-md-6 sample-generate-image'>  
            <img className='sample-image' src={heroLogo} alt=''></img>
        </div>
    </div>
  )
}

export default HowToGenerate