import React from 'react'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

function SuccessMessageContainer({message, purchaseSuccess}) {
  return (
    <div
    className={`modal fade ${purchaseSuccess ? "show d-block" : "d-none"}`}
    tabIndex="-1"
    role="dialog"
    >
      <div className="modal-backdrop fade show bgblur-container"></div>
      <div className="modal-dialog modal-dialog-centered popup-container" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <div className='d-flex justify-content-center gap-1'>
                <CheckCircleRoundedIcon fontSize='large' className='success-icon'/>
                <h5 className='h-3'>Success</h5>
            </div>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessMessageContainer