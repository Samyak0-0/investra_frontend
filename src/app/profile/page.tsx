"use client"

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit,
    Save,
    X,
    Camera,
    TrendingUp,
    DollarSign,
    Target,
    BarChart3,
    Shield,
    Settings,
    Bell,
    Lock,
    Eye,
    EyeOff,
    AlertTriangle
} from 'lucide-react';

// Type definitions
interface UserData {
    name: string;
    email: string;
    phone: string;
    location: string;
    joinDate: string;
    bio: string;
    avatar: string;
    riskTolerance: string;
    investmentGoals: string;
    preferredSectors: string[];
}

interface NotificationPreferences {
    priceAlerts: boolean;
    portfolioUpdates: boolean;
    marketNews: boolean;
    riskWarnings: boolean;
}

interface InvestmentPrefs {
    riskTolerance: string;
    investmentHorizon: string;
    monthlyInvestment: number;
    portfolioValue: number;
    diversificationLevel: string;
    autoRebalancing: boolean;
    notificationPreferences: NotificationPreferences;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ShowPasswords {
    current: boolean;
    new: boolean;
    confirm: boolean;
}

type TabType = 'profile' | 'investment' | 'security' | 'notifications';

const Profile: React.FC = () => {
    const { data: session, status } = useSession();

    // User data state
    const [userData, setUserData] = useState<UserData>({
        name: '',
        email: '',
        phone: '+1-555-123-4567',
        location: 'New York, NY',
        joinDate: '2024-01-15',
        bio: 'Passionate investor with 5+ years of experience in equity markets and portfolio management.',
        avatar: '/default-avatar.jpg',
        riskTolerance: 'Moderate',
        investmentGoals: 'Long-term Growth',
        preferredSectors: ['Technology', 'Healthcare', 'Financial Services']
    });

    // Investment preferences state
    const [investmentPrefs, setInvestmentPrefs] = useState<InvestmentPrefs>({
        riskTolerance: 'Moderate',
        investmentHorizon: '5-10 years',
        monthlyInvestment: 2500,
        portfolioValue: 145000,
        diversificationLevel: 'High',
        autoRebalancing: true,
        notificationPreferences: {
            priceAlerts: true,
            portfolioUpdates: true,
            marketNews: false,
            riskWarnings: true
        }
    });

    // UI state
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setUserData(prevUserData => ({
                ...prevUserData,
                name: session.user?.name ?? '',
                email: session.user?.email ?? '',
                avatar: session.user?.image ?? prevUserData.avatar
            }));
        }
    }, [session, status]);

    // Form handlers
    const handleSaveProfile = (): void => {
        // API call to save profile data
        console.log('Saving profile:', userData);
        setIsEditing(false);
        // Add success notification here
    };

    const handleSavePreferences = (): void => {
        // API call to save investment preferences
        console.log('Saving preferences:', investmentPrefs);
        // Add success notification here
    };

    const handlePasswordChange = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        // API call to change password
        console.log('Changing password');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Add success notification here
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    setUserData({ ...userData, avatar: result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field: keyof UserData, value: string): void => {
        setUserData({ ...userData, [field]: value });
    };

    const handleInvestmentPrefsChange = (field: keyof InvestmentPrefs, value: string | number | boolean): void => {
        setInvestmentPrefs({ ...investmentPrefs, [field]: value });
    };

    const handleNotificationChange = (key: keyof NotificationPreferences, checked: boolean): void => {
        setInvestmentPrefs({
            ...investmentPrefs,
            notificationPreferences: {
                ...investmentPrefs.notificationPreferences,
                [key]: checked
            }
        });
    };

    const handlePasswordDataChange = (field: keyof PasswordData, value: string): void => {
        setPasswordData({ ...passwordData, [field]: value });
    };

    const togglePasswordVisibility = (field: keyof ShowPasswords): void => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Profile</h1>
                    <p className="text-gray-600">Manage your account settings and investment preferences</p>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#0cb9c1] to-blue-500 flex items-center justify-center overflow-hidden">
                                    {userData.avatar !== '/default-avatar.jpg' ? (
                                        <img
                                            src={userData.avatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-white" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-[#0cb9c1] rounded-full p-2 cursor-pointer hover:bg-[#0aa8af] transition-colors">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* User Info */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
                                <p className="text-gray-600">{userData.email}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{userData.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">$145K</div>
                                <div className="text-sm text-green-700">Portfolio Value</div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">+12.5%</div>
                                <div className="text-sm text-blue-700">YTD Return</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    {[
                        { id: 'profile' as TabType, label: 'Profile Information', icon: User },
                        { id: 'investment' as TabType, label: 'Investment Preferences', icon: TrendingUp },
                        { id: 'security' as TabType, label: 'Security Settings', icon: Shield },
                        { id: 'notifications' as TabType, label: 'Notifications', icon: Bell }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${activeTab === tab.id
                                ? 'bg-[#0cb9c1] text-white shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Profile Information Tab */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
                                <button
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-[#0cb9c1] text-white rounded-lg hover:bg-[#0aa8af] transition-colors"
                                >
                                    {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                    <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={userData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={userData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={userData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    value={userData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    disabled={!isEditing}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] disabled:bg-gray-50"
                                    placeholder="Tell us about your investment journey..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Investment Preferences Tab */}
                    {activeTab === 'investment' && (
                        <div className="space-y-6">
                            {/* Risk Profile */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Risk Profile & Goals</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                                        <select
                                            value={investmentPrefs.riskTolerance}
                                            onChange={(e) => handleInvestmentPrefsChange('riskTolerance', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1]"
                                        >
                                            <option value="Conservative">Conservative</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Aggressive">Aggressive</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Investment Horizon</label>
                                        <select
                                            value={investmentPrefs.investmentHorizon}
                                            onChange={(e) => handleInvestmentPrefsChange('investmentHorizon', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1]"
                                        >
                                            <option value="1-3 years">1-3 years</option>
                                            <option value="3-5 years">3-5 years</option>
                                            <option value="5-10 years">5-10 years</option>
                                            <option value="10+ years">10+ years</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Investment ($)</label>
                                        <input
                                            type="number"
                                            value={investmentPrefs.monthlyInvestment}
                                            onChange={(e) => handleInvestmentPrefsChange('monthlyInvestment', Number(e.target.value))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Diversification Level</label>
                                        <select
                                            value={investmentPrefs.diversificationLevel}
                                            onChange={(e) => handleInvestmentPrefsChange('diversificationLevel', e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1]"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-800">Auto-Rebalancing</h4>
                                            <p className="text-sm text-gray-600">Automatically rebalance your portfolio quarterly</p>
                                        </div>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={investmentPrefs.autoRebalancing}
                                                onChange={(e) => handleInvestmentPrefsChange('autoRebalancing', e.target.checked)}
                                                className="form-checkbox h-5 w-5 text-[#0cb9c1] rounded focus:ring-[#0cb9c1]"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSavePreferences}
                                    className="mt-6 px-6 py-2 bg-[#0cb9c1] text-white rounded-lg hover:bg-[#0aa8af] transition-colors"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Settings Tab */}
                    {activeTab === 'security' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h3>

                            {/* Change Password Section */}
                            <div className="border-b border-gray-200 pb-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-medium text-gray-800">Password</h4>
                                        <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="px-4 py-2 bg-[#0cb9c1] text-white rounded-lg hover:bg-[#0aa8af] transition-colors"
                                    >
                                        Change Password
                                    </button>
                                </div>

                                {showPasswordForm && (
                                    <form onSubmit={handlePasswordChange} className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => handlePasswordDataChange('currentPassword', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                >
                                                    {showPasswords.current ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => handlePasswordDataChange('newPassword', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                >
                                                    {showPasswords.new ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => handlePasswordDataChange('confirmPassword', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0cb9c1] pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-[#0cb9c1] text-white rounded-lg hover:bg-[#0aa8af] transition-colors"
                                            >
                                                Update Password
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordForm(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Two-Factor Authentication */}
                            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <div className="flex items-center space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                                    Enable 2FA
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Notification Preferences</h3>

                            <div className="space-y-4">
                                {Object.entries(investmentPrefs.notificationPreferences).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-800 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {key === 'priceAlerts' && 'Get notified when stock prices hit your target levels'}
                                                {key === 'portfolioUpdates' && 'Receive daily/weekly portfolio performance summaries'}
                                                {key === 'marketNews' && 'Stay updated with relevant market news and analysis'}
                                                {key === 'riskWarnings' && 'Receive alerts when portfolio risk levels change significantly'}
                                            </p>
                                        </div>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) => handleNotificationChange(key as keyof NotificationPreferences, e.target.checked)}
                                                className="form-checkbox h-5 w-5 text-[#0cb9c1] rounded focus:ring-[#0cb9c1]"
                                            />
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSavePreferences}
                                className="mt-6 px-6 py-2 bg-[#0cb9c1] text-white rounded-lg hover:bg-[#0aa8af] transition-colors"
                            >
                                Save Notification Preferences
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;