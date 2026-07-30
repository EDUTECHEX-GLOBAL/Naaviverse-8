// import React, { Fragment } from 'react';

// const VisionContentTwo = [
//     {
//         title: 'Our History',
//         desc: `Naaviverse began with a simple goal — turning complex workflows into smart, seamless digital experiences.`,
//         fade: 'fade-up',
//         dataDelay: '',
//         icon: '📜'
//     },
//     {
//         title: 'Our Mission',
//         desc: `To automate processes, simplify operations, and empower smarter decisions through intelligent technology.`,
//         fade: 'fade-up',
//         dataDelay: '100',
//         icon: '🎯'
//     },
//     {
//         title: 'Our Vision',
//         desc: `To build a future where systems work effortlessly, enabling faster growth and continuous innovation.`,
//         fade: 'fade-up',
//         dataDelay: '200',
//         icon: '🔮'
//     }
// ];

// const FancyFeatureTwentyThree = () => {
//     // Inline CSS
//     const styles = `
//         .vision-section {
//             position: relative;
//             overflow: hidden;
//         }
        
//         .vision-gradient-bg {
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             height: 300px;
//             background: linear-gradient(135deg, 
//                 rgba(137, 207, 240, 0.1) 0%, 
//                 rgba(152, 251, 152, 0.15) 50%, 
//                 rgba(255, 218, 185, 0.1) 100%);
//             z-index: -1;
//             opacity: 0.6;
//         }
        
//         .vision-card {
//             background: rgba(255, 255, 255, 0.95);
//             backdrop-filter: blur(10px);
//             border-radius: 24px;
//             padding: 2.5rem 2rem;
//             transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
//             position: relative;
//             overflow: hidden;
//             border: 1px solid rgba(255, 255, 255, 0.3);
//             box-shadow: 
//                 0 8px 32px rgba(0, 0, 0, 0.05),
//                 inset 0 0 0 1px rgba(255, 255, 255, 0.8);
//             height: 100%;
//             min-height: 320px;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             text-align: center;
//         }
        
//         .vision-card::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: linear-gradient(135deg, 
//                 rgba(255, 255, 255, 0.1) 0%,
//                 rgba(255, 255, 255, 0.05) 50%,
//                 rgba(255, 255, 255, 0.1) 100%);
//             z-index: 0;
//             opacity: 0;
//             transition: opacity 0.6s ease;
//         }
        
//         .vision-card::after {
//             content: '';
//             position: absolute;
//             top: -2px;
//             left: -2px;
//             right: -2px;
//             bottom: -2px;
//             background: linear-gradient(45deg, 
//                 transparent 30%,
//                 rgba(255, 255, 255, 0.6) 50%,
//                 transparent 70%);
//             border-radius: 26px;
//             z-index: -1;
//             opacity: 0;
//             transition: opacity 0.5s ease;
//         }
        
//         .vision-card:hover {
//             transform: translateY(-12px) scale(1.02);
//             box-shadow: 
//                 0 25px 50px rgba(0, 0, 0, 0.1),
//                 0 0 60px var(--card-glow, rgba(137, 207, 240, 0.2));
//         }
        
//         .vision-card:hover::before {
//             opacity: 1;
//         }
        
//         .vision-card:hover::after {
//             opacity: 1;
//             animation: visionShimmer 3s ease-in-out infinite;
//         }
        
//         .icon-container {
//             width: 90px;
//             height: 90px;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin-bottom: 1.5rem;
//             position: relative;
//             z-index: 1;
//             font-size: 2.5rem;
//             transition: all 0.5s ease;
//             box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
//         }
        
//         .vision-card:hover .icon-container {
//             transform: scale(1.15) rotateY(360deg);
//             animation: iconFloat 2s ease-in-out infinite;
//         }
        
//         .vision-card:nth-child(1) {
//             --card-glow: rgba(137, 207, 240, 0.3);
//             --card-border: rgba(137, 207, 240, 0.4);
//         }
        
//         .vision-card:nth-child(2) {
//             --card-glow: rgba(152, 251, 152, 0.3);
//             --card-border: rgba(152, 251, 152, 0.4);
//         }
        
//         .vision-card:nth-child(3) {
//             --card-glow: rgba(255, 218, 185, 0.3);
//             --card-border: rgba(255, 218, 185, 0.4);
//         }
        
//         .vision-card:nth-child(1) .icon-container {
//             background: linear-gradient(135deg, #e6f7ff 0%, #d4f1f9 100%);
//             border: 2px solid rgba(137, 207, 240, 0.3);
//         }
        
//         .vision-card:nth-child(2) .icon-container {
//             background: linear-gradient(135deg, #f0fff4 0%, #e6f7e9 100%);
//             border: 2px solid rgba(152, 251, 152, 0.3);
//         }
        
//         .vision-card:nth-child(3) .icon-container {
//             background: linear-gradient(135deg, #fff9f0 0%, #fff4e6 100%);
//             border: 2px solid rgba(255, 218, 185, 0.3);
//         }
        
//         .vision-title {
//             font-size: 1.6rem;
//             font-weight: 700;
//             margin-bottom: 1rem;
//             color: #1a365d;
//             position: relative;
//             z-index: 1;
//             transition: color 0.3s ease;
//         }
        
//         .vision-card:hover .vision-title {
//             color: #0d2438;
//         }
        
//         .vision-title::after {
//             content: '';
//             position: absolute;
//             bottom: -8px;
//             left: 50%;
//             transform: translateX(-50%);
//             width: 60px;
//             height: 3px;
//             border-radius: 2px;
//             transition: width 0.4s ease;
//         }
        
//         .vision-card:nth-child(1) .vision-title::after {
//             background: linear-gradient(90deg, #4da6ff, #1a8cff);
//         }
        
//         .vision-card:nth-child(2) .vision-title::after {
//             background: linear-gradient(90deg, #4cd964, #2ecc71);
//         }
        
//         .vision-card:nth-child(3) .vision-title::after {
//             background: linear-gradient(90deg, #ffb347, #ff9500);
//         }
        
//         .vision-card:hover .vision-title::after {
//             width: 100px;
//         }
        
//         .vision-desc {
//             color: #4a5568;
//             line-height: 1.8;
//             font-size: 1.05rem;
//             position: relative;
//             z-index: 1;
//             flex-grow: 1;
//             opacity: 0.9;
//             transition: opacity 0.3s ease;
//         }
        
//         .vision-card:hover .vision-desc {
//             opacity: 1;
//             color: #2d3748;
//         }
        
//         .decoration-dot {
//             position: absolute;
//             width: 8px;
//             height: 8px;
//             border-radius: 50%;
//             background: var(--dot-color);
//             opacity: 0.6;
//             animation: dotFloat 4s ease-in-out infinite;
//         }
        
//         .vision-card:nth-child(1) .decoration-dot {
//             --dot-color: #89CFF0;
//         }
        
//         .vision-card:nth-child(2) .decoration-dot {
//             --dot-color: #98FB98;
//         }
        
//         .vision-card:nth-child(3) .decoration-dot {
//             --dot-color: #FFDAB9;
//         }
        
//         @keyframes visionShimmer {
//             0%, 100% {
//                 opacity: 0;
//             }
//             50% {
//                 opacity: 0.5;
//             }
//         }
        
//         @keyframes iconFloat {
//             0%, 100% {
//                 transform: translateY(0) scale(1.15);
//             }
//             50% {
//                 transform: translateY(-15px) scale(1.2);
//             }
//         }
        
//         @keyframes dotFloat {
//             0%, 100% {
//                 transform: translateY(0) translateX(0);
//             }
//             25% {
//                 transform: translateY(-20px) translateX(10px);
//             }
//             50% {
//                 transform: translateY(0) translateX(20px);
//             }
//             75% {
//                 transform: translateY(20px) translateX(10px);
//             }
//         }
        
//         /* Responsive styles */
//         @media (max-width: 991px) {
//             .vision-card {
//                 padding: 2rem 1.5rem;
//                 min-height: 280px;
//             }
            
//             .icon-container {
//                 width: 80px;
//                 height: 80px;
//                 font-size: 2.2rem;
//             }
            
//             .vision-title {
//                 font-size: 1.5rem;
//             }
//         }
        
//         @media (max-width: 767px) {
//             .vision-card {
//                 padding: 1.75rem 1.25rem;
//                 min-height: 260px;
//             }
            
//             .icon-container {
//                 width: 70px;
//                 height: 70px;
//                 font-size: 2rem;
//                 margin-bottom: 1.25rem;
//             }
            
//             .vision-title {
//                 font-size: 1.4rem;
//             }
            
//             .vision-desc {
//                 font-size: 1rem;
//                 line-height: 1.7;
//             }
//         }
        
//         @media (max-width: 575px) {
//             .vision-card {
//                 padding: 1.5rem;
//                 min-height: 240px;
//             }
            
//             .icon-container {
//                 width: 65px;
//                 height: 65px;
//                 font-size: 1.8rem;
//             }
            
//             .vision-title {
//                 font-size: 1.3rem;
//             }
//         }
        
//         /* Entrance animations */
//         .vision-card[data-aos="fade-up"] {
//             transform: translateY(50px);
//             opacity: 0;
//         }
        
//         .vision-card.aos-animate {
//             transform: translateY(0);
//             opacity: 1;
//             transition: transform 0.8s ease, opacity 0.8s ease;
//         }
//     `;

//     // Generate random positions for floating dots
//     const generateDots = () => {
//         const dots = [];
//         for (let i = 0; i < 6; i++) {
//             dots.push({
//                 id: i,
//                 left: `${10 + Math.random() * 80}%`,
//                 top: `${10 + Math.random() * 80}%`,
//                 delay: `${i * 0.5}s`
//             });
//         }
//         return dots;
//     };

//     return (
//         <Fragment>
//             <style>{styles}</style>
            
//            <div id="vision-mission-section" className="vision-section position-relative py-5">

//                 {/* Background gradient */}
//                 <div className="vision-gradient-bg"></div>
                
//                 <div className="row gx-xxl-5 justify-content-center">
//                     {VisionContentTwo.map((val, i) => {
//                         const dots = generateDots();
//                         return (
//                             <div
//                                 key={i}
//                                 className="col-lg-4 col-md-6 d-flex mb-4"
//                                 data-aos={val.fade}
//                                 data-aos-delay={val.dataDelay}
//                             >
//                                 <div className="vision-card">
//                                     {/* Floating decoration dots */}
//                                     {dots.map(dot => (
//                                         <div 
//                                             key={dot.id}
//                                             className="decoration-dot"
//                                             style={{
//                                                 left: dot.left,
//                                                 top: dot.top,
//                                                 animationDelay: dot.delay
//                                             }}
//                                         />
//                                     ))}
                                    
//                                     {/* Icon */}
//                                     <div className="icon-container">
//                                         {val.icon}
//                                     </div>
                                    
//                                     {/* Content */}
//                                     <h3 className="vision-title">{val.title}</h3>
//                                     <p className="vision-desc">{val.desc}</p>
                                    
//                                     {/* Subtle bottom accent */}
//                                     <div className="position-absolute bottom-0 start-0 w-100">
//                                         <div 
//                                             className="mx-auto" 
//                                             style={{
//                                                 width: '80%',
//                                                 height: '1px',
//                                                 background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
//                                             }}
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
                
//                 {/* Section decorative elements */}
//                 <div 
//                     className="position-absolute d-none d-lg-block" 
//                     style={{
//                         top: '50%',
//                         left: '10%',
//                         width: '40px',
//                         height: '40px',
//                         borderRadius: '50%',
//                         background: 'radial-gradient(circle, rgba(137,207,240,0.2) 0%, transparent 70%)',
//                         animation: 'dotFloat 6s ease-in-out infinite'
//                     }}
//                 />
//                 <div 
//                     className="position-absolute d-none d-lg-block" 
//                     style={{
//                         top: '30%',
//                         right: '15%',
//                         width: '30px',
//                         height: '30px',
//                         borderRadius: '50%',
//                         background: 'radial-gradient(circle, rgba(152,251,152,0.2) 0%, transparent 70%)',
//                         animation: 'dotFloat 8s ease-in-out infinite',
//                         animationDelay: '1s'
//                     }}
//                 />
//             </div>
//         </Fragment>
//     );
// };

// export default FancyFeatureTwentyThree;