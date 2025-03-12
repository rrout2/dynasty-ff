import {useEffect, useState} from 'react';
import {
    useFetchRosters,
    useLeagueIdFromUrl,
    useNonSleeper,
    useParamFromUrl,
    usePlayerData,
    useTeamIdFromUrl,
} from '../../../hooks/hooks';
import {User, Roster, getAllUsers} from '../../../sleeper-api/sleeper-api';
import {TeamSelectComponent} from '../../Team/TeamPage/TeamPage';
import {
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
    TextField,
    Button,
} from '@mui/material';
import {LEAGUE_ID, NONE_TEAM_ID} from '../../../consts/urlParams';
import RosterModule from './modules/RosterModule/RosterModule';
import SettingsModule from './modules/SettingsModule/SettingsModule';
import CornerstonesModule from './modules/CornerstonesModule/CornerstonesModule';
import UnifiedModule from './modules/UnifiedModule/UnifiedModule';
import SuggestedMovesModule from './modules/SuggestedMovesModule/SuggestedMovesModule';
import HoldsModule from './modules/HoldsModule/HoldsModule';
import RisersFallersModule from './modules/RisersFallersModule/RisersFallersModule';
import PositionalGrades from './modules/PositionalGrades/PositionalGrades';
import ThreeYearOutlook from './modules/ThreeYearOutlook/ThreeYearOutlook';
import BigBoy from './modules/BigBoy/BigBoy';
import {NonSleeperInput} from '../shared/NonSleeperInput';

export enum Module {
    Unspecified = 'unspecified',
    Roster = 'roster',
    Settings = 'settings',
    Cornerstones = 'cornerstones',
    SuggestedMoves = 'suggestedmoves',
    Unified = 'unified',
    Holds = 'holds',
    RisersFallers = 'risersfallers',
    PositionalGrades = 'positionalgrades',
    ThreeYearOutlook = 'threeyearoutlook',
    BigBoy = 'bigboy',
}

export default function NewGenerator() {
    const [leagueId, setLeagueId] = useLeagueIdFromUrl();
    const [leagueIdWrapper, setLeagueIdWrapper] = useState(leagueId);
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
        if (!allUsers.length || !hasTeamId() || +teamId >= allUsers.length) {
            return;
        }
        setSpecifiedUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);

    useEffect(() => {
        if (!allUsers.length || !hasTeamId()) return;
        if (+teamId >= allUsers.length) {
            // if the teamId is out of bounds, reset it
            setTeamId('0');
        }
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
        if (+teamId >= allUsers.length) return;
        const newRoster = getRosterFromTeamIdx(+teamId);
        if (!newRoster) throw new Error('roster not found');

        setRoster(newRoster);
    }, [rosters, teamId, playerData, allUsers]);

    const {
        nonSleeperIds,
        setNonSleeperIds,
        nonSleeperRosterSettings,
        setNonSleeperRosterSettings,
        ppr,
        setPpr,
        teBonus,
        setTeBonus,
        numRosters,
        setNumRosters,
        taxiSlots,
        setTaxiSlots,
        teamName,
        setTeamName,
        setSearchParams,
    } = useNonSleeper(rosters, specifiedUser, setRoster);

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
                    <MenuItem value={Module.Unified} key={Module.Unified}>
                        Unified
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

                    <MenuItem
                        value={Module.SuggestedMoves}
                        key={Module.SuggestedMoves}
                    >
                        Suggested Moves
                    </MenuItem>
                    <MenuItem value={Module.Holds} key={Module.Holds}>
                        Holds
                    </MenuItem>
                    <MenuItem
                        value={Module.RisersFallers}
                        key={Module.RisersFallers}
                    >
                        Risers/Fallers
                    </MenuItem>
                    <MenuItem
                        value={Module.PositionalGrades}
                        key={Module.PositionalGrades}
                    >
                        Positional Grades
                    </MenuItem>
                    <MenuItem
                        value={Module.ThreeYearOutlook}
                        key={Module.ThreeYearOutlook}
                    >
                        Three Year Outlook
                    </MenuItem>
                    <MenuItem value={Module.BigBoy} key={Module.BigBoy}>
                        Big Boy
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }

    return (
        <div>
            {!leagueId && (
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={leagueIdWrapper}
                            onChange={e => setLeagueIdWrapper(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    setLeagueId(leagueIdWrapper);
                                }
                            }}
                            label="Sleeper ID"
                        />
                        <Button
                            variant="outlined"
                            onClick={() => setLeagueId(leagueIdWrapper)}
                            disabled={!leagueIdWrapper}
                        >
                            {'submit'}
                        </Button>
                    </div>
                    or
                    <NonSleeperInput
                        nonSleeperIds={nonSleeperIds}
                        setNonSleeperIds={setNonSleeperIds}
                        teamName={teamName}
                        setTeamName={setTeamName}
                        nonSleeperRosterSettings={nonSleeperRosterSettings}
                        setNonSleeperRosterSettings={
                            setNonSleeperRosterSettings
                        }
                        ppr={ppr}
                        setPpr={setPpr}
                        teBonus={teBonus}
                        setTeBonus={setTeBonus}
                        numRosters={numRosters}
                        setNumRosters={setNumRosters}
                        taxiSlots={taxiSlots}
                        setTaxiSlots={setTaxiSlots}
                    />
                </>
            )}
            {!!leagueId && (
                <>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearchParams(searchParams => {
                                searchParams.delete(LEAGUE_ID);
                                return searchParams;
                            });
                            setLeagueIdWrapper('');
                            setLeagueId('');
                        }}
                    >
                        {'New League'}
                    </Button>
                    {
                        <TeamSelectComponent
                            teamId={teamId}
                            setTeamId={setTeamId}
                            allUsers={allUsers}
                            specifiedUser={specifiedUser}
                            style={{
                                margin: '4px',
                            }}
                        />
                    }
                </>
            )}
            {moduleSelectComponent()}
            {module === Module.Roster && !!roster && (
                <RosterModule
                    roster={roster}
                    numRosters={numRosters}
                    teamName={teamName}
                />
            )}
            {module === Module.Settings && (
                <SettingsModule
                    leagueId={leagueId}
                    teamName={teamName}
                    numRosters={numRosters}
                />
            )}
            {module === Module.Cornerstones && (
                <CornerstonesModule roster={roster} teamName={teamName} />
            )}
            {module === Module.Unified && (
                <UnifiedModule
                    roster={roster}
                    numRosters={numRosters}
                    teamName={teamName}
                />
            )}
            {module === Module.SuggestedMoves && (
                <SuggestedMovesModule roster={roster} teamName={teamName} />
            )}
            {module === Module.Holds && (
                <HoldsModule roster={roster} teamName={teamName} />
            )}
            {module === Module.RisersFallers && (
                <RisersFallersModule roster={roster} teamName={teamName} />
            )}
            {module === Module.PositionalGrades && (
                <PositionalGrades
                    teamName={teamName}
                    roster={roster}
                    leagueSize={numRosters}
                />
            )}
            {module === Module.ThreeYearOutlook && (
                <ThreeYearOutlook teamName={teamName} />
            )}
            {module === Module.BigBoy && (
                <BigBoy
                    roster={roster}
                    numRosters={numRosters}
                    teamName={teamName}
                />
            )}
        </div>
    );
}
