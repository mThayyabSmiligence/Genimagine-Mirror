import React from 'react'
import '../../Css/Footer.css'
import { Link } from 'react-router-dom';

function Footer() {
  return (
        <div className='footer-sec container-fluid '>
            <div className='row'>
                <div className='col-12 text-center'>
                    <div className='agree-links pt-2 d-flex justify-content-center gap-2'> 
                        <Link to={'/terms-and-conditions'} className='terms-and-condition-link link'>Terms and conditions</Link>
                        <span>&</span>
                        <Link to={'/privacy-policy'} className='privacy policy-link link'>Privacy Policy</Link>
                    </div>
                    <p className='m-0 py-2'>© 2025 Genimagine. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Footer;