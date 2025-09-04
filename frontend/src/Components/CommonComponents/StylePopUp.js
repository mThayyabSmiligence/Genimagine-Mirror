import React, { useContext } from 'react'
import '../../Css/StylePopUp.css'
import Masonry from "react-masonry-css";
import AuthContext from '../../Context/AuthProvider';

function StylePopUp({tempTrackStyle, setTempTrackStyle, setSeeMore, styleList}) {

  const {loggedIn}= useContext(AuthContext)

    const handleStyleClick = (style) => {
        setTempTrackStyle(style)
        setSeeMore(false)
    }
  return (
    <div className="style-popup">
        <Masonry
            breakpointCols={{ default: 4,  600: 3, 300: 2 }} // Adjusts for responsive layouts
            className="platform-gallery-masonry"
            columnClassName="platform-gallery-column"
        >
            {styleList.length > 0 ? (
                
                styleList.map((style, index) =>(
                    <div className={`style-card mt-md-2 ${style.id==tempTrackStyle&&"active"} ${!loggedIn&&"unclickable"}`} key={index}>
                      <img  src={style.style_image} onClick={() => handleStyleClick(style.id)} alt="style" />
                      <h3 onClick={() => handleStyleClick(style.id)} className='style-name-heading mt-md-1'>{style.style_name}</h3>
                    </div>
                  )
                )
            ) : (
                <p className='text-center w-100'>No images available</p>
            )}
        </Masonry>
    </div>
  )
}

export default StylePopUp