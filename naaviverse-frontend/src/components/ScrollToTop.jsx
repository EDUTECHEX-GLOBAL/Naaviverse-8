import React, {Fragment, useEffect, useRef, useState} from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";

// Inner-page routes that use URL params for section scrolling.
// ScrollToTop should NOT reset scroll position when navigating within these.
const SECTION_ROUTES = ['/about', '/technology', '/impact', '/team'];

function getBaseRoute(pathname) {
    // Returns the first segment of the path, e.g. '/about/naaviverse' → '/about'
    const parts = pathname.split('/').filter(Boolean);
    return parts.length > 0 ? `/${parts[0]}` : '/';
}

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const prevBaseRoute = useRef(getBaseRoute(location.pathname));

    // Re-initialize AOS on every route change so all data-aos elements become visible.
    // Skip the scroll-to-top reset when navigating within the same inner-page section route
    // (e.g. /about/what-is-naavi → /about/naaviverse), so the page's own scroll-to-section
    // logic can take over without conflict.
    useEffect(() => {
        const currentBase = getBaseRoute(location.pathname);
        const isSameSectionRoute =
            SECTION_ROUTES.includes(currentBase) &&
            prevBaseRoute.current === currentBase;

        if (!isSameSectionRoute) {
            // Full page change — reset scroll to top
            window.scrollTo(0, 0);
        }

        prevBaseRoute.current = currentBase;

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

    // Top: 0 takes us all the way back to the top of the page. Behavior: smooth keeps it smooth!
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