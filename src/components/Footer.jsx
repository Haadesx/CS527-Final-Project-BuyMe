import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="logo" style={{ marginBottom: '1rem' }}><span>Buy</span>Me</div>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            The world's most trusted marketplace for premium and exclusive items.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>&copy; 2025 BuyMe Inc.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Marketplace</h4>
                        <ul>
                            <li><Link to="/trending">Trending</Link></li>
                            <li><Link to="/new-arrivals">New Arrivals</Link></li>
                            <li><Link to="/auctions-ending">Auctions Ending</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/guidelines">Community Guidelines</Link></li>
                            <li><Link to="/safety">Safety Center</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/cookies">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
