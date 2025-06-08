import React, {useState, useEffect} from "react";
import {doc, setDoc} from "firebase/firestore";
import {auth, db} from "../firebase";
import Navbar from "../components/Navbar";
import './CommonStyle.css'
import postRequest from "../PostRequest"

const Toast = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className={`notification is-${type}`} style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            minWidth: '250px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)'
        }}>
            <button className="delete" onClick={onClose}></button>
            {message}
        </div>
    );
};

const TokenManager = () => {
    const [slackToken, setSlackToken] = useState("");
    const [appToken, setAppToken] = useState("");
    const [discordToken, setDiscordToken] = useState("");
    const [toast, setToast] = useState({
        message: '',
        type: 'info',
        isVisible: false
    });
    const user = auth.currentUser;

    const saveToken = async (botType, tokenData, resetFunctions) => {
        if (!user) return alert("未ログインです");
        await setDoc(doc(db, `tokens_${botType}`, user.uid), {
            email: user.email,
            ...tokenData,
            updatedAt: new Date()
        }, {merge: true});

        resetFunctions.forEach(resetFn => resetFn());

        alert(`${botType.charAt(0).toUpperCase() + botType.slice(1)}トークンを保存しました`);
    };

    const saveSlack = async () => {
        await saveToken('slack', 
            { slackToken, appToken }, 
            [() => setSlackToken(""), () => setAppToken("")]
        );
    };

    const saveDiscord = async () => {
        await saveToken('discord', 
            { discordToken }, 
            [() => setDiscordToken("")]
        );
    };

    const showToast = (message, type) => {
        setToast({
            message,
            type,
            isVisible: true
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const handleBotOperation = (e, botType, operation) => {
        e.preventDefault();
        if (!user) return alert("未ログインです");

        const payload = {
            uid: user.uid
        }

        const botTypeDisplay = botType.charAt(0).toUpperCase() + botType.slice(1);
        const operationDisplay = operation === 'run' ? '起動' : '停止';

        postRequest(
            `${process.env.REACT_APP_BOT_SERVICE_SERVER}/${botType}_bot/${operation}`,
            payload,
            (data) => {
                showToast(`${botTypeDisplay} Botの${operationDisplay}に成功しました`, 'success');
            },
            (error) => {
                showToast(`${botTypeDisplay} Botの${operationDisplay}に失敗しました`, 'danger');
            }
        )
    }

    const runSlackBot = (e) => handleBotOperation(e, 'slack', 'run');
    const stopSlackBot = (e) => handleBotOperation(e, 'slack', 'stop');
    const runDiscordBot = (e) => handleBotOperation(e, 'discord', 'run');
    const stopDiscordBot = (e) => handleBotOperation(e, 'discord', 'stop');

    return (
        <div className="base">
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
            <Navbar/>
            <div className="container">
                <h1 className="title">Bot / Token管理</h1>

                <div className="box">
                    <h2 className="subtitle">Slack</h2>
                    <div className="field">
                        <label className="label">Slack Bot Token</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="xoxb-..."
                            value={slackToken}
                            onChange={(e) => setSlackToken(e.target.value)}
                        />
                    </div>
                    <div className="field">
                        <label className="label">Slack App Token</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="xapp-..."
                            value={appToken}
                            onChange={(e) => setAppToken(e.target.value)}
                        />
                    </div>
                    <button className="button is-link" onClick={saveSlack} style={{marginRight: '10px'}}>保存</button>
                    <button className="button is-info" onClick={runSlackBot} style={{marginRight: '10px'}}>Run</button>
                    <button className="button is-danger" onClick={stopSlackBot}>Stop</button>
                </div>

                <div className="box">
                    <h2 className="subtitle">Discord</h2>
                    <div className="field">
                        <label className="label">Discord Bot Token</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="..."
                            value={discordToken}
                            onChange={(e) => setDiscordToken(e.target.value)}
                        />
                    </div>
                    <button className="button is-link" onClick={saveDiscord} style={{marginRight: '10px'}}>保存</button>
                    <button className="button is-info" onClick={runDiscordBot} style={{marginRight: '10px'}}>Run</button>
                    <button className="button is-danger" onClick={stopDiscordBot}>Stop</button>
                </div>
            </div>
        </div>
    );
};

export default TokenManager;
