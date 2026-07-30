import React, { Fragment } from 'react';

const VisionContentTwo = [
    {
        title: 'Our History',
        desc: `Naaviverse began with a simple goal — turning complex workflows into smart, seamless digital experiences.`,
        fade: 'fade-up',
        dataDelay: '',
        icon: '📜'
    },
    {
        title: 'Our Mission',
        desc: `To automate processes, simplify operations, and empower smarter decisions through intelligent technology.`,
        fade: 'fade-up',
        dataDelay: '100',
        icon: '🎯'
    },
    {
        title: 'Our Vision',
        desc: `To build a future where systems work effortlessly, enabling faster growth and continuous innovation.`,
        fade: 'fade-up',
        dataDelay: '200',
        icon: '🔮'
    }
];

const FancyFeatureTwentyTwo = () => {

    const styles = `
        .vision-section {
            position: relative;
            overflow: hidden;
        }
        
        .vision-gradient-bg {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 300px;
            background: linear-gradient(135deg, 
                rgba(137, 207, 240, 0.1) 0%, 
                rgba(152, 251, 152, 0.15) 50%, 
                rgba(255, 218, 185, 0.1) 100%);
            z-index: -1;
            opacity: 0.6;
        }
        
        .vision-card {
            position: relative;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 2.5rem 2rem;
            transition: all 0.5s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
            height: 100%;
            text-align: center;
        }

        .icon-container {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-size: 2rem;
            background: #f5f5f5;
        }

       .vision-title {

    font-size: 20px;

    font-weight: 600;

    color: #0f172a;

    margin-bottom: 12px;

    letter-spacing: 0.2px;

}


.vision-desc {

    font-size: 14.5px;

    line-height: 1.6;

    color: #64748b;

    font-weight: 400;

    max-width: 240px;

    margin: 0 auto;

}
/* BLUE ANIMATED DOTS */
.vision-dot {

    position: absolute;

    width: 6px;

    height: 6px;

    border-radius: 50%;

    background: #2273E6;

    opacity: 0.7;

    animation: visionDotMove 5s linear infinite;

}


/* DOT ANIMATION */
@keyframes visionDotMove {

    0% {

        transform: translateX(0px) translateY(0px);

        opacity: 0.3;

    }

    50% {

        transform: translateX(18px) translateY(-8px);

        opacity: 1;

    }

    100% {

        transform: translateX(0px) translateY(0px);

        opacity: 0.3;

    }

}

    `;

    const generateDots = () => {
        const dots = [];
        for (let i = 0; i < 6; i++) {
            dots.push({
                id: i,
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                delay: `${i * 0.5}s`
            });
        }
        return dots;
    };

    return (
        <Fragment>

            <style>{styles}</style>

            <div id="vision-mission-section" className="vision-section position-relative py-5">

                <div className="vision-gradient-bg"></div>

                <div className="row gx-xxl-5 justify-content-center">

                    {VisionContentTwo.map((val, i) => {

                        const dots = generateDots();

                        return (

                            <div
                                key={i}
                                className="col-lg-4 col-md-6 d-flex mb-4"
                                data-aos={val.fade}
                                data-aos-delay={val.dataDelay}
                            >

                                <div className="vision-card">

                                    {dots.map(dot => (
    <div
        key={dot.id}
        className="vision-dot"
        style={{
            left: dot.left,
            top: dot.top,
            animationDelay: dot.delay
        }}
    />
))}

                                    <div className="icon-container">
                                        {val.icon}
                                    </div>

                                    <h3 className="vision-title">
                                        {val.title}
                                    </h3>

                                    <p className="vision-desc">
                                        {val.desc}
                                    </p>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        </Fragment>
    );
};

export default FancyFeatureTwentyTwo;
