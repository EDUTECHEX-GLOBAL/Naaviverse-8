import React, { useContext } from 'react';
import { planBContext } from '../../../../context/PlanBContext';
import { VaultPageContext } from '../../../../context/VaultPageContext';
import { uploadImageFunc } from '../../../../utils/imageUpload';
import classNames from './vaultSidebarComponents.module.scss';
import dummyProfile from '../../../../static/images/dummyProfile.svg';
import uploading from '../../../../static/images/uploading.svg';
import axios from 'axios';

const TrackerImageAdd = () => {
  const {
    trackingImage,
    trackerDataLoading,
    setTrackingImageResponse,
    trackingImageResponse,
    trackerImageOpen,
    settrackerImageOpen,
    uploadedImageTracker,
    setuploadedImageTracker,
    uploadedDescTracker,
    setuploadedDescTracker,
    imagesBtnLoading,
    setimagesBtnLoading,
  } = useContext(VaultPageContext);

  const { planBAccountPicUploading } = useContext(planBContext);

  function uploadImage() {
    let obj = {
      file_key: uploadedImageTracker ? uploadedImageTracker : '',
      id: trackingImage,
      input: uploadedDescTracker ? uploadedDescTracker : '',
    };
    // console.log(obj, 'uploading obj');
    axios
      .post(`https://comms.globalxchange.io/coin/fiat/update_requests`, obj)
      .then((response) => {
        console.log(response?.data);
        settrackerImageOpen('images');
      })
      .catch((error) => {
        console.log(
          error.message,
          'Error while uploading tracker transaction image'
        );
      });
  }

  return (
    <div className={classNames.trackerImageAdd}>
      <div className={classNames.trackerImageAddHead}>
        <div>Images</div>
        <div onClick={() => settrackerImageOpen('')}>X</div>
      </div>
      {trackingImageResponse && trackerImageOpen == 'images' ? (
        <div
          className={classNames.trackerImageContainer}
          style={{
            visibility: imagesBtnLoading ? 'hidden' : '',
          }}
        >
          {trackingImageResponse?.length > 0 ? (
            trackingImageResponse?.map((eachItem) => {
              return (
                <div key={eachItem._id}>
                  <img src={eachItem?.file_key} alt="imagess" />
                </div>
              );
            })
          ) : (
            <>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </>
          )}
        </div>
      ) : (
        <div
          className={classNames.trackerUploadingContainer}
          style={{ visibility: imagesBtnLoading ? 'hidden' : '' }}
        >
          <div className={classNames.uploadingDiv}>
            <ImageUploadDiv
              heading="Upload transaction image..."
              setFunc={setuploadedImageTracker}
              funcValue={uploadedImageTracker}
            />
          </div>
          <input
            type="text"
            placeholder="Enter Note About Image..."
            className={classNames.inputDiv}
            onChange={(e) => setuploadedDescTracker(e.target.value)}
          />
        </div>
      )}
      <div
        className={classNames.uploadingBtn}
        onClick={() => {
          if (trackerImageOpen == 'images') {
            settrackerImageOpen('uploadDiv');
            setuploadedImageTracker('');
          } else {
            uploadImage();
          }
        }}
        style={{ pointerEvents: planBAccountPicUploading ? 'none' : '' }}
      >
        {trackerImageOpen == 'images' ? 'Upload New Image' : 'Confirm Upload'}
      </div>
    </div>
  );
};

export default TrackerImageAdd;

export const ImageUploadDiv = ({ heading, setFunc, funcValue }) => {
  const { planBAccountPicUploading, setplanBAccountPicUploading } =
    useContext(planBContext);
  return (
    <div
      className={classNames.imageUploadDiv}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <div className={classNames.heading} style={{ display: 'none' }}>
        {heading}
      </div>
      <div
        className={classNames.imageDiv}
        style={{ width: '100%', height: '100%' }}
      >
        {funcValue ? (
          <img
            src={funcValue ? funcValue : dummyProfile}
            alt="planBAccountPic"
            className={classNames.profileImg}
            htmlFor="profileUpdateImgPlanB"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          ''
        )}
        {planBAccountPicUploading ? (
          <div className={classNames.overlayDiv}>
            <img
              src={uploading}
              alt="uploading"
              className={classNames.uploadingimg}
            />
          </div>
        ) : (
          ''
        )}
      </div>
      <label
        htmlFor="profileUpdateImgPlanB"
        className={classNames.uploadFileDiv}
      >
        <input
          className={classNames.uploadNewPicPlanB}
          type="file"
          onChange={(e) => {
            uploadImageFunc(e, setFunc, setplanBAccountPicUploading);
          }}
          accept="image/*"
          id="profileUpdateImgPlanB"
          style={{ display: 'none' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: '700',
            fontSize: '1.5rem',
          }}
        >
          {funcValue
            ? ''
            : planBAccountPicUploading
            ? 'Uploading...'
            : 'Upload Picture'}
        </div>
      </label>
    </div>
  );
};
