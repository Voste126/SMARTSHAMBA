import { Navigate, Route } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

function ProtectedRoute({ children, ...rest }) {
    const [isAuthorized, setIsAuthorized] = useState(false);

    const refreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
        const response = await api.post('/auth/refresh-token', { refresh: refreshToken });
        if (response.status === 200) {
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
        } catch (e) {
        setIsAuthorized(false);
        }
    }, []);

    const auth = useCallback(async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
        setIsAuthorized(false);
        return;
        }
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
        await refreshToken();
        } else {
        setIsAuthorized(true);
        }
    }, [refreshToken]);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, [auth]);

    return (
        <Route {...rest} element={isAuthorized ? children : <Navigate to="/login" />} />
    );
    }

    ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    };

    export default ProtectedRoute;
