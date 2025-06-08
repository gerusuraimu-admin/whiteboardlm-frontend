import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import DocumentManager from './components/DocumentManager';
import ProtectedRoute from './components/ProtectedRoute';
import TokenManager from './components/TokenManager';
import Signup from "./components/Signup";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>

                <Route path="/" element={<ProtectedRoute><DocumentManager/></ProtectedRoute>}/>
                <Route path="/manage" element={<ProtectedRoute><TokenManager></TokenManager></ProtectedRoute>}/>
            </Routes>
        </Router>
    );
}

export default App;
