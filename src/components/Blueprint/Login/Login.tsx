import {useState} from 'react';
import styles from './Login.module.css';
import {Button, TextField} from '@mui/material';
import axios, {AxiosResponse} from 'axios';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [response, setResponse] = useState<AxiosResponse | null>(null);

    async function sendLoginRequest(): Promise<AxiosResponse> {
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
            const response1: AxiosResponse = await axios.post(
                'https://cognito-idp.us-east-2.amazonaws.com/',
                payload,
                {headers}
            );

            const accessToken: string =
                response1.data.AuthenticationResult.AccessToken;

            const response2: AxiosResponse = await axios.get(
                'https://ljcdtaj4i2.execute-api.us-east-2.amazonaws.com/user',
                {headers: {Authorization: accessToken}}
            );

            setResponse(response2);
            return response2;
        } catch (error) {
            // Axios throws an error for non-2xx status codes, so we can
            // directly return the error's response object if it exists.
            if (axios.isAxiosError(error) && error.response) {
                setResponse(error.response);
                return error.response;
            }
            // Re-throw if it's not an Axios error or doesn't have a response.
            throw error;
        }
    }

    return (
        <div className={styles.login}>
            Flock Login Test
            <TextField
                label="Email"
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <TextField
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <Button
                variant="contained"
                disabled={!email || !password}
                onClick={sendLoginRequest}
            >
                Login
            </Button>
            {response && (
                <div>
                    <div>Creator code: {response.data.applied_promo_code}</div>
                    <div>Username: {response.data.username}</div>
                    <div>
                        Is subscribed: {response.data.is_subscribed || 'no'}
                    </div>
                    <div>
                        Subscribtion tier:{' '}
                        {response.data.subscription_tier || 'N/A'}
                    </div>
                    <div>User ID: {response.data.user_id || 'N/A'}</div>
                </div>
            )}
        </div>
    );
}
