import styles from './BlueprintDashboard.module.css';
import newInfiniteStyles from '../NewInfinite/NewInfinite.module.css';
import {flockDomainLogo, logoHorizontal} from '../../../consts/images';
import {useBlueprintsForDomainUser, useTitle} from '../../../hooks/hooks';
import {Box, Button, IconButton, Modal} from '@mui/material';
import {useEffect, useState} from 'react';
import DomainTextField from '../shared/DomainTextField';
import {WrappedNewInfinite} from '../NewInfinite/NewInfinite';
import {toPng} from 'html-to-image';
import {createRoot} from 'react-dom/client';
import {QueryClientProvider, useQueryClient} from '@tanstack/react-query';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CropFreeIcon from '@mui/icons-material/CropFree';
import axios from 'axios';

const COLOR_LIST = [
    '#F47F20',
    '#28ABE2',
    '#FABF4A',
    '#B139E2',
    '#1AE069',
    '#E84D57',
];

const ZOOM_LEVELS = [
    0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3,
];
const DEFAULT_ZOOM_INDEX = 7;

const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    });

    useEffect(() => {
        // Check if window is defined (for server-side rendering compatibility)
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Set initial size
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []); // Empty dependency array ensures this runs once on mount

    return screenSize;
};

export default function BlueprintDashboard() {
    useTitle('Blueprint Dashboard');
    const {width, height} = useScreenSize();
    const isMobile = width < 600;
    const [isLoggedIn, setIsLoggedIn] = useState(
        sessionStorage.getItem('flockAuthToken') !== null
    );
    const [loginModalOpen, setLoginModalOpen] = useState(!isLoggedIn);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginFlockUsername, setLoginFlockUsername] = useState('');
    const [loginSleeperUsername, setLoginSleeperUsername] = useState('');
    const [loginDiscordUsername, setLoginDiscordUsername] = useState('');
    const [loginError, setLoginError] = useState('');
    const [domainUserNotFound, setDomainUserNotFound] = useState(false);
    const blueprints = useBlueprintsForDomainUser();

    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [downloadBlueprintId, setDownloadBlueprintId] = useState('');
    const [downloadBlueprintName, setDownloadBlueprintName] = useState('');
    const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
    const [zoomLevel, setZoomLevel] = useState(ZOOM_LEVELS[DEFAULT_ZOOM_INDEX]);
    const [isMaximized, setIsMaximized] = useState(false);

    const [username] = useState(sessionStorage.getItem('flockEmail'));

    useEffect(() => {
        console.log('blueprints', blueprints);
    }, [blueprints]);

    useEffect(() => {
        if (!isLoggedIn) {
            setLoginModalOpen(true);
        }
    }, [isLoggedIn]);
    useEffect(() => {
        setZoomLevel(ZOOM_LEVELS[zoomIndex]);
    }, [zoomIndex]);

    // mock data
    const bps = [
        {
            name: 'Blueprint team name longer team name',
            date: 'Oct 21, 2025',
            blueprintId: '2930',
        },
        {
            name: 'Blueprint team name',
            date: 'Oct 21, 2025',
            blueprintId: '2931',
        },
        {
            name: 'Blueprint team name',
            date: 'Oct 21, 2025',
            blueprintId: '2932',
        },
        {
            name: 'Blueprint team name',
            date: 'Oct 21, 2025',
            blueprintId: '2933',
        },
    ];
    const infinites = [
        {
            name: 'Blueprint team name',
            date: 'Oct 21, 2025',
            blueprintId: '2934',
        },
    ];

    async function submitLogin() {
        setIsLoggingIn(true);
        const options = {
            method: 'POST',
            url: 'https://domainffapi.azurewebsites.net/api/Auth/flock',
            headers: {'Content-Type': 'application/json'},
            data: {flockEmailAddress: loginEmail, secretOrOtp: loginPassword},
        };
        axios
            .request(options)
            .then(res => {
                if (res.data.success) {
                    const token = res.data.token;
                    sessionStorage.setItem('flockAuthToken', token);
                    sessionStorage.setItem('flockEmail', res.data.flockEmail);
                    setIsLoggedIn(true);
                    setLoginModalOpen(false);
                    setLoginError('');
                } else {
                    setLoginError(`${res.data.code}: ${res.data.message}`);
                }
            })
            .catch(err => {
                if (err.response.data.code === 'DomainUserNotFound') {
                    setDomainUserNotFound(true);
                    return;
                }
                setLoginError(
                    `${err.response.data.code}: ${err.response.data.message}`
                );
                console.log(err);
            })
            .finally(() => {
                setIsLoggingIn(false);
            });
    }

    const zoomIn = () =>
        setZoomIndex(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
    const zoomOut = () => setZoomIndex(prev => Math.max(prev - 1, 0));

    function logout() {
        sessionStorage.removeItem('flockAuthToken');
        sessionStorage.removeItem('flockEmail');
        setIsLoggedIn(false);
    }

    const downloadBlueprint = async () => {
        const element = document.getElementsByClassName(
            newInfiniteStyles.fullBlueprint
        )[0] as HTMLElement;

        const dataUrl = await toPng(element, {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            cacheBust: true,
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${downloadBlueprintName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <Modal
                open={loginModalOpen}
                onClose={() => {}} // prevent close on unless you login.
            >
                <Box className={styles.loginModal} sx={{maxWidth: '75%'}}>
                    <img src={flockDomainLogo} className={styles.loginLogo} />
                    <div className={styles.loginTitle}>
                        BLUEPRINT DASHBOARD LOGIN
                    </div>
                    <div className={styles.loginDescription}>
                        Login using the same email and password used on the
                        Flock Fantasy website
                    </div>
                    <div>
                        <div className={styles.inputLabel}>Email Address</div>
                        <DomainTextField
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            onKeyUp={e =>
                                e.key === 'Enter' &&
                                loginEmail.trim() &&
                                loginPassword.trim() &&
                                submitLogin()
                            }
                            backgroundColor={'rgba(217, 217, 217, 0.20)'}
                            hideOutline={true}
                            inputWidth={
                                width < 600 ? `${width * 0.8}px` : '380px'
                            }
                        />
                    </div>
                    <div>
                        <div className={styles.inputLabel}>Password</div>
                        <DomainTextField
                            type={'password'}
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            onKeyUp={e =>
                                e.key === 'Enter' &&
                                loginEmail.trim() &&
                                loginPassword.trim() &&
                                submitLogin()
                            }
                            backgroundColor={'rgba(217, 217, 217, 0.20)'}
                            hideOutline={true}
                            inputWidth={
                                width < 600 ? `${width * 0.8}px` : '380px'
                            }
                        />
                    </div>
                    {domainUserNotFound && (
                        <>
                            <div>
                                <div className={styles.inputLabel}>
                                    Flock Username
                                </div>
                                <DomainTextField
                                    value={loginFlockUsername}
                                    onChange={e =>
                                        setLoginFlockUsername(e.target.value)
                                    }
                                    onKeyUp={e =>
                                        e.key === 'Enter' &&
                                        loginEmail.trim() &&
                                        loginPassword.trim() &&
                                        submitLogin()
                                    }
                                    backgroundColor={
                                        'rgba(217, 217, 217, 0.20)'
                                    }
                                    hideOutline={true}
                                    inputWidth={
                                        width < 600
                                            ? `${width * 0.8}px`
                                            : '380px'
                                    }
                                />
                            </div>
                            <div>
                                <div className={styles.inputLabel}>
                                    Sleeper Username
                                </div>
                                <DomainTextField
                                    value={loginSleeperUsername}
                                    onChange={e =>
                                        setLoginSleeperUsername(e.target.value)
                                    }
                                    onKeyUp={e =>
                                        e.key === 'Enter' &&
                                        loginEmail.trim() &&
                                        loginPassword.trim() &&
                                        submitLogin()
                                    }
                                    backgroundColor={
                                        'rgba(217, 217, 217, 0.20)'
                                    }
                                    hideOutline={true}
                                    inputWidth={
                                        width < 600
                                            ? `${width * 0.8}px`
                                            : '380px'
                                    }
                                />
                            </div>
                            <div>
                                <div className={styles.inputLabel}>
                                    Discord Username
                                </div>
                                <DomainTextField
                                    value={loginDiscordUsername}
                                    onChange={e =>
                                        setLoginDiscordUsername(e.target.value)
                                    }
                                    onKeyUp={e =>
                                        e.key === 'Enter' &&
                                        loginEmail.trim() &&
                                        loginPassword.trim() &&
                                        submitLogin()
                                    }
                                    backgroundColor={
                                        'rgba(217, 217, 217, 0.20)'
                                    }
                                    hideOutline={true}
                                    inputWidth={
                                        width < 600
                                            ? `${width * 0.8}px`
                                            : '380px'
                                    }
                                />
                            </div>
                        </>
                    )}
                    {loginError && (
                        <div className={styles.loginError}>{loginError}</div>
                    )}
                    <Button
                        sx={{
                            fontFamily: 'Acumin Pro Condensed',
                            color: '#04121C',
                            fontWeight: '700',
                            background:
                                'linear-gradient(180deg, #EA9A19 0%, #FF4200 100%)',
                            '&:disabled': {
                                background: 'gray',
                            },
                            width: '120px',
                            borderRadius: '10px',
                        }}
                        variant="contained"
                        onClick={() => {
                            submitLogin();
                        }}
                        disabled={!loginEmail.trim() || !loginPassword.trim()}
                        loading={isLoggingIn}
                    >
                        SIGN IN
                    </Button>
                </Box>
            </Modal>
            <Modal
                open={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
            >
                <Box
                    className={styles.downloadModal}
                    sx={{
                        width: isMaximized ? '100%' : null,
                        height: isMaximized ? '100%' : null,
                    }}
                >
                    <div className={styles.downloadModalHeader}>
                        <Button
                            variant="text"
                            style={{
                                padding: '10px 15px 6px 15px',
                                height: '50px',
                                marginTop: '10px',
                            }}
                            sx={{
                                backgroundColor: '#474E51',
                                color: 'white',
                                borderRadius: '5px',
                                '&:hover': {
                                    backgroundColor: '#676b6dff',
                                },
                                fontFamily: 'Acumin Pro',
                                fontWeight: '1000',
                                fontSize: '30px',
                            }}
                            onClick={downloadBlueprint}
                        >
                            DOWNLOAD
                        </Button>
                        <IconButton
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                            }}
                            TouchRippleProps={{
                                style: {
                                    color: 'white',
                                },
                            }}
                            onClick={() => zoomOut()}
                        >
                            <ZoomOutIcon sx={{color: 'white'}} />
                        </IconButton>
                        <IconButton
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                            }}
                            TouchRippleProps={{
                                style: {
                                    color: 'white',
                                },
                            }}
                            onClick={() => zoomIn()}
                        >
                            <ZoomInIcon sx={{color: 'white'}} />
                        </IconButton>
                        <IconButton
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                            }}
                            TouchRippleProps={{
                                style: {
                                    color: 'white',
                                },
                            }}
                            onClick={() => setIsMaximized(!isMaximized)}
                        >
                            {isMaximized ? (
                                <CloseFullscreenIcon sx={{color: 'white'}} />
                            ) : (
                                <OpenInFullIcon sx={{color: 'white'}} />
                            )}
                        </IconButton>
                    </div>
                    <div
                        className={styles.zoomWrapper}
                        style={{transform: `scale(${zoomLevel})`}}
                    >
                        <WrappedNewInfinite blueprintId={downloadBlueprintId} />
                    </div>
                </Box>
            </Modal>
            {isLoggedIn && (
                <>
                    <div
                        className={styles.headerContainer}
                        style={{flexDirection: isMobile ? 'column' : 'row'}}
                    >
                        <img
                            src={logoHorizontal}
                            className={styles.domainLogo}
                            style={{width: isMobile ? '90%' : ''}}
                        />
                        <div
                            className={styles.title}
                            style={{fontSize: isMobile ? '40px' : ''}}
                        >
                            BLUEPRINT DASHBOARD
                        </div>
                        <Button
                            variant="text"
                            style={{
                                padding: '10px 15px 6px 15px',
                                height: '50px',
                            }}
                            sx={{
                                backgroundColor: '#474E51',
                                color: 'white',
                                borderRadius: '5px',
                                '&:hover': {
                                    backgroundColor: '#676b6dff',
                                },
                                fontFamily: 'Acumin Pro',
                                fontWeight: '1000',
                                fontSize: '30px',
                            }}
                            onClick={() => {
                                logout();
                            }}
                        >
                            Log Out
                        </Button>
                    </div>
                    <div className={styles.bodyContainer}>
                        <div className={styles.bodySection1}>
                            {!isMobile && (
                                <div>
                                    <div className={styles.welcome}>
                                        Welcome back,{' '}
                                        <span className={styles.username}>
                                            {username}
                                        </span>
                                    </div>
                                    <div className={styles.description}>
                                        Track your blueprints, review all of
                                        your blueprints in one place, open a
                                        support ticket, and more!
                                    </div>
                                </div>
                            )}
                            <div
                                className={styles.myBlueprints}
                                style={{
                                    marginLeft: isMobile ? '0' : '',
                                    alignItems: isMobile ? 'center' : '',
                                }}
                            >
                                <div
                                    className={styles.myBlueprintsTitle}
                                    style={{
                                        textAlign: isMobile
                                            ? 'center'
                                            : undefined,
                                        fontSize: isMobile ? '30px' : undefined,
                                    }}
                                >
                                    My Blueprints{' '}
                                    <MyBpIcon isMobile={isMobile} />
                                </div>
                                <div
                                    className={styles.myBlueprintsList}
                                    style={{
                                        width: isMobile
                                            ? `${width * 0.8}px`
                                            : '',
                                    }}
                                >
                                    {bps.map((bp, idx) => (
                                        <BlueprintItem
                                            key={idx}
                                            index={idx}
                                            screenWidth={width}
                                            setDownloadBlueprintId={(
                                                id: string
                                            ) => setDownloadBlueprintId(id)}
                                            setDownloadBlueprintName={(
                                                name: string
                                            ) => setDownloadBlueprintName(name)}
                                            setDownloadModalOpen={(
                                                open: boolean
                                            ) => setDownloadModalOpen(open)}
                                            {...bp}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div
                                className={styles.myInfiniteBlueprints}
                                style={{
                                    marginLeft: isMobile ? '0' : '',
                                    alignItems: isMobile ? 'center' : '',
                                }}
                            >
                                <div
                                    className={styles.myInfiniteBlueprintsTitle}
                                    style={{
                                        textAlign: isMobile
                                            ? 'center'
                                            : undefined,
                                        fontSize: isMobile ? '30px' : undefined,
                                    }}
                                >
                                    My Infinite Blueprints
                                </div>
                                <div
                                    className={styles.myBlueprintsList}
                                    style={{
                                        width: isMobile
                                            ? `${width * 0.8}px`
                                            : '',
                                    }}
                                >
                                    {infinites.map((bp, idx) => (
                                        <BlueprintItem
                                            key={idx}
                                            index={idx}
                                            screenWidth={width}
                                            setDownloadBlueprintId={(
                                                id: string
                                            ) => setDownloadBlueprintId(id)}
                                            setDownloadBlueprintName={(
                                                name: string
                                            ) => setDownloadBlueprintName(name)}
                                            setDownloadModalOpen={(
                                                open: boolean
                                            ) => setDownloadModalOpen(open)}
                                            {...bp}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

type BlueprintItemProps = {
    name: string;
    date: string;
    index: number;
    screenWidth: number;
    blueprintId: string;
    setDownloadBlueprintId: (id: string) => void;
    setDownloadBlueprintName: (name: string) => void;
    setDownloadModalOpen: (open: boolean) => void;
};

function BlueprintItem({
    name,
    date,
    index,
    screenWidth,
    blueprintId,
    setDownloadBlueprintId,
    setDownloadBlueprintName,
    setDownloadModalOpen,
}: BlueprintItemProps) {
    const queryClient = useQueryClient();
    const [isMobile] = useState(screenWidth < 600);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadBlueprint = async () => {
        setIsDownloading(true);
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        const root = createRoot(container);
        root.render(
            <QueryClientProvider client={queryClient}>
                <WrappedNewInfinite blueprintId={blueprintId} />
            </QueryClientProvider>
        );

        await new Promise<void>(resolve => {
            const interval = setInterval(() => {
                if (container.firstElementChild) {
                    clearInterval(interval);
                    resolve();
                }
            }, 50);
        });

        const element = container.firstElementChild as HTMLElement;
        const teamName = element.querySelector(
            `.${newInfiniteStyles.teamName}`
        );
        await new Promise<string>(resolve => {
            const interval = setInterval(() => {
                const teamNameText = teamName?.textContent || '';
                if (teamNameText !== '') {
                    clearInterval(interval);
                    resolve(teamNameText);
                }
            }, 50);
        });
        const benchString = element.querySelector(
            `.${newInfiniteStyles.benchString}`
        );
        await new Promise<string>(resolve => {
            const interval = setInterval(() => {
                const benchStringText = benchString?.textContent || '';
                if (benchStringText !== '') {
                    clearInterval(interval);
                    resolve(benchStringText);
                }
            }, 50);
        });

        await document.fonts.ready;

        // Wait for specific images only
        const criticalImages = element.querySelectorAll(
            `img.${newInfiniteStyles.blankBp}`
        ) as NodeListOf<HTMLImageElement>;

        await Promise.all(
            Array.from(criticalImages).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                    setTimeout(resolve, 10000); // Timeout fallback
                });
            })
        );
        await new Promise(resolve => setTimeout(resolve, 2000));

        const dataUrl = await toPng(
            container.firstElementChild as HTMLElement,
            {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                cacheBust: true,
            }
        );

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        document.body.removeChild(container);

        setIsDownloading(false);
    };

    return (
        <div
            className={styles.blueprintItem}
            style={{width: isMobile ? `${screenWidth * 0.7}px` : ''}}
        >
            <div className={styles.blueprintItemHeader}>
                <div className={styles.domainShieldContainer}>
                    <DomainShield
                        color={COLOR_LIST[index % COLOR_LIST.length]}
                    />
                </div>
                <div className={styles.blueprintMetadata}>
                    <div
                        className={styles.blueprintName}
                        style={{
                            fontSize: isMobile ? '30px' : undefined,
                            maxWidth: isMobile ? `${screenWidth * 0.5}px` : '',
                        }}
                    >
                        {name}
                    </div>
                    <div
                        className={styles.blueprintDate}
                        style={{
                            fontSize: isMobile ? '15px' : undefined,
                        }}
                    >
                        {date}
                    </div>
                </div>
            </div>
            <div className={styles.blueprintItemFooter}>
                <Button
                    variant="text"
                    style={{
                        padding: '10px 15px 6px 15px',
                        height: '50px',
                    }}
                    sx={{
                        backgroundColor: '#474E51',
                        color: 'white',
                        borderRadius: '5px',
                        '&:hover': {
                            backgroundColor: '#676b6dff',
                        },
                        fontFamily: 'Acumin Pro',
                        fontWeight: '1000',
                        fontSize: '30px',
                    }}
                    onClick={() => {
                        setDownloadModalOpen(true);
                        setDownloadBlueprintId(blueprintId);
                        setDownloadBlueprintName(name);
                    }}
                    loading={isDownloading}
                >
                    PREVIEW
                </Button>
            </div>
        </div>
    );
}

const DomainShield = ({color = '#F47F20'}: {color?: string}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="66"
        height="100"
        viewBox="0 0 66 100"
        fill="none"
        className={styles.domainShield}
    >
        <path
            d="M55.7908 12.8465V22.2225C55.7908 22.5132 55.6055 22.7772 55.3281 22.8692L10.4561 38.3265C10.0161 38.4772 9.55347 38.1492 9.55347 37.6799V27.7345C9.55347 27.4439 9.73747 27.1799 10.0228 27.0879L16.8735 24.8252C17.3135 24.6839 17.7695 25.0039 17.7695 25.4732L17.7908 29.8625C17.7975 30.3319 18.2535 30.6585 18.6935 30.5092L24.9615 28.4105C25.2388 28.3185 25.4228 28.0625 25.4228 27.7705L25.4588 22.4639C25.4588 22.1719 25.6441 21.9092 25.9215 21.8172L36.3561 18.3519C36.7975 18.2025 37.2535 18.5305 37.2535 18.9999V23.3745C37.2535 23.8439 37.7148 24.1719 38.1561 24.0292L44.2241 22.0092C44.5015 21.9159 44.6935 21.6532 44.6935 21.3612V16.2185C44.6935 15.9265 44.8788 15.6705 45.1561 15.5705L54.8801 12.1999C55.3281 12.0425 55.7908 12.3705 55.7908 12.8465Z"
            fill={color}
        />
        <path
            d="M55.7908 27.3795V30.5315C55.7908 30.8301 55.6055 31.0861 55.3281 31.1848L10.4561 46.6355C10.0161 46.7848 9.55347 46.4581 9.55347 45.9888V42.3181C9.55347 42.0195 9.73747 41.7555 10.0228 41.6635L17.7975 39.1235L25.4228 36.5701L37.2535 32.6368L44.6935 30.1675L54.8868 26.7248C55.3361 26.5821 55.7908 26.9101 55.7908 27.3795Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M55.7908 27.3795V30.5315C55.7908 30.8301 55.6055 31.0861 55.3281 31.1848L10.4561 46.6355C10.0161 46.7848 9.55347 46.4581 9.55347 45.9888V42.3181C9.55347 42.0195 9.73747 41.7555 10.0228 41.6635L17.7975 39.1235L25.4228 36.5701L37.2535 32.6368L44.6935 30.1675L54.8868 26.7248C55.3361 26.5821 55.7908 26.9101 55.7908 27.3795Z"
            fill={color}
        />
        <path
            d="M55.7908 12.8465V22.2225C55.7908 22.5132 55.6055 22.7772 55.3281 22.8692L10.4561 38.3265C10.0161 38.4772 9.55347 38.1492 9.55347 37.6799V27.7345C9.55347 27.4439 9.73747 27.1799 10.0228 27.0879L16.8735 24.8252C17.3135 24.6839 17.7695 25.0039 17.7695 25.4732L17.7908 29.8625C17.7975 30.3319 18.2535 30.6585 18.6935 30.5092L24.9615 28.4105C25.2388 28.3185 25.4228 28.0625 25.4228 27.7705L25.4588 22.4639C25.4588 22.1719 25.6441 21.9092 25.9215 21.8172L36.3561 18.3519C36.7975 18.2025 37.2535 18.5305 37.2535 18.9999V23.3745C37.2535 23.8439 37.7148 24.1719 38.1561 24.0292L44.2241 22.0092C44.5015 21.9159 44.6935 21.6532 44.6935 21.3612V16.2185C44.6935 15.9265 44.8788 15.6705 45.1561 15.5705L54.8801 12.1999C55.3281 12.0425 55.7908 12.3705 55.7908 12.8465Z"
            fill={color}
        />
        <path
            d="M9.55319 37.6799V27.7345C9.55319 27.4439 9.73853 27.1799 10.0225 27.0879L16.8732 24.8252C17.3145 24.6839 17.7692 25.0039 17.7692 25.4732L17.7905 29.8625C17.7972 30.3319 18.2532 30.6585 18.6945 30.5092L24.9612 28.4105C25.2385 28.3185 25.4239 28.0625 25.4239 27.7705L25.4585 22.4639C25.4585 22.1719 25.6439 21.9092 25.9212 21.8172L36.3572 18.3519C36.7972 18.2025 37.2532 18.5305 37.2532 18.9999V23.3745C37.2532 23.8439 37.7159 24.1719 38.1572 24.0292L44.2239 22.0092C44.5012 21.9159 44.6932 21.6532 44.6932 21.3612V16.2185C44.6932 15.9265 44.8785 15.6705 45.1559 15.5705L54.8799 12.1999C55.3279 12.0425 55.7905 12.3705 55.7905 12.8465V22.2225C55.7905 22.5132 55.6065 22.7772 55.3279 22.8692L10.4572 38.3265C10.0159 38.4772 9.55319 38.1492 9.55319 37.6799Z"
            fill={color}
        />
        <path
            d="M9.55319 45.9884V42.3178C9.55319 42.0191 9.73853 41.7564 10.0225 41.6631L17.7972 39.1244L25.4239 36.5698L37.2532 32.6364L44.6932 30.1684L54.8879 26.7244C55.3359 26.5831 55.7905 26.9098 55.7905 27.3791V30.5311C55.7905 30.8298 55.6065 31.0858 55.3279 31.1858L10.4572 46.6351C10.0159 46.7858 9.55319 46.4578 9.55319 45.9884Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M61.944 72.8773C61.944 73.1187 61.9373 73.532 61.9373 73.9093C61.9293 74.492 61.6453 75.04 61.168 75.3813C60.8987 75.5733 60.6133 75.7867 60.408 75.936L34.9693 94.9573C34.6 95.228 33.9453 95.6827 33.4333 96.0387C32.9773 96.3587 32.38 96.3587 31.9253 96.0467C31.4053 95.6827 30.7507 95.228 30.388 94.9573L4.872 75.964C4.64533 75.8013 4.25333 75.4733 3.92667 75.196C3.54933 74.876 3.336 74.4133 3.32934 73.9227V24.996C3.32934 24.6547 3.32933 24.0653 3.336 23.5173C3.34266 22.7906 3.79867 22.144 4.48133 21.8947C4.97867 21.7107 5.53467 21.5107 5.91867 21.376L31.5053 12.612L31.52 12.6053H31.5333L57 4.28932L59.916 3.37199C60.9413 3.04398 61.9867 3.80532 62.0013 4.87999C62.0147 6.07465 62.0227 7.41199 62.0227 7.93066L61.944 72.8773ZM65.2587 4.85065C65.2307 2.17599 63.04 -1.52588e-05 60.3653 -1.52588e-05C59.8667 -1.52588e-05 59.3693 0.0786591 58.892 0.226662L55.948 1.15865L30.5453 9.45332C30.4813 9.47466 30.4093 9.49599 30.3453 9.51732L4.82267 18.26C4.424 18.4026 3.84133 18.608 3.31467 18.8013C1.35067 19.5187 0.0280014 21.3973 0.00666809 23.488C0.00666809 24.0427 0 24.648 0 24.996V73.9373C0.0133333 75.396 0.654669 76.768 1.764 77.708C2.42534 78.2693 2.70934 78.4893 2.86667 78.6107L28.3827 97.604C28.7093 97.8387 29.2573 98.2293 30.012 98.756C30.7947 99.2893 31.6973 99.5667 32.636 99.5667C33.5827 99.5667 34.4853 99.2893 35.2613 98.7493C36.0147 98.2293 36.5627 97.8387 36.8973 97.5893L62.3427 78.5747C62.5267 78.4333 62.8053 78.2333 63.0533 78.056C64.3693 77.1093 65.1667 75.5733 65.188 73.944C65.1947 73.5453 65.1947 73.1333 65.1947 72.884L65.2733 7.94532C65.28 7.41865 65.2667 6.05332 65.2587 4.85065Z"
            fill={color}
        />
        <path
            d="M9.55319 37.6799V27.7345C9.55319 27.4439 9.73853 27.1799 10.0225 27.0879L16.8732 24.8252C17.3145 24.6839 17.7692 25.0039 17.7692 25.4732L17.7905 29.8625C17.7972 30.3319 18.2532 30.6585 18.6945 30.5092L24.9612 28.4105C25.2385 28.3185 25.4239 28.0625 25.4239 27.7705L25.4585 22.4639C25.4585 22.1719 25.6439 21.9092 25.9212 21.8172L36.3572 18.3519C36.7972 18.2025 37.2532 18.5305 37.2532 18.9999V23.3745C37.2532 23.8439 37.7159 24.1719 38.1572 24.0292L44.2239 22.0092C44.5012 21.9159 44.6932 21.6532 44.6932 21.3612V16.2185C44.6932 15.9265 44.8785 15.6705 45.1559 15.5705L54.8799 12.1999C55.3279 12.0425 55.7905 12.3705 55.7905 12.8465V22.2225C55.7905 22.5132 55.6065 22.7772 55.3279 22.8692L10.4572 38.3265C10.0159 38.4772 9.55319 38.1492 9.55319 37.6799Z"
            fill={color}
        />
        <path
            d="M9.55319 45.9884V42.3178C9.55319 42.0191 9.73853 41.7564 10.0225 41.6631L17.7972 39.1244L25.4239 36.5698L37.2532 32.6364L44.6932 30.1684L54.8879 26.7244C55.3359 26.5831 55.7905 26.9098 55.7905 27.3791V30.5311C55.7905 30.8298 55.6065 31.0858 55.3279 31.1858L10.4572 46.6351C10.0159 46.7858 9.55319 46.4578 9.55319 45.9884Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M34.9981 62.8189C34.7568 62.9403 34.6141 63.1963 34.6354 63.4656L35.1474 72.3509C35.1688 72.7429 34.8634 73.0696 34.4648 73.0696H30.8794C30.4888 73.0696 30.1754 72.7429 30.1968 72.3509L30.7154 63.4656C30.7301 63.1963 30.5874 62.9403 30.3528 62.8189C28.5674 61.9083 27.3941 59.9803 27.5928 57.8043C27.8061 55.4283 29.7128 53.4789 32.0888 53.2163C35.1688 52.8749 37.7728 55.2709 37.7728 58.2803C37.7728 60.2576 36.6408 61.9789 34.9981 62.8189ZM54.9728 34.3229L32.6434 41.9616V41.8696H32.6368V41.9616L9.85944 49.7656C9.58877 49.8656 9.40344 50.1216 9.40344 50.4136V71.4909C9.40344 71.7109 9.51011 71.9176 9.68877 72.0456L32.6368 88.4349H32.6434L55.5914 72.0456C55.7701 71.9176 55.8768 71.7109 55.8768 71.4909V34.9763C55.8768 34.5003 55.4141 34.1736 54.9728 34.3229Z"
            fill={color}
        />
        <path
            d="M55.7908 27.3795V30.5315C55.7908 30.8301 55.6055 31.0861 55.3281 31.1848L10.4561 46.6355C10.0161 46.7848 9.55347 46.4581 9.55347 45.9888V42.3181C9.55347 42.0195 9.73747 41.7555 10.0228 41.6635L17.7975 39.1235L25.4228 36.5701L37.2535 32.6368L44.6935 30.1675L54.8868 26.7248C55.3361 26.5821 55.7908 26.9101 55.7908 27.3795Z"
            fill={color}
        />
        <path
            d="M55.7908 12.8465V22.2225C55.7908 22.5132 55.6055 22.7772 55.3281 22.8692L10.4561 38.3265C10.0161 38.4772 9.55347 38.1492 9.55347 37.6799V27.7345C9.55347 27.4439 9.73747 27.1799 10.0228 27.0879L16.8735 24.8252C17.3135 24.6839 17.7695 25.0039 17.7695 25.4732L17.7908 29.8625C17.7975 30.3319 18.2535 30.6585 18.6935 30.5092L24.9615 28.4105C25.2388 28.3185 25.4228 28.0625 25.4228 27.7705L25.4588 22.4639C25.4588 22.1719 25.6441 21.9092 25.9215 21.8172L36.3561 18.3519C36.7975 18.2025 37.2535 18.5305 37.2535 18.9999V23.3745C37.2535 23.8439 37.7148 24.1719 38.1561 24.0292L44.2241 22.0092C44.5015 21.9159 44.6935 21.6532 44.6935 21.3612V16.2185C44.6935 15.9265 44.8788 15.6705 45.1561 15.5705L54.8801 12.1999C55.3281 12.0425 55.7908 12.3705 55.7908 12.8465Z"
            fill={color}
        />
        <path
            d="M32.6437 42.1256H32.6371V41.8696H32.6437V42.1256Z"
            fill={color}
        />
        <path
            d="M32.6378 41.9655V42.1268L32.6405 42.1242V41.9655H32.6378Z"
            fill={color}
        />
        <path
            d="M32.6437 42.0256H32.6371V41.8695H32.6437V42.0256Z"
            fill={color}
        />
        <path
            d="M32.6405 88.3354L32.6385 88.3334L32.6405 88.3354Z"
            fill={color}
        />
    </svg>
);

const MyBpIcon = ({isMobile}: {isMobile: boolean}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="65"
        height="85"
        viewBox="0 0 65 85"
        fill="none"
        className={styles.myBpIcon}
        style={{width: isMobile ? '20px' : ''}}
    >
        <path
            d="M61.4755 10.6397V10.673H55.7102C55.4409 10.673 55.4755 10.7064 55.4755 10.4544V4.94237C55.2742 2.70638 60.9715 9.79971 61.4755 10.6397Z"
            fill="white"
        />
        <path
            d="M55.2566 25.0272C54.8033 26.4218 54.2819 26.3712 52.7859 26.3218H50.2646C44.3646 26.1872 33.7433 26.5898 28.5153 26.1698L28.3979 26.0685C27.2379 24.9938 27.2553 21.2285 29.5246 21.2952H54.0459C55.3233 21.2952 55.6766 23.9512 55.2566 25.0272ZM54.5006 36.8098C47.7606 37.0952 35.4913 36.9778 28.9699 36.8592L28.8353 36.7925C28.3473 36.5738 27.5233 35.6325 27.5739 34.5565C27.6073 33.3978 28.0619 32.1872 28.9019 31.9178C31.2219 31.9018 52.3486 31.9018 54.1473 31.9178C55.7779 32.2712 55.7779 36.0018 54.5006 36.8098ZM39.3233 47.4818C36.5326 47.7845 31.2886 48.0205 28.9859 47.2805C27.3059 46.4405 26.8006 43.5498 28.6499 42.7258L28.8019 42.6578C31.1033 42.2712 36.2139 42.3725 38.8859 42.5072C42.2806 42.2712 42.4659 46.8765 39.3233 47.4818ZM56.4833 63.0965C59.5926 63.6178 62.3326 61.8192 64.0473 59.1978C64.6859 58.1885 64.9206 57.7858 64.9886 56.9618V18.7578C64.9553 18.0685 65.0553 16.6738 64.9206 16.4552C62.5339 15.9338 57.7953 16.4045 55.1059 16.2538C52.5006 16.3712 50.6686 14.7738 50.9713 12.1018C50.9206 8.92584 51.1046 3.02584 50.8873 0.252506L50.8526 0.185841C44.3486 -0.218159 29.6579 0.185837 25.9939 0.0338364C25.3699 0.00850296 24.7286 0.072506 24.0913 0.21384C20.3446 1.04717 17.7913 4.5565 17.7993 8.39517C17.8273 23.4992 18.0606 37.9338 18.0606 52.8605C18.0606 53.4165 18.1246 54.0912 18.3139 54.8338C19.6073 59.8805 24.3126 63.3032 29.5219 63.2698L56.4833 63.0965Z"
            fill="white"
        />
        <path
            d="M13.439 57.1972C13.4217 61.5505 18.5817 66.9118 21.8604 67.8865C23.5404 68.3412 25.0537 68.2572 26.9017 68.3238C33.2044 68.3905 42.8364 67.7185 45.3404 68.3745C46.651 69.0638 46.4164 70.6438 46.5497 72.5252C46.567 76.2905 46.0457 80.3078 43.4577 82.4932C42.483 83.3332 41.3737 83.8878 40.1964 84.0732C34.3817 85.1318 16.179 84.9638 9.64038 84.5772C9.61238 84.5758 9.58305 84.5732 9.55371 84.5718C4.90705 84.2892 1.27505 80.4358 1.15905 75.7812L0.00304666 29.2105C-0.04762 27.1318 0.53238 25.0452 1.83905 23.4278C2.64038 22.4385 3.61505 21.6652 4.78305 21.3972H12.6404L13.439 57.1972Z"
            fill="white"
        />
    </svg>
);
