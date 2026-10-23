import api from './api';

const login = async (username, password, twoFactorToken = null) => {
    const response = await api.post('/auth/login', { username, password, twoFactorToken });

    // If 2FA is required, return the response without storing token
    if (response.data.requires2FA) {
        return response.data;
    }

    // Normal login or successful 2FA login
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};
const register = async (name, email, password) => {
    const response = await api.post('/auth/register', {
        name,
        email,
        password
    });

    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
};
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const updateCurrentUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
};

// Profile management
const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
        updateCurrentUser(response.data.user);
    }
    return response.data;
};

const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/auth/profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    // Update user in localStorage with new profile picture URL
    const currentUser = getCurrentUser();
    if (currentUser && response.data.profilePictureUrl) {
        currentUser.profilePictureUrl = response.data.profilePictureUrl;
        updateCurrentUser(currentUser);
    }

    return response.data;
};

const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
    });
    return response.data;
};

// 2FA management
const enable2FA = async () => {
    const response = await api.post('/auth/enable-2fa');
    return response.data; // Returns { secret, qrCode, message }
};

const verify2FA = async (token) => {
    const response = await api.post('/auth/verify-2fa', { token });

    // Update user in localStorage to reflect 2FA is now enabled
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.twoFactorEnabled = true;
        updateCurrentUser(currentUser);
    }

    return response.data;
};

const disable2FA = async (password) => {
    const response = await api.post('/auth/disable-2fa', { password });

    // Update user in localStorage to reflect 2FA is now disabled
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.twoFactorEnabled = false;
        updateCurrentUser(currentUser);
    }

    return response.data;
};

export default {
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    enable2FA,
    verify2FA,
    disable2FA,
};
