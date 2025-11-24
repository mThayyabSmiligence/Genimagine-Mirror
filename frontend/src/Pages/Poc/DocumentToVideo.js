import React from 'react'
import DocumentUpload from '../../Components/PocComponent/DocumentUpload'

function DocumentToVideo() {
  return (
    <main className='mt-5 container-fluid document-to-text-page' id=''>
        <section>
            <div className="text-center my-4">
                <h2 className="h3 font-weight-bold text-dark">
                    Upload Document, Get AI Summary
                </h2>
                <p className="lead text-muted mx-auto" style={{ maxWidth: '500px' }}>
                    Upload any document (PDF, DOCX, TXT) and our AI will analyze it to generate 
                    a clear and structured summary highlighting key points and insights.
                </p>
                <DocumentUpload/>
            </div>
        </section>
    </main>

  )
}

export default DocumentToVideo