import React from 'react';
import { Icon } from '@iconify/react';

export default function ContactInfoWidget({ withIcon, title }) {
  return (
    <>
      {title && <h2 className="widget-title">{title}</h2>}
      <ul className="contact-widget contact-style1 no-margin-padding">
        {/* <li>
          {withIcon ? <span className="accent-color"><Icon icon="material-symbols:add-call-rounded" /></span> : ''}
          +454 7800 112
        </li> */}
        <li>
          {withIcon ? <span className="accent-color"><Icon icon="mdi:envelope" /></span> : ''}
          info@naavinetwork.ai
        </li>
        {/* <li>
          {withIcon ? <span className="accent-color"><Icon icon="mdi:map-marker" /></span> : ''}
          50 Wall Street Suite, 44150 <br />Ohio, United States
        </li> */}
      </ul>
    </>
  );
}
