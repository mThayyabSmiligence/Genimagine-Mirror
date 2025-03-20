import React from 'react'
import libraryImg from '../../images/library.png'

function LaunchToLibrary() {
  return (
    <div className="launch-to-library container py-5 mt-5">
      <div className="row align-items-center">

        <div className="col-12 col-md-6 text-center text-md-start">
          <h2 className="mb-3 fw-bold h-2">📚 Launch to Library</h2>
          <p className="mb-4">
            Save your AI-generated images in your personal **Library** for easy access anytime.
            Organize your creations, keep track of your designs, and retrieve them whenever needed.
          </p>
          <ul className="list-unstyled">
            <li className='p-primary'>Store all your generated images securely</li>
            <li className='p-primary'>Access and manage your past creations</li>
            <li className='p-primary'>Retrieve, edit, and republish when needed</li>
          </ul>
          {/* <button className="go-to-library mt-3">Go to Library</button> */}
        </div>

        <div className="col-12 col-md-6 text-center">
          <img src={libraryImg} alt="Library Feature" className="img-fluid rounded shadow image-library"/>
        </div>
      </div>
    </div>
  )
}

export default LaunchToLibrary