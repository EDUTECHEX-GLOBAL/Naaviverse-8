import axios from 'axios';
import * as jose from 'jose';
import { predefinedToast } from './toast';
import AWS from 'aws-sdk';

const secret = 'uyrw7826^&(896GYUFWE&*#GBjkbuaf'; // secret not to be disclosed anywhere.
const emailDev = 'pavithran@inr.group'; // email of the developer.

function renameFile(originalFile, newName) {
  return new File([originalFile], newName, {
    type: originalFile.type,
    lastModified: originalFile.lastModified,
  });
}

const signJwt = async (fileName, emailDev, secret) => {
  try {
    const jwts = await new jose.SignJWT({ name: fileName, email: emailDev })
      .setProtectedHeader({ alg: 'HS512' })
      .setIssuer('gxjwtenchs512')
      .setExpirationTime('10m')
      .sign(new TextEncoder().encode(secret));
    return jwts;
  } catch (error) {
    console.log(error, 'kjbedkjwebdw');
  }
};




export const uploadImageFunc = async (e, setImage, setLoading) => {
  setLoading(true);

  const file = e.target.files[0];
  if (!file) {
    setLoading(false);
    return;
  }

  const timestamp = new Date().getTime();
  const fileName = `${timestamp}-${file.name}`; // Ensure unique file names

  try {
    // Step 1: Fetch presigned URL from backend
    const response = await fetch('/api/get-presigned-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName, // Use the generated unique file name
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      throw new Error(`❌ Failed to get presigned URL: ${response.statusText}`);
    }

    const data = await response.json();
    const presignedUrl = data.presignedUrl;

    if (!presignedUrl) {
      throw new Error('❌ Presigned URL not received from server');
    }

    // Step 2: Upload the file to S3 using the presigned URL
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`❌ Failed to upload file: ${uploadResponse.statusText}`);
    }

    console.log('✅ File uploaded successfully');

    // Step 3: Generate the file URL (saved at the root of the bucket)
    const fileUrl = `https://naaviprofileuploads.s3.amazonaws.com/${fileName}`;
    
    // Step 4: Update the image state with the uploaded file URL
    setImage(fileUrl);

    return fileUrl;
  } catch (error) {
    console.error('❌ Error uploading file:', error);
  } finally {
    setLoading(false);
  }
};

