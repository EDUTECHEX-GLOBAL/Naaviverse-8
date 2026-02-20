import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import SearchModal from '../../components/search-modal/SearchModal';
import ThemeMainMenu from './ThemeMainMenu';
import logo from '../../logos/naavi_final_logo2.png';

const TopNavOne = () => {

    const [navbar, setNavbar] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    }

    const closeModal = () => {
        setIsOpen(false);
    }

    const toggleMenu = () => {
        if (window.scrollY >= 68) {
            setNavbar(true)
        } else {
            setNavbar(false)
        }
    }

    // ✅ Correct way to handle scroll event
    useEffect(() => {
        window.addEventListener('scroll', toggleMenu);
        return () => {
            window.removeEventListener('scroll', toggleMenu);
        };
    }, []);

    return (
        <Fragment>
            <SearchModal isOpen={modalIsOpen} onClick={closeModal} bgColor="" />

            <header className={navbar 
                ? "theme-main-menu sticky-menu theme-menu-one fixed" 
                : "theme-main-menu sticky-menu theme-menu-one"}>

               <div className="inner-content container">

                    <div className="d-flex align-items-center justify-content-between">

                        {/* LOGO */}
                        <div className="logo order-lg-0">
                            <Link to="/" className="d-block">
                                <img src={logo} alt="Naavi Logo" width={130}/>
                            </Link>
                        </div>

                        {/* RIGHT WIDGET (FIXED) */}
                        <div className="right-widget d-flex align-items-center order-lg-3">
                            <button
                                className="menu-search-btn tran3s"
                                type="button"
                                onClick={openModal}>
                                <i className="bi bi-search"/>
                            </button>

                            <Link to="/contact" className="req-demo-btn tran3s d-none d-lg-block">
                                Request a Demo
                            </Link>
                        </div>

                        {/* NAVIGATION */}
                        <nav className="navbar navbar-expand-lg order-lg-2">
                            <div className="collapse navbar-collapse" id="navbarNav">
                                <ThemeMainMenu />

                                <div className="mobile-content d-block d-lg-none">
                                    <div className="d-flex flex-column align-items-center justify-content-center mt-70">
                                        <Link to="/contact" className="req-demo-btn tran3s">
                                            Request a Demo
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </nav>

                    </div>
                </div>
            </header>
        </Fragment>
    )
}

export default TopNavOne
