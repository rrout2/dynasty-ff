import styles from './Dashboard.module.css';
import Login, {useLoginProps} from '../Login/Login';
import {Button} from '@mui/material';
import {useState} from 'react';
import {WeeklyBlueprint} from '../weekly/Weekly/Weekly';
import ExportButton from '../shared/ExportButton';
import {useTitle} from '../../../hooks/hooks';
const CLASS_NAME_FOR_EXPORT = 'DASHBOARD_WEEKLY_BP';

export default function Dashboard() {
    useTitle('Domain Dashboard');
    const loginProps = useLoginProps();
    const {isLoggedIn, logout} = loginProps;
    const [leagueId, _setLeagueId] = useState('1180089404448989184');
    const [teamId, setTeamId] = useState('');
    const [userId, _setUserId] = useState('1039669220303089664');
    const [loaded, setLoaded] = useState(false);
    const [teamName, setTeamName] = useState('');

    return (
        <div className={styles.container}>
            {!isLoggedIn && <Login {...loginProps} />}
            {isLoggedIn && (
                <div className={styles.dashboard}>
                    <div>Domain Dashboard</div>
                    <ExportButton
                        disabled={!loaded}
                        className={CLASS_NAME_FOR_EXPORT}
                        pngName={`${teamName}_weekly.png`}
                        label="Download Week 3 Blueprint"
                    />
                    <div className={styles.bp}>
                        <WeeklyBlueprint
                            leagueId={leagueId}
                            teamId={teamId}
                            setTeamId={setTeamId}
                            userId={userId}
                            setLoaded={setLoaded}
                            setTeamName={setTeamName}
                            classNameForExport={CLASS_NAME_FOR_EXPORT}
                        />
                    </div>
                    <Button variant="outlined" onClick={logout}>
                        Logout
                    </Button>
                </div>
            )}
        </div>
    );
}
