export default function Toast({ show, message }) {
    return (
        <div className={`toast ${show ? 'show' : ''}`}>
            <i className="fas fa-check-circle" style={{ color: '#4ade80' }}></i>
            <span>{message}</span>
        </div>
    );
}
