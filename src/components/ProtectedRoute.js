import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            const uid = localStorage.getItem('uid');
            const session_id = localStorage.getItem('session_id');

            if (!uid || !session_id) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_PROXY_SERVER}/publish/auth`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({uid: uid, session_id: session_id }),
                });

                const responseData = await response.json();

                if (response.ok) {
                    localStorage.setItem('uid', responseData.uid);
                    localStorage.setItem('session_id', responseData.session_id);

                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('uid');
                    localStorage.removeItem('session_id');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                localStorage.removeItem('uid');
                localStorage.removeItem('session_id');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    if (isLoading) {
        return <div className="has-text-centered my-6">
            <button className="button is-loading is-large is-text">Loading</button>
            <p className="mt-3">認証中...</p>
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
