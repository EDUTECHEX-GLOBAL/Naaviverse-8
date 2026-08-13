import React from 'react';
import { Link } from 'react-router-dom';
import Div from './Div';
import './pageheading.scss';

export default function PageHeading({ title, bgSrc, overlayImage, pageLinkText }) {
  return (
    <Div
      className="newstyle"
      style={{
        position: 'relative',
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay Image */}
      {overlayImage && (
        <img
          src={overlayImage}
          alt="Overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.3, // Adjust as needed
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      
        <Div className="pageheading-content">
  <div className="pageheading-title">{title}</div>
  <ol className="pageheading-breadcrumb">
    <li className="breadcrumb-item">
      <Link to="/">HOME</Link>
    </li>
    <li className="breadcrumb-item active">{pageLinkText}</li>
  </ol>
</Div>

      </Div>
  
  );
}
