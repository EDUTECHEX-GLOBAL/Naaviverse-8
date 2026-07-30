import React, { Fragment } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonialContent = [
    {
        rating: 5,
        desc: "This platform helped me discover the right career path and shortlist the best colleges. Now I have a clear roadmap for my future."
    },
    {
        rating: 4.5,
        desc: "I was confused about what to study next, but the personalized suggestions made everything simple and easy to follow."
    },
    {
        rating: 5,
        desc: "After taking the subscription, I received one-to-one mentorship and expert guidance. It felt like having a personal career coach."
    },
    {
        rating: 4,
        desc: "The insights and resources helped me plan early and prepare better. It saved me time and reduced a lot of stress."
    }
];

const settings1 = {
    dots: true,
    infinite: true,
    speed: 500,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
        { breakpoint: 1024, settings: { slidesToShow: 3 } },
        { breakpoint: 767, settings: { slidesToShow: 2 } },
        { breakpoint: 575, settings: { slidesToShow: 1, centerMode: false } }
    ]
};

// ⭐ star renderer
const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    const empty = 5 - full - (half ? 1 : 0);

    return (
        <>
            {[...Array(full)].map((_, i) => (
                <i key={"f"+i} className="bi bi-star-fill" />
            ))}
            {half && <i className="bi bi-star-half" />}
            {[...Array(empty)].map((_, i) => (
                <i key={"e"+i} className="bi bi-star" />
            ))}
        </>
    );
};

const TestimonialOne = () => {
    return (
        <Fragment>
            <Slider className="feedback_slider_one" {...settings1}>
                {TestimonialContent.map((val, i) => (
                    <div key={i} className="item">
                        <div className="feedback-block-one margin-2">

                            {/* ⭐ Stars */}
                            <ul className="style-none d-flex rating mb-15">
                                {renderStars(val.rating)}
                            </ul>

                            {/* Feedback text */}
                            <p>{val.desc}</p>

                            {/* Rating text */}
                            <div className="mt-15 fw-bold">
                                {val.rating}/5 Rating
                            </div>

                        </div>
                    </div>
                ))}
            </Slider>
        </Fragment>
    )
}

export default TestimonialOne;
