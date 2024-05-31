import {useEffect, useState} from 'react';
import {
    useFetchRosters,
    useLeagueIdFromUrl,
    usePlayerData,
} from '../../../hooks/hooks';
import {Roster, User, getAllUsers} from '../../../sleeper-api/sleeper-api';
import styles from './BlueprintGenerator.module.css';
import {teamSelectComponent} from '../../Team/TeamPage/TeamPage';
import {NONE_TEAM_ID} from '../../../consts/urlParams';
import CornerstoneModule from './modules/cornerstone/CornerstoneModule';
import {
    InputLabel,
    SelectChangeEvent,
    FormControl,
    MenuItem,
    Select,
} from '@mui/material';
import LookToTradeModule from './modules/looktotrade/LookToTradeModule';
export default function BlueprintGenerator() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useState(NONE_TEAM_ID);
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [roster, setRoster] = useState<Roster>();
    const playerData = usePlayerData();
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [module, setModule] = useState('');
    useEffect(() => {
        if (!allUsers.length || !hasTeamId()) return;
        setSpecifiedUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);

    function getRosterFromTeamIdx(idx: number) {
        if (allUsers.length === 0 || !rosters) return;
        const ownerId = allUsers[idx].user_id;
        return rosters.find(r => r.owner_id === ownerId);
    }

    useEffect(() => {
        if (!rosters || rosters.length === 0 || !hasTeamId() || !playerData) {
            return;
        }

        const newRoster = getRosterFromTeamIdx(+teamId);
        if (!newRoster) throw new Error('roster not found');

        setRoster(newRoster);
    }, [rosters, teamId, playerData]);

    useEffect(() => {
        if (!leagueId) return;
        getAllUsers(leagueId).then(users => setAllUsers(users));
    }, [leagueId]);

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    function moduleSelectComponent() {
        return (
            <FormControl
                style={{
                    margin: '4px',
                }}
            >
                <InputLabel>Module</InputLabel>
                <Select
                    value={module}
                    label="Module"
                    onChange={(event: SelectChangeEvent) => {
                        setModule(event.target.value);
                    }}
                >
                    <MenuItem value={''} key={'chooseamodule'}>
                        Choose a module:
                    </MenuItem>
                    <MenuItem value={'cornerstones'} key={'cornerstones'}>
                        Cornerstones
                    </MenuItem>
                    <MenuItem value={'looktotrade'} key={'looktotrade'}>
                        Look to Trade
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }

    return (
        <div className={styles.blueprintPage}>
            {teamSelectComponent(teamId, setTeamId, allUsers, specifiedUser, {
                margin: '4px',
            })}
            {hasTeamId() && moduleSelectComponent()}
            {hasTeamId() && module === 'cornerstones' && (
                <CornerstoneModule
                    roster={roster}
                    specifiedUser={specifiedUser}
                />
            )}
            {hasTeamId() && module === 'looktotrade' && <LookToTradeModule />}
        </div>
    );
}
