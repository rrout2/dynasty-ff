import {useState, useEffect} from 'react';
import styles from './Login.module.css';
import {Button, TextField} from '@mui/material';

// Cookie utility functions
const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export interface UserData {
    applied_promo_code: string;
    username: string;
    is_subscribed: boolean;
    subscription_tier: string;
    user_id: string;
}

interface AxiosResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    status: number;
    statusText: string;
}

type LoginProps = {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    response: AxiosResponse | null;
    setResponse: React.Dispatch<React.SetStateAction<AxiosResponse | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    userData: UserData | null;
    setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
    accessToken: string | null;
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    saveUserSession: (token: string, userData: UserData, email: string) => void;
    logout: () => void;
};

export function useLoginProps() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [response, setResponse] = useState<AxiosResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function hydrateCookies() {
        const savedToken = getCookie('accessToken');
        const savedUserData = getCookie('userData');
        const savedEmail = getCookie('userEmail');

        if (savedToken && savedUserData) {
            try {
                const parsedUserData = JSON.parse(
                    decodeURIComponent(savedUserData)
                );
                setAccessToken(savedToken);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                setEmail(savedEmail || '');
            } catch (error) {
                // If parsing fails, clear cookies
                logout();
            }
        }
    }

    // Check for existing login on component mount
    useEffect(() => {
        hydrateCookies();
    }, []);

    const saveUserSession = (
        token: string,
        userData: UserData,
        email: string
    ) => {
        setCookie('accessToken', token, 7); // Save for 7 days
        setCookie('userData', encodeURIComponent(JSON.stringify(userData)), 7);
        setCookie('userEmail', email, 7);
    };

    const logout = () => {
        deleteCookie('accessToken');
        deleteCookie('userData');
        deleteCookie('userEmail');
        setAccessToken(null);
        setUserData(null);
        setIsLoggedIn(false);
        setResponse(null);
        setEmail('');
        setPassword('');
        setError(null);
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        response,
        setResponse,
        loading,
        setLoading,
        error,
        setError,
        userData,
        setUserData,
        accessToken,
        setAccessToken,
        isLoggedIn,
        setIsLoggedIn,
        saveUserSession,
        logout,
    };
}

export default function Login({
    email,
    setEmail,
    password,
    setPassword,
    response,
    setResponse,
    loading,
    setLoading,
    error,
    setError,
    userData,
    setUserData,
    setAccessToken,
    isLoggedIn,
    setIsLoggedIn,
    saveUserSession,
    logout,
}: LoginProps) {
    async function sendLoginRequest(): Promise<AxiosResponse | void> {
        setLoading(true);
        setError(null);

        const payload = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
            ClientId: '3liua1jf4vn1f7bqk9not4ujqb',
        };

        const headers = {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
        };

        try {
            // First request to authenticate
            const response1 = await fetch(
                'https://cognito-idp.us-east-2.amazonaws.com/',
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(payload),
                }
            );

            if (!response1.ok) {
                throw new Error('Authentication failed');
            }

            const authResult = await response1.json();
            const token: string = authResult.AuthenticationResult.AccessToken;

            // Second request to get user data
            const response2 = await fetch(
                'https://ljcdtaj4i2.execute-api.us-east-2.amazonaws.com/user',
                {
                    method: 'GET',
                    headers: {Authorization: token},
                }
            );

            if (!response2.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await response2.json();

            const axiosLikeResponse: AxiosResponse = {
                data: userData,
                status: response2.status,
                statusText: response2.statusText,
            };

            // Save to cookies and state
            saveUserSession(token, userData, email);
            setAccessToken(token);
            setUserData(userData);
            setIsLoggedIn(true);
            setResponse(axiosLikeResponse);
            setPassword(''); // Clear password for security

            return axiosLikeResponse;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Login failed';
            setError(errorMessage);

            const errorResponse: AxiosResponse = {
                data: {error: errorMessage},
                status: 401,
                statusText: 'Unauthorized',
            };

            setResponse(errorResponse);
            return errorResponse;
        } finally {
            setLoading(false);
        }
    }

    if (isLoggedIn && userData) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.welcomeTitle}>Welcome back!</h2>

                    <p className={styles.loginInfo}>
                        Logged in as: <strong>{email}</strong>
                    </p>

                    <div className={styles.userData}>
                        <div className={styles.userDataItem}>
                            <strong>Creator code:</strong>{' '}
                            {userData.applied_promo_code || 'N/A'}
                        </div>
                        <div className={styles.userDataItem}>
                            <strong>Username:</strong> {userData.username}
                        </div>
                        <div className={styles.userDataItem}>
                            <strong>Is subscribed:</strong>{' '}
                            {userData.is_subscribed ? 'Yes' : 'No'}
                        </div>
                        <div className={styles.userDataItem}>
                            <strong>Subscription tier:</strong>{' '}
                            {userData.subscription_tier || 'N/A'}
                        </div>
                        <div className={styles.userDataItem}>
                            <strong>User ID:</strong>{' '}
                            {userData.user_id || 'N/A'}
                        </div>
                    </div>

                    <button className={styles.logoutButton} onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.form}>
                <TextField
                    className={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                />

                <TextField
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyUp={e => {
                        if (
                            e.key === 'Enter' &&
                            email &&
                            password &&
                            !loading
                        ) {
                            sendLoginRequest();
                        }
                    }}
                />

                <Button
                    variant="outlined"
                    disabled={!email || !password || loading}
                    onClick={sendLoginRequest}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {response && response.status !== 200 && !loading && (
                <div className={styles.error}>
                    Login failed. Please check your credentials.
                </div>
            )}
        </div>
    );
}
