import React, { Fragment, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SearchModal from './SearchModal';
import Naavi from '../../images/logo/logo_01.png';
import './topnavfour.scss';

const TopNavFour = () => {
  const [navbar, setNavbar] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(!modalIsOpen);
  };

  const toggleMenu = () => {
    if (window.scrollY >= 68) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  window.addEventListener('scroll', toggleMenu);

  const handleSendMessage = () => {
    if (location.pathname === '/contact') {
      // If already on the contact page, scroll directly to the form section
      document.getElementById('contact-form-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on the contact page, navigate to the contact page with a query parameter
      navigate('/contact?scrollToForm=true');
    }
  };

  return (
    <Fragment>
      <SearchModal isOpen={modalIsOpen} onClick={closeModal} bgColor="bg-three" />
      <header className={navbar ? "theme-main-menu sticky-menu theme-menu-four fixed" : "theme-main-menu sticky-menu theme-menu-four"}>
        <div className="inner-content">
          <div className="d-flex align-items-center">
            <div className="">
              <Link to="/" className="d-block"><img src={Naavi} alt="" width={150} /></Link>
            </div>
            {/* <div className="right-widget d-flex align-items-center ms-auto order-lg-3">
              <button className="send-msg-btn tran3s d-none d-lg-block" onClick={handleSendMessage}>Send Message</button>
            </div>
            <nav className="navbar navbar-expand-lg order-lg-2">
              <div className="collapse navbar-collapse" id="navbarNav">
                <ThemeMainMenu />
                <div className="mobile-content d-block d-lg-none">
                  <div className="d-flex flex-column align-items-center justify-content-center mt-70">
                    <button className="send-msg-btn tran3s mb-10" onClick={handleSendMessage}>Send Message</button>
                  </div>
                </div>
              </div>
            </nav> */}
          </div>
          
        </div>
      </header>
    </Fragment>
  );
};

export default TopNavFour;
