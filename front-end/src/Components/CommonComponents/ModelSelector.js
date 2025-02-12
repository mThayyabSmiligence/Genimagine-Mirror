import React, { useRef, useEffect } from "react";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min"; // Import Bootstrap JS explicitly

function ModelSelector() {

  return (
    <div className="model-select button button-dark">
       <div className='accordion w-100'>
                            <div className='accordion-item'>
                                <h2 className="accordion-header">
                                    <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapsmodel" aria-expanded="true" aria-controls="collapsmodel">
                                    <span className=""></span>open model
                                    </button>
                                </h2>
                                <div id="collapsmodel" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                                    <div className="accordion-collapse d-flex flex-column align-items-center">
                                      <div className="accordion-body">
                                        <div className="">
                                          <h3>Model 1</h3>
                                        </div>
                                        <div className="">
                                          <h3>Model 2</h3>
                                        </div>
                                        <div className="">
                                          <h3>Model 3</h3>
                                        </div>
                                      </div>
                                    </div>
                                </div>
                            </div>
                        </div>
    </div>

//     <div>
   //    {/* Dropdown button with caret icon */}
//       <button className="button-wh dark-button-wh" onClick={openModal}>
//         Open Modal
        
//       </button>

//       <div className="modal fade" tabIndex={-1} ref={modalRef}>
//         <div className="modal-dialog">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">Modal Title</h5>
//               <button
//                 type="button"
//                 className="btn-close"
//                 data-bs-dismiss="modal"
//                 aria-label="Close"
//               ></button>
//             </div>
//             <div className="modal-body">
//               <p>Modal body text goes here.</p>
//             </div>
//             <div className="modal-footer">
//               <button
//                 type="button"
//                 className="btn btn-secondary"
//                 data-bs-dismiss="modal"
//               >
//                 Close
//               </button>
//               <button type="button" className="btn btn-primary">
//                 Select
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
  );
}

export default ModelSelector;
