import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import 'bulma/css/bulma.min.css';
import {auth} from '../firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelope, faLock} from '@fortawesome/free-solid-svg-icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_PROXY_SERVER}/publish/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
            });

            const responseData = await response.json();

            if (!response.ok) {
                return;
            }

            localStorage.setItem('uid', responseData.uid);
            localStorage.setItem('session_id', responseData.session_id);

            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log('Login error:', errorCode, errorMessage);

                    if (errorCode === 'auth/invalid-credential') {
                        setError('Invalid email or password. Please try again.');
                    } else if (errorCode === 'auth/user-not-found') {
                        setError('No account found with this email. Please check your email or sign up.');
                    } else if (errorCode === 'auth/too-many-requests') {
                        setError('Too many failed login attempts. Please try again later.');
                    } else {
                        setError('An error occurred during login. Please try again.');
                    }
                });

            console.log('Login successful');

            navigate('/');
        } catch (err) {
            setError('An error occurred during login');
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
                                <h1 className="title has-text-centered">Login</h1>

                                {error && (
                                    <div className="notification is-danger">
                                        {error}
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
                                                Login
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="has-text-centered mt-4">
                                    <button
                                        className="button is-text"
                                        onClick={() => navigate('/signup')}
                                    >
                                        サインアップはこちら
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

export default Login;
