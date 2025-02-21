import React from 'react'

function ExplorePopUp({ image, onClose }) {
  return (
    <div className="explore-popup-overlay" onClick={onClose}>
      <div className="explore-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <img src={image.image_url} alt={image.caption} className="popup-image" />
        <div className="image-details">
          <h3>{image.caption}</h3>
          <p>Created by: {image.user_name}</p>
          {/* Add more details as needed */}
        </div>
      </div>
    </div>
  )
}

export default ExplorePopUp