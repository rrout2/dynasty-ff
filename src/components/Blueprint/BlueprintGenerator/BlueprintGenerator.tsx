import {useEffect, useState} from 'react';
import {
    useFetchRosters,
    useLeagueIdFromUrl,
    useModuleFromUrl,
    usePlayerData,
    useTeamIdFromUrl,
    useTitle,
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
import PlayersToTargetModule from './modules/playerstotarget/PlayersToTargetModule';
import Settings from './modules/settings/Settings';
import Starters from './modules/Starters/Starters';

export enum Module {
    Unspecified = '',
    Cornerstone = 'cornerstones',
    LookToTrade = 'looktotrade',
    PlayersToTarget = 'playerstotarget',
    Settings = 'settings',
    Starters = 'starters',
}

export default function BlueprintGenerator() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [roster, setRoster] = useState<Roster>();
    const playerData = usePlayerData();
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [module, setModule] = useModuleFromUrl();
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
        if (
            !rosters ||
            rosters.length === 0 ||
            !hasTeamId() ||
            !playerData ||
            allUsers.length === 0
        ) {
            return;
        }

        const newRoster = getRosterFromTeamIdx(+teamId);
        if (!newRoster) throw new Error('roster not found');

        setRoster(newRoster);
    }, [rosters, teamId, playerData, allUsers]);

    useEffect(() => {
        if (!leagueId || !rosters) return;
        const ownerIds = new Set(rosters.map(r => r.owner_id));
        getAllUsers(leagueId).then(users =>
            // filter to users included in owners.
            // some leagues have users with no associated owner I think.
            setAllUsers(users.filter(u => ownerIds.has(u.user_id)))
        );
    }, [leagueId, rosters]);

    useTitle('Blueprint Generator');

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
                        setModule(event.target.value as Module);
                    }}
                >
                    <MenuItem value={''} key={'chooseamodule'}>
                        Choose a module:
                    </MenuItem>
                    <MenuItem value={Module.Cornerstone} key={'cornerstones'}>
                        Cornerstones
                    </MenuItem>
                    <MenuItem value={Module.LookToTrade} key={'looktotrade'}>
                        Look to Trade
                    </MenuItem>
                    <MenuItem
                        value={Module.PlayersToTarget}
                        key={'playerstotarget'}
                    >
                        Players to Target
                    </MenuItem>
                    <MenuItem value={Module.Settings} key={'settings'}>
                        Settings
                    </MenuItem>
                    <MenuItem value={Module.Starters} key={'starters'}>
                        Starters
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
            {hasTeamId() && module === Module.Cornerstone && (
                <CornerstoneModule
                    roster={roster}
                    specifiedUser={specifiedUser}
                />
            )}
            {hasTeamId() && module === Module.LookToTrade && (
                <LookToTradeModule
                    roster={roster}
                    specifiedUser={specifiedUser}
                />
            )}
            {hasTeamId() && module === Module.PlayersToTarget && (
                <PlayersToTargetModule specifiedUser={specifiedUser} />
            )}
            {hasTeamId() && module === Module.Settings && (
                <Settings
                    roster={roster}
                    leagueId={leagueId}
                    numRosters={rosters?.length ?? 0}
                    specifiedUser={specifiedUser}
                />
            )}
            {hasTeamId() && module === Module.Starters && (
                <Starters roster={roster} specifiedUser={specifiedUser} />
            )}
        </div>
    );
}
