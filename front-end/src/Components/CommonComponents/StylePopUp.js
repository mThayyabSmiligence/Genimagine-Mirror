import React from 'react'
import '../../Css/StylePopUp.css'
import Masonry from "react-masonry-css";
import styleImage1 from '../../images/style/textured-oil-painting.png'
import styleImage2 from '../../images/style/chalk-and-charcoal.png'
import styleImage3 from '../../images/style/Chinese-Ink-Painting.png'
import styleImage4 from '../../images/style/Realism.png'
import styleImage5 from '../../images/style/3D-Render.png'
import styleImage6 from '../../images/style/Ink&Wash.png'
import styleImage7 from '../../images/style/bright-and-exaggerated-cartoon-world.png'
import styleImage8 from '../../images/style/Anime.png'
import styleImage9 from '../../images/style/Black&White.png';
import styleImage10 from '../../images/style/Bokeh.png';
import styleImage11 from '../../images/style/Cinematic.png';
import styleImage12 from '../../images/style/Comic-Book.png';
import styleImage13 from '../../images/style/Film-Noir.png';
import styleImage14 from '../../images/style/Indian-Miniature.png';
import styleImage15 from '../../images/style/Japanese-Ukiyo-e.png';
import styleImage16 from '../../images/style/Neon-Glow.png';
import styleImage17 from '../../images/style/Pixel-Art.png';
import styleImage18 from '../../images/style/Steampunk.png';
import styleImage19 from '../../images/style/Baroque-portrait.png';
import styleImage20 from '../../images/style/cyberpunk-setting.png';
import styleImage21 from '../../images/style/delicate-watercolor-painting.png';
import styleImage22 from '../../images/style/dreamlike-and-abstract-composition.png';
import styleImage23 from '../../images/style/dynamic-graffiti-artwork.png';
import styleImage24 from '../../images/style/gothic-horror-setting.png';
import styleImage25 from '../../images/style/high-dynamic-range-photography.png';
import styleImage26 from '../../images/style/monochrome-sketch.png';
import styleImage27 from '../../images/style/moody-gothic-atmosphere.png';
import styleImage28 from '../../images/style/mythical-world.png';
import styleImage29 from '../../images/style/pencil-sketch-style.png';
import styleImage30 from '../../images/style/playful-cartoon-style.png';
import styleImage31 from '../../images/style/pop-art-style.png';
import styleImage32 from '../../images/style/richly-detailed-Baroque-style.png';
import styleImage33 from '../../images/style/soft-watercolor-style.png';
import styleImage34 from '../../images/style/surreal-landscape.png';
import styleImage35 from '../../images/style/80s-inspired-vaporwave-style.png';
import styleImage36 from '../../images/style/thick-oil-painting-style.png';
import styleImage37 from '../../images/style/ultra-realistic-HDR-style.png';
import styleImage38 from '../../images/style/urban-street-art-style.png';
import styleImage39 from '../../images/style/vaporwave-aesthetic.png';
import styleImage40 from '../../images/style/vibrant-pop-art-illustration.png';

function StylePopUp({tempTrackStyle, setTempTrackStyle, setSeeMore}) {
    const styleList = [
        { id: 1, style_name: "Textured Oil Painting", style_image: styleImage1 },
        { id: 2, style_name: "Chalk and Charcoal", style_image: styleImage2 },
        { id: 3, style_name: "Chinese Ink Painting", style_image: styleImage3 },
        { id: 4, style_name: "Realism", style_image: styleImage4 },
        { id: 5, style_name: "3D Render", style_image: styleImage5 },
        { id: 6, style_name: "Ink & Wash", style_image: styleImage6 },
        { id: 7, style_name: "Bright and Exaggerated Cartoon World", style_image: styleImage7 },
        { id: 8, style_name: "Anime", style_image: styleImage8 },
        { id: 9, style_name: "Black & White", style_image: styleImage9 },
        { id: 10, style_name: "Bokeh", style_image: styleImage10 },
        { id: 11, style_name: "Cinematic", style_image: styleImage11 },
        { id: 12, style_name: "Comic Book", style_image: styleImage12 },
        { id: 13, style_name: "Film Noir", style_image: styleImage13 },
        { id: 14, style_name: "Indian Miniature", style_image: styleImage14 },
        { id: 15, style_name: "Japanese Ukiyo-e", style_image: styleImage15 },
        { id: 16, style_name: "Neon Glow", style_image: styleImage16 },
        { id: 17, style_name: "Pixel Art", style_image: styleImage17 },
        { id: 18, style_name: "Steampunk", style_image: styleImage18 },
        { id: 19, style_name: "Baroque Portrait", style_image: styleImage19 },
        { id: 20, style_name: "Cyberpunk Setting", style_image: styleImage20 },
        { id: 21, style_name: "Delicate Watercolor Painting", style_image: styleImage21 },
        { id: 22, style_name: "Dreamlike and Abstract Composition", style_image: styleImage22 },
        { id: 23, style_name: "Dynamic Graffiti Artwork", style_image: styleImage23 },
        { id: 24, style_name: "Gothic Horror Setting", style_image: styleImage24 },
        { id: 25, style_name: "High Dynamic Range Photography", style_image: styleImage25 },
        { id: 26, style_name: "Monochrome Sketch", style_image: styleImage26 },
        { id: 27, style_name: "Moody Gothic Atmosphere", style_image: styleImage27 },
        { id: 28, style_name: "Mythical World", style_image: styleImage28 },
        { id: 29, style_name: "Pencil Sketch Style", style_image: styleImage29 },
        { id: 30, style_name: "Playful Cartoon Style", style_image: styleImage30 },
        { id: 31, style_name: "Pop Art Style", style_image: styleImage31 },
        { id: 32, style_name: "Richly Detailed Baroque Style", style_image: styleImage32 },
        { id: 33, style_name: "Soft Watercolor Style", style_image: styleImage33 },
        { id: 34, style_name: "Surreal Landscape", style_image: styleImage34 },
        { id: 35, style_name: "80s inspired vaporwave style", style_image: styleImage35 },
        { id: 36, style_name: "Thick Oil Painting Style", style_image: styleImage36 },
        { id: 37, style_name: "Ultra Realistic HDR Style", style_image: styleImage37 },
        { id: 38, style_name: "Urban Street Art Style", style_image: styleImage38 },
        { id: 39, style_name: "Vaporwave Aesthetic", style_image: styleImage39 },
        { id: 40, style_name: "Vibrant Pop Art Illustration", style_image: styleImage40 }
    ]

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
                    <div className={`style-card ${style.id==tempTrackStyle&&"active"}`} key={index}>
                      <img  src={style.style_image} onClick={() => handleStyleClick(style.id)} alt="style" />
                      <h3 onClick={() => handleStyleClick(style.id)} className='style-name-heading'>{style.style_name}</h3>
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