import axios from 'axios';
import * as jose from 'jose';
import { predefinedToast } from './toast';
import AWS from 'aws-sdk';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
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
  const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;

  try {
    console.log('Requesting presigned URL from backend...');
    
    // ✅ Use the correct endpoint: /api/upload/get-presigned-url
    const response = await fetch(`${BASE_URL}/api/upload/get-presigned-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        fileType: file.type,
      }),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`❌ Failed to get presigned URL: ${response.status}`);
    }

    const data = await response.json();
    console.log('Presigned URL response:', data);
    
    const presignedUrl = data.presignedUrl;

    if (!presignedUrl) {
      throw new Error('❌ Presigned URL not received from server');
    }

    // Upload to S3
    console.log('Uploading to S3...');
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`❌ Failed to upload file to S3`);
    }

    console.log('✅ File uploaded successfully');
    
    // Get the final URL
    const fileUrl = data.fileUrl || `https://thenaaviversebucket.s3.amazonaws.com/${fileName}`;
    console.log('File accessible at:', fileUrl);
    
    setImage(fileUrl);
    return fileUrl;
    
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    
    // Fallback to base64 if S3 upload fails
    console.log('Trying base64 fallback...');
    try {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      
      console.log('Using base64 image');
      setImage(base64Image);
      return base64Image;
    } catch (base64Error) {
      console.error('Base64 fallback also failed:', base64Error);
      return null;
    }
  } finally {
    setLoading(false);
  }
};