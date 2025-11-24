const uploadSingleFile = async(req, res, next) => {
    try{
        if(!req.file){
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileInfo = buildFileRespons(req.file);

        return res.status(200).json({
            message: 'File uploaded successfully',
            file: fileInfo,
        });
    } 
    catch(error){
         console.log("nothing")
    }
};

module.exports = uploadSingleFile