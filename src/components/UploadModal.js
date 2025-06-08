import {serverTimestamp, doc, setDoc} from "firebase/firestore";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {useState} from "react";
import {db} from "../firebase";
import './UploadModal.css';

const storage = getStorage();
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024;

const UploadModal = ({isActive, onClose, onUpload, uid}) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [sizeError, setSizeError] = useState(false);

    const handleUpload = async () => {
        if (files.length === 0 || !uid) return;
        setUploading(true);

        try {
            for (const file of files) {
                const timestamp = new Date().toISOString().replace('T', '-').replace(/\./g, '-').replace('Z', '');
                const filePath = `documents/${uid}/${timestamp}_${file.name}`;
                const fileRef = ref(storage, filePath);
                await uploadBytes(fileRef, file);

                const docRef = doc(db, "documents", `${uid}_${timestamp}_${file.name}`);
                await setDoc(docRef, {
                    uid,
                    filename: file.name,
                    path: filePath,
                    size: file.size,
                    uploaded_at: serverTimestamp()
                });
            }

            onUpload();
            setFiles([]);
            onClose();
        } catch (error) {
            console.error("アップロード失敗:", error);
        }
        setUploading(false);
    };

    if (!isActive) return null;

    return (
        <div className="modal is-active upload-modal">
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">ファイルアップロード</p>
                    <button className="delete" aria-label="close" onClick={onClose}></button>
                </header>
                <section className="modal-card-body">
                    <div className="file-area">
                        <label className="file-label">
                            <input
                                className="file-input"
                                type="file"
                                multiple
                                onChange={(e) => {
                                    const selectedFiles = Array.from(e.target.files);
                                    const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);

                                    if (totalSize >= MAX_TOTAL_SIZE) {
                                        setSizeError(true);
                                        setFiles([]);
                                    } else {
                                        setSizeError(false);
                                        setFiles(selectedFiles);
                                    }
                                }}
                            />
                            <span className="file-cta">
                                <span className="file-icon">
                                    📁
                                </span>
                                <span className="file-label">
                                    複数ファイルを選択...
                                </span>
                            </span>
                        </label>
                    </div>
                    {sizeError && (
                        <div className="notification is-danger mt-3">
                            <p>ファイルの合計サイズが1GBを超えています。より小さいサイズのファイルを選択してください。</p>
                        </div>
                    )}
                    {files.length > 0 && (
                        <div className="selected-files">
                            <p className="selected-files-count">
                                {files.length}ファイルが選択されました
                                (合計: {(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2)} MB)
                            </p>
                            {files.map((file, index) => (
                                <div key={index} className="selected-file">
                                    <span className="file-icon">📄</span>
                                    <span className="selected-file-name">{file.name}</span>
                                    <span className="selected-file-size">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                <footer className="modal-card-foot">
                    <button
                        className={`button is-success ${uploading ? 'is-loading' : ''}`}
                        onClick={handleUpload}
                        disabled={uploading}
                    >
                        アップロード
                    </button>
                    <button className="button" onClick={onClose}>キャンセル</button>
                </footer>
            </div>
        </div>
    );
};

export default UploadModal;
