import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import 'bulma/css/bulma.min.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_PROXY_SERVER}/publish/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message);
            }

            const { content } = responseData;

            if (content && content.uid && content.session_id) {
                localStorage.setItem('uid', content.uid);
                localStorage.setItem('session_id', content.session_id);
                console.log('Registration successful');
            }

            setSuccessMessage('Registration successful! You can now log in.');
        } catch (err) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="hero is-fullheight">
            <div className="hero-body">
                <div className="container">
                    <div className="columns is-centered">
                        <div className="column is-one-third">
                            <div className="box">
                                <h1 className="title has-text-centered">Sign Up</h1>

                                {error && (
                                    <div className="notification is-danger">
                                        {error}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="notification is-success">
                                        <button className="delete" onClick={() => setSuccessMessage('')}></button>
                                        {successMessage}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="field">
                                        <label className="label has-text-centered">Email</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                type="email"
                                                placeholder="e.g. alex@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <span className="icon is-small is-left">
                                                <FontAwesomeIcon icon={faEnvelope}/>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label className="label has-text-centered">Password</label>
                                        <div className="control has-icons-left">
                                            <input
                                                className="input"
                                                type="password"
                                                placeholder="********"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <span className="icon is-small is-left">
                                                <FontAwesomeIcon icon={faLock}/>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="field">
                                        <div className="control">
                                            <button
                                                className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                                                type="submit"
                                                disabled={loading}
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="has-text-centered mt-4">
                                    <button
                                        className="button is-text"
                                        onClick={() => navigate('/login')}
                                    >
                                        ログインはこちら
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Signup;
