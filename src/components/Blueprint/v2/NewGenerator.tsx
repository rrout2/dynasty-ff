import {useEffect, useState} from 'react';
import {
    useFetchRosters,
    useLeagueIdFromUrl,
    useParamFromUrl,
    usePlayerData,
    useTeamIdFromUrl,
} from '../../../hooks/hooks';
import {User, Roster, getAllUsers} from '../../../sleeper-api/sleeper-api';
import {teamSelectComponent} from '../../Team/TeamPage/TeamPage';
import {
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
} from '@mui/material';
import {NONE_TEAM_ID} from '../../../consts/urlParams';
import RosterModule from './modules/RosterModule/RosterModule';
import SettingsModule from './modules/SettingsModule/SettingsModule';
import CornerstonesModule from './modules/CornerstonesModule/CornerstonesModule';
import UnifiedModule from './modules/UnifiedModule/UnifiedModule';
import SuggestedMovesModule from './modules/SuggestedMovesModule/SuggestedMovesModule';

export enum Module {
    Unspecified = 'unspecified',
    Roster = 'roster',
    Settings = 'settings',
    Cornerstones = 'cornerstones',
    SuggestedMoves = 'suggestedmoves',
    Unified = 'unified',
}

export default function NewGenerator() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const [module, setModule] = useParamFromUrl('module', Module.Unspecified);
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [roster, setRoster] = useState<Roster>();
    const playerData = usePlayerData();

    useEffect(() => {
        if (!leagueId || !rosters) return;
        const ownerIds = new Set(rosters.map(r => r.owner_id));
        getAllUsers(leagueId).then(users =>
            // filter to users included in owners.
            // some leagues have users with no associated owner I think.
            setAllUsers(users.filter(u => ownerIds.has(u.user_id)))
        );
    }, [leagueId, rosters]);

    useEffect(() => {
        if (!allUsers.length || !hasTeamId()) return;
        setSpecifiedUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);

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
        function getRosterFromTeamIdx(idx: number) {
            if (allUsers.length === 0 || !rosters) return;
            const ownerId = allUsers[idx].user_id;
            return rosters.find(r => r.owner_id === ownerId);
        }
        const newRoster = getRosterFromTeamIdx(+teamId);
        if (!newRoster) throw new Error('roster not found');

        setRoster(newRoster);
    }, [rosters, teamId, playerData, allUsers]);

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    function moduleSelectComponent() {
        return (
            <FormControl
                style={{
                    margin: '4px',
                    maxWidth: '800px',
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
                    <MenuItem value={Module.Unspecified} key={'chooseamodule'}>
                        Choose a module:
                    </MenuItem>
                    <MenuItem value={Module.Roster} key={Module.Roster}>
                        Roster
                    </MenuItem>
                    <MenuItem value={Module.Settings} key={Module.Settings}>
                        Settings
                    </MenuItem>
                    <MenuItem
                        value={Module.Cornerstones}
                        key={Module.Cornerstones}
                    >
                        Cornerstones
                    </MenuItem>
                    <MenuItem value={Module.Unified} key={Module.Unified}>
                        Unified
                    </MenuItem>
                    <MenuItem
                        value={Module.SuggestedMoves}
                        key={Module.SuggestedMoves}
                    >
                        Suggested Moves
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }

    return (
        <div>
            {teamSelectComponent(teamId, setTeamId, allUsers, specifiedUser, {
                margin: '4px',
            })}
            {hasTeamId() && moduleSelectComponent()}
            {module === Module.Roster && !!roster && !!rosters && (
                <RosterModule
                    roster={roster}
                    numRosters={rosters.length}
                    teamName={
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }
                />
            )}
            {module === Module.Settings && (
                <SettingsModule
                    leagueId={leagueId}
                    teamName={
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }
                    numRosters={rosters?.length}
                />
            )}
            {module === Module.Cornerstones && (
                <CornerstonesModule
                    roster={roster}
                    teamName={
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }
                />
            )}
            {module === Module.Unified && (
                <UnifiedModule
                    roster={roster}
                    numRosters={rosters?.length}
                    teamName={
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }
                />
            )}
            {module === Module.SuggestedMoves && (
                <SuggestedMovesModule
                    roster={roster}
                    teamName={
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }
                />
            )}
        </div>
    );
}
