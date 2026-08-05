import React from 'react'
import { Icon } from '@iconify/react';
import Div from "../../views/inner-pages/contact/Div";

export default function SocialWidget() {
  return (
    <Div className="contact-socials">
      <span className="cs-center social-icon" aria-label="X (Twitter)"><Icon icon="fa6-brands:x-twitter" /></span>
      <a
        href="https://www.linkedin.com/company/naavi-network/"
        target="_blank"
        rel="noopener noreferrer"
        className="cs-center social-icon"
        aria-label="LinkedIn"
      >
        <Icon icon="fa6-brands:linkedin-in" />
      </a>
    </Div>
  )
}