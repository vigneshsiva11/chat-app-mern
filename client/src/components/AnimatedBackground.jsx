import React from "react";

const AnimatedBackground = ({ children }) => {
    return (
        <div
            className="w-full min-h-screen relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #2d1b69 0%, #4a1d8f 25%, #5b21b6 50%, #6d28d9 75%, #7c3aed 100%)',
                backgroundSize: '400% 400%',
                animation: 'gradientFlow 15s ease infinite'
            }}
        >
            {/* Decorative Stars */}
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full" style={{ animation: 'floatStar 3s ease-in-out infinite' }}></div>
            <div className="absolute top-32 right-32 w-1 h-1 bg-white rounded-full" style={{ animation: 'floatStar 4s ease-in-out infinite 0.5s' }}></div>
            <div className="absolute bottom-40 left-40 w-1 h-1 bg-white rounded-full" style={{ animation: 'floatStar 3.5s ease-in-out infinite 1s' }}></div>
            <div className="absolute top-1/3 right-20 w-1 h-1 bg-white rounded-full" style={{ animation: 'floatStar 4.5s ease-in-out infinite 1.5s' }}></div>
            <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-white rounded-full" style={{ animation: 'floatStar 3s ease-in-out infinite 0.8s' }}></div>
            <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-white rounded-full" style={{ animation: 'floatStar 5s ease-in-out infinite 2s' }}></div>

            {/* Content */}
            {children}
        </div>
    );
};

export default AnimatedBackground;
