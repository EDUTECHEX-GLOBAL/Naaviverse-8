import React from 'react'
import { Icon } from '@iconify/react';
import Div from "../../views/inner-pages/contact/Div";

export default function SocialWidget() {
  return (
    <Div className="contact-socials">
      <span className="cs-center social-icon"><Icon icon="fa6-brands:linkedin-in" /></span>
      <span className="cs-center social-icon"><Icon icon="fa6-brands:instagram" /></span>
      <span className="cs-center social-icon"><Icon icon="fa6-brands:facebook-f" /></span>
      <span className="cs-center social-icon"><Icon icon="fa6-brands:twitter" /></span>
    </Div>
  )
}