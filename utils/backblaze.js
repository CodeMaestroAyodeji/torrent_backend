// utils/backblaze.js

const fs = require('fs');
const B2 = require('backblaze-b2');

const b2 = new B2({
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID, // Replace with your Application Key ID
    applicationKey: process.env.B2_APPLICATION_KEY,     // Replace with your Application Key
});

const uploadFileToB2 = async (filePath, fileName) => {
  try {
      await b2.authorize();

      const { data: uploadUrlData } = await b2.getUploadUrl({
          bucketId: process.env.B2_BUCKET_ID,
      });

      const fileData = fs.readFileSync(filePath);

      const response = await b2.uploadFile({
          uploadUrl: uploadUrlData.uploadUrl,
          uploadAuthToken: uploadUrlData.authorizationToken,
          fileName: fileName,
          data: fileData,
      });

      // Return only necessary fields
      return {
          fileName: response.data.fileName,
          fileId: response.data.fileId,
      };
  } catch (error) {
      console.error('Error uploading file to B2:', error);
      throw error;
  }
};



module.exports = { uploadFileToB2 };

