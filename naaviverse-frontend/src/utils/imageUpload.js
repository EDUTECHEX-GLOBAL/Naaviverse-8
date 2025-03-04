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
    console.error("No file selected");
    setLoading(false);
    return;
  }

  // Validate file type (Only allow images)
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    console.error("Invalid file type. Please upload an image (JPEG, PNG, JPG, WebP).");
    setLoading(false);
    return;
  }

  // Validate file size (Max: 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    console.error("File size exceeds 5MB. Please upload a smaller image.");
    setLoading(false);
    return;
  }

  try {
    // Step 1: Request a Signed URL from Backend
    const response = await axios.post("/api/upload-profile-pic", {
      fileName: file.name,
      fileType: file.type,
    });

    if (!response.data.uploadUrl) {
      console.error("Error fetching signed URL");
      setLoading(false);
      return;
    }

    const { uploadUrl, fileUrl } = response.data;

    // Step 2: Upload the File to S3 using the Signed URL
    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
    });

    console.log("File uploaded successfully:", fileUrl);

    // Step 3: Store the uploaded image URL
    setImage(fileUrl);
    setLoading(false);
    return fileUrl;
  } catch (error) {
    console.error(" Error during upload:", error);
    setLoading(false);
    return null;
  }
};
