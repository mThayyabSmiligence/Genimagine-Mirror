    import React from 'react'
    import exploreImg from '../../images/Hero.jpg'

    function LaunchToExplore() {
    return (
    <div className='container launch-to-explore-section py-5'>
      <div className='row align-items-center'>
    
        <div className='col-12 col-md-6 text-center'>
          <img src={exploreImg} alt='Showcase of Published Images' className='img-fluid publish-image'/>
        </div>

        <div className='col-12 col-md-6 launch-to-explore-content text-start'>
          <h2 className='mb-3 h-2'><span className='header-highlight'>Publish</span> & <span className='header-highlight'>Share</span> Your Creations</h2>
          <p>
            After generating your image, follow these steps to **publish it and share it** with the world:
          </p>

          {/* Step-by-step guide */}
          <ul>
            <li className='p-primary'>
                Let your AI-generated images shine on the Explore page for everyone to admire.
            </li>
            <li className='p-primary'>
                Other users can view, like, and appreciate your creativity.
            </li>
            <li className='p-primary'>
                Contribute to a vibrant gallery of AI-generated art and discover amazing creations from fellow users.
            </li>
            <li className='p-primary'>
                publish the images you love, and unpublish anytime.
            </li>
            <li className='p-primary'>
                join a growing gallery of AI-powered creativity!
            </li>
          </ul>
        </div>
      
      </div>
    </div>
    )
    }

    export default LaunchToExplore