import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <h1 className="welcome-logo brand-font">VALORE</h1>
                <p className="welcome-tagline">Elevate Your Style</p>
                <button className="enter-btn" onClick={() => navigate('/home')}>
                    Enter Store
                </button>
            </div>
            <style>{`
                .welcome-container::before {
                    content: '';
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: float 20s linear infinite;
                }
                @keyframes float {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-50px, -50px); }
                }
            `}</style>
        </div>
    );
}
