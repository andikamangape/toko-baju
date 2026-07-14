import React, { useRef, useEffect } from 'react';
import ParallaxSection from './ParallaxSection.jsx';

export default function AboutPage() {
    const sectionRefs = useRef([]);

    useEffect(() => {
        const handleScroll = () => {
            sectionRefs.current.forEach(section => {
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight * 0.75 && rect.bottom > 0;

                    if (isVisible) {
                        section.classList.add('visible');
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const parallaxSections = [
        {
            bgImage: 'https://images.unsplash.com/photo-1441984904996-e20b31dfa80c?w=1600&h=900&fit=crop',
            title: 'Our Story Begins',
            text: 'Founded in 2015, VALORE emerged from a simple belief: exceptional quality should be accessible to everyone who appreciates timeless design.'
        },
        {
            bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop',
            title: 'Crafted with Purpose',
            text: 'Every piece in our collection is thoughtfully designed and meticulously crafted using premium materials sourced from sustainable suppliers worldwide.'
        },
        {
            bgImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop',
            title: 'Design Philosophy',
            text: 'We believe in creating pieces that transcend seasons—garments that become staples in your wardrobe, designed for longevity and versatility.'
        },
        {
            bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop',
            title: 'Join Our Journey',
            text: 'Thank you for being part of our story. Together, we are redefining what it means to dress with intention and live with purpose.'
        }
    ];

    return (
        <div>
            <div style={{
                height: '60vh',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white'
            }}>
                <div>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>
                        About VALORE
                    </h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Where Quality Meets Timeless Design</p>
                </div>
            </div>

            {parallaxSections.map((section, index) => (
                <ParallaxSection
                    key={index}
                    {...section}
                    ref={el => sectionRefs.current[index] = el}
                />
            ))}
        </div>
    );
}
