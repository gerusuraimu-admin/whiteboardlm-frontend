import React, {useState, useEffect, useCallback} from 'react';
import {getStorage, ref, listAll, getDownloadURL, deleteObject} from "firebase/storage";
import {auth} from '../firebase';
import UploadModal from './UploadModal';
import Navbar from './Navbar';
import './CommonStyle.css'
import './DocumentManager.css'

const storage = getStorage();

const DocumentManager = () => {
    const [files, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [embedLoading, setEmbedLoading] = useState(false);

    const uid = auth.currentUser?.uid;

    const fetchFiles = useCallback(async () => {
        if (!uid) return;
        setLoading(true);
        const userFolderRef = ref(storage, `documents/${uid}`);
        try {
            const res = await listAll(userFolderRef);
            const fileData = await Promise.all(res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                return {name: itemRef.name, url, ref: itemRef};
            }));
            setFiles(fileData);
        } catch (error) {
            console.error("ファイル取得エラー:", error);
        }
        setLoading(false);
    }, [uid]);

    const handleDelete = async (file) => {
        try {
            await deleteObject(file.ref);
            await fetchFiles();
        } catch (error) {
            console.error("削除失敗:", error);
        }
    };

    const handleSelectFile = (fileRef) => {
        setSelectedFiles(prev => {
            if (prev.some(ref => ref.fullPath === fileRef.fullPath)) {
                return prev.filter(ref => ref.fullPath !== fileRef.fullPath);
            } else {
                return [...prev, fileRef];
            }
        });
    };

    const handleSelectAll = () => {
        if (files.length === 0) return;

        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map(file => file.ref));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFiles.length === 0 || !uid) return;

        try {
            await Promise.all(selectedFiles.map(async (fileRef) => {
                await deleteObject(fileRef);
            }));

            setSelectedFiles([]);
            await fetchFiles();
        } catch (error) {
            console.error("一括削除失敗:", error);
        }
    };

    const handleEmbed = async () => {
        setEmbedLoading(true);
        try {
            const uid = localStorage.getItem('uid');
            const session_id = localStorage.getItem('session_id');

            if (uid && session_id) {
                const response = await fetch(`${process.env.REACT_APP_PROXY_SERVER}/publish/embed`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({uid, session_id}),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    console.error("Embed request failed:", responseData);
                    return;
                }

                const { content } = responseData;

                if (content && content.uid && content.session_id) {
                    localStorage.setItem('uid', content.uid);
                    localStorage.setItem('session_id', content.session_id);

                    console.log('Embed request sent successfully');
                }
            }
        } catch (error) {
            console.error("Embed失敗:", error);
        } finally {
            setEmbedLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    return (
        <div className="base">
            <Navbar/>
            <div className="container mt-5">
                <h2 className="title is-4">ファイル管理</h2>
                <div className="level mb-3">
                    <div className="level-left">
                        <div className="level-item">
                            <div className="buttons">
                                <button className="button is-primary" onClick={() => setShowModal(true)}>
                                    ファイルをアップロード
                                </button>
                                <button
                                    className="button is-info"
                                    onClick={handleSelectAll}
                                    disabled={files.length === 0}
                                >
                                    全選択
                                </button>
                                <button
                                    className="button is-danger"
                                    onClick={handleBulkDelete}
                                    disabled={selectedFiles.length === 0}
                                >
                                    一括削除 ({selectedFiles.length})
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="level-right">
                        <div className="level-item">
                            <button
                                className={`button is-success ${embedLoading ? 'is-loading' : ''}`}
                                onClick={handleEmbed}
                                disabled={embedLoading}
                            >
                                Embed
                            </button>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <p>読み込み中...</p>
                ) : (
                    <div className="table-container scrollable-table-container">
                        <table className="table is-fullwidth is-striped is-hoverable">
                            <thead>
                            <tr>
                                <th style={{width: '75px', textAlign: 'center'}}>選択</th>
                                <th style={{textAlign: 'center'}}>アップロード日</th>
                                <th style={{textAlign: 'center'}}>ファイル名</th>
                                <th style={{width: '100px', textAlign: 'center'}}>操作</th>
                            </tr>
                            </thead>
                            <tbody>
                            {files.map((file, index) => {
                                const parts = file.name.split('_');
                                const uploadDate = parts[0].replace(/-/g, '/');
                                const actualFilename = parts.slice(1).join('_');

                                const isSelected = selectedFiles.some(ref => ref.fullPath === file.ref.fullPath);

                                return (
                                    <tr key={index} className={isSelected ? "is-selected" : ""}>
                                        <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                            <label className="checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectFile(file.ref)}
                                                />
                                            </label>
                                        </td>
                                        <td style={{verticalAlign: 'middle'}}>
                                            {uploadDate}
                                        </td>
                                        <td style={{verticalAlign: 'middle', wordBreak: 'break-all'}}>
                                            <a href={file.url} target="_blank" rel="noreferrer">{actualFilename}</a>
                                        </td>
                                        <td style={{textAlign: 'center', verticalAlign: 'middle'}}>
                                            <button
                                                className="button is-small is-danger"
                                                onClick={() => handleDelete(file)}
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                <UploadModal
                    isActive={showModal}
                    onClose={() => setShowModal(false)}
                    onUpload={fetchFiles}
                    uid={uid}
                />
            </div>
        </div>
    );
};

export default DocumentManager;
