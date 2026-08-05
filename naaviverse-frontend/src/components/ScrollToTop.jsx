import React, {Fragment, useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";

export default function ScrollToTop() {
    const [isVisible,
        setIsVisible] = useState(false);
    const location = useLocation();

    // Re-initialize AOS on every route change so all data-aos elements become visible
    useEffect(() => {
        window.scrollTo(0, 0);
        // Short delay lets React finish rendering all components before AOS scans the DOM
        setTimeout(() => {
            AOS.init({
                duration: 1200,
                once: false,
                disable: false,
            });
            AOS.refreshHard();
        }, 300);
    }, [location.pathname]);

    // Top: 0 takes us all the way back to the top of the page Behavior: smooth
    // keeps it smooth!
    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    useEffect(() => {
        // Button is displayed after scrolling for 500 pixels
        const toggleVisibility = () => {
            if (window.pageYOffset > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <Fragment>
            {isVisible && (
                <button className="scroll-top" onClick={scrollToTop}>
                    <i className="bi bi-arrow-up-short"></i>
                </button>
            )}
        </Fragment>
    );
}