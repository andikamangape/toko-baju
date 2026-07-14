import React, { useState, useRef, useEffect } from 'react';

const ParallaxSection = React.forwardRef(({ bgImage, title, text }, ref) => {
    const [offsetY, setOffsetY] = useState(0);
    const sectionRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (sectionRef.current) {
                const rect = sectionRef.current.getBoundingClientRect();
                const scrollPosition = window.innerHeight - rect.top;
                setOffsetY(scrollPosition * 0.15);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="parallax-section" ref={sectionRef}>
            <div
                className="parallax-bg"
                style={{
                    backgroundImage: `url(${bgImage})`,
                    transform: `translateY(${offsetY}px)`
                }}
            ></div>
            <div className="parallax-content" ref={ref}>
                <h2>{title}</h2>
                <p>{text}</p>
            </div>
        </div>
    );
});

export default ParallaxSection;
