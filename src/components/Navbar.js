import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {useNavigate, Link} from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const uid = localStorage.getItem('uid');
            const session_id = localStorage.getItem('session_id');

            if (uid && session_id) {
                await fetch(`${process.env.REACT_APP_PROXY_SERVER}/publish/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({uid, session_id}),
                });
            }
        } catch (error) {
            console.error('Logout error');
        } finally {
            localStorage.removeItem('uid');
            localStorage.removeItem('session_id');
            navigate('/login');
        }
    };

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div id="navbarBasicExample" className="navbar-menu">
                <div className="navbar-start">
                    <Link to="/" className="navbar-item">Home</Link>
                    <Link to="/manage" className="navbar-item">Manage</Link>
                </div>

                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">
                            <button onClick={handleLogout} className="button is-danger">
                                <span className="icon"><FontAwesomeIcon icon={faSignOutAlt}/></span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
