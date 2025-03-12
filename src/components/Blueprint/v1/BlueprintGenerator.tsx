import {useEffect, useState} from 'react';
import {
    useAdpData,
    useFetchRosters,
    useLeague,
    useLeagueIdFromUrl,
    useModuleFromUrl,
    useNonSleeper,
    usePlayerData,
    useProjectedLineup,
    useRosterSettings,
    useTeamIdFromUrl,
    useTitle,
} from '../../../hooks/hooks';
import {Roster, User, getAllUsers} from '../../../sleeper-api/sleeper-api';
import styles from './BlueprintGenerator.module.css';
import {TeamSelectComponent} from '../../Team/TeamPage/TeamPage';
import {LEAGUE_ID, NONE_TEAM_ID} from '../../../consts/urlParams';
import {
    CornerstoneModule,
    GraphicComponent as CornerstoneGraphic,
    AllPositionalSelectors as CornerstoneSelectors,
} from './modules/cornerstone/CornerstoneModule';
import {
    InputLabel,
    SelectChangeEvent,
    FormControl,
    MenuItem,
    Select,
    Grid,
    Button,
    TextField,
} from '@mui/material';
import {
    PlayersToTargetModule,
    GraphicComponent as PlayersToTargetGraphic,
    InputComponent as PlayersToTargetInput,
} from './modules/playerstotarget/PlayersToTargetModule';
import {
    Settings,
    GraphicComponent as SettingsGraphic,
} from './modules/settings/Settings';
import {StartersModule, StartersGraphic} from './modules/Starters/Starters';
import {
    DepthScore,
    GraphicComponent as DepthScoreGraphic,
    OverrideComponent as DepthScoreOverride,
} from './modules/DepthScore/DepthScore';
import ExportButton from '../shared/ExportButton';
import {
    QB,
    RB,
    WR,
    TE,
    BENCH,
    FLEX,
    WR_RB_FLEX,
    WR_TE_FLEX,
    SUPER_FLEX,
    FANTASY_POSITIONS,
} from '../../../consts/fantasy';
import BigBoy from './modules/BigBoy/BigBoy';
import {
    PositionalGrades,
    GraphicComponent as PositionalGradesGraphic,
    OverrideComponent as PositionalGradesOverride,
} from './modules/PositionalGrades/PositionalGrades';
import {
    LookToTradeModule,
    GraphicComponent as LookToTradeGraphic,
    InputComponent as LookToTradeInput,
} from './modules/looktotrade/LookToTradeModule';
import WaiverTargets from './modules/WaiverTargets/WaiverTargets';
import {NonSleeperInput} from '../shared/NonSleeperInput';
export enum Module {
    Unspecified = '',
    Cornerstone = 'cornerstones',
    LookToTrade = 'looktotrade',
    PlayersToTarget = 'playerstotarget',
    Settings = 'settings',
    Starters = 'starters',
    PositionalGrades = 'positionalgrades',
    DepthScore = 'depthscore',
    Unified = 'unified',
    BigBoy = 'bigboy',
    WaiverTargets = 'waivertargets',
}

export default function BlueprintGenerator() {
    const [leagueId, setLeagueId] = useLeagueIdFromUrl();
    const [inputValue, setInputValue] = useState(leagueId);
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [roster, setRoster] = useState<Roster>();
    const league = useLeague(leagueId);
    const playerData = usePlayerData();
    const rosterSettings = useRosterSettings(league);
    const {startingLineup, bench, benchString} = useProjectedLineup(
        rosterSettings,
        roster?.players
    );
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [module, setModule] = useModuleFromUrl();
    const [positionalGradeOverrides, setPositionalGradeOverrides] = useState<
        Map<string, number>
    >(new Map(FANTASY_POSITIONS.map(pos => [pos, -1])));
    const [playersToTrade, setPlayersToTrade] = useState<string[][]>([
        [],
        [],
        [],
    ]);
    const [inReturn, setInReturn] = useState<string[]>([
        'placeholder',
        'placeholder',
        'placeholder',
    ]);
    const [cornerstones, setCornerstones] = useState(
        new Map<string, string[]>(FANTASY_POSITIONS.map(pos => [pos, []]))
    );
    const [depthScoreOverride, setDepthScoreOverride] = useState(-1);
    const {sortByAdp} = useAdpData();

    useEffect(() => {
        if (!allUsers.length || !hasTeamId() || +teamId >= allUsers.length) {
            return;
        }
        setSpecifiedUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);

    useEffect(() => {
        if (!allUsers.length || !hasTeamId()) {
            return;
        }
        if (+teamId >= allUsers.length) {
            // if the teamId is out of bounds, reset it
            setTeamId('0');
        }
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
            allUsers.length === 0 ||
            +teamId >= allUsers.length
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

    const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([
        '10229',
        '5849',
        '4866',
        '10859',
    ]);

    useTitle('Blueprint Generator');
    const isSuperFlex = rosterSettings.has(SUPER_FLEX);

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
                        setModule(event.target.value as Module);
                    }}
                >
                    <MenuItem value={''} key={'chooseamodule'}>
                        Choose a module:
                    </MenuItem>
                    <MenuItem value={Module.Unified} key={'unified'}>
                        Unified
                    </MenuItem>
                    <MenuItem value={Module.BigBoy} key={'bigboy'}>
                        Big Boy
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
                    <MenuItem
                        value={Module.PositionalGrades}
                        key={'positionalgrades'}
                    >
                        Positional Grades
                    </MenuItem>
                    <MenuItem value={Module.DepthScore} key={'depthscore'}>
                        Depth Score
                    </MenuItem>
                    <MenuItem
                        value={Module.WaiverTargets}
                        key={'waivertargets'}
                    >
                        Waiver Targets
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }

    function rosterComponent() {
        if (!playerData) return <></>;
        return roster?.players
            .map(playerId => playerData[playerId])
            .filter(player => !!player)
            .sort(sortByAdp)
            .map(player => {
                return (
                    <div>{`${player.position} - ${player.first_name} ${player.last_name}`}</div>
                );
            });
    }

    function settingsComponent() {
        if (!playerData) return <></>;
        const scoringSettings = league?.scoring_settings;
        if (!scoringSettings) return <></>;
        const wrtFlex = rosterSettings.get(FLEX) ?? 0;
        const wrFlex = rosterSettings.get(WR_RB_FLEX) ?? 0;
        const wtFlex = rosterSettings.get(WR_TE_FLEX) ?? 0;
        return (
            <div>
                <div>QB: {rosterSettings.get(QB)}</div>
                <div>RB: {rosterSettings.get(RB)}</div>
                <div>WR: {rosterSettings.get(WR)}</div>
                <div>TE: {rosterSettings.get(TE)}</div>
                <div>FLEX: {wrtFlex + wrFlex + wtFlex}</div>
                <div>BN: {rosterSettings.get(BENCH)}</div>
                <div>TEAMS: {rosters?.length ?? 0}</div>
                <div>SF: {rosterSettings.has(SUPER_FLEX) ? 'YES' : 'NO'}</div>
                <div>PPR: {scoringSettings.rec ?? 0}</div>
                <div>TEP: {scoringSettings.bonus_rec_te ?? 0}</div>
                <div>TAXI: {league.settings.taxi_slots}</div>
            </div>
        );
    }

    function unifiedView() {
        const hasId = hasTeamId();
        if (!hasId) return <></>;
        return (
            <>
                <div className={styles.offScreen}>
                    <CornerstoneGraphic
                        cornerstones={cornerstones}
                        graphicComponentClass={'cornerstoneGraphic'}
                        transparent={false}
                    />
                    <LookToTradeGraphic
                        inReturn={inReturn}
                        playersToTrade={playersToTrade}
                        graphicComponentClass={'lookToTradeGraphic'}
                        transparent={false}
                    />
                    <PlayersToTargetGraphic
                        playerSuggestions={playerSuggestions}
                        graphicComponentClass={'playersToTargetGraphic'}
                        transparent={false}
                    />
                    <SettingsGraphic
                        numRosters={rosters?.length ?? 0}
                        graphicComponentClass="settingsGraphic"
                        transparent={false}
                    />
                    <StartersGraphic
                        startingLineup={startingLineup}
                        transparent={false}
                        graphicComponentClass={'startersGraphic'}
                    />
                    <PositionalGradesGraphic
                        overrides={positionalGradeOverrides}
                        roster={roster}
                        graphicComponentClass={'positionalGradesGraphic'}
                        transparent={false}
                        isSuperFlex={isSuperFlex}
                        leagueSize={rosters?.length ?? 0}
                    />
                    <DepthScoreGraphic
                        override={depthScoreOverride}
                        graphicComponentClass={'depthScoreGraphic'}
                        transparent={false}
                        bench={bench}
                        benchString={benchString}
                    />
                </div>
                <Grid container spacing={1}>
                    <Grid item xs={6}>
                        <div className={styles.inputModule}>
                            Cornerstones:
                            <CornerstoneSelectors
                                cornerstones={cornerstones}
                                setCornerstones={setCornerstones}
                                roster={roster}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div className={styles.inputModule}>
                            Players to Target:
                            <PlayersToTargetInput
                                playerSuggestions={playerSuggestions}
                                setPlayerSuggestions={setPlayerSuggestions}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div className={styles.inputModule}>
                            Positional Grade Override:
                            <PositionalGradesOverride
                                overrides={positionalGradeOverrides}
                                setOverrides={setPositionalGradeOverrides}
                                isSuperFlex={isSuperFlex}
                                leagueSize={rosters?.length ?? 0}
                                roster={roster}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <div className={styles.inputModule}>
                            Look to Trade:
                            <LookToTradeInput
                                playersToTrade={playersToTrade}
                                setPlayersToTrade={setPlayersToTrade}
                                inReturn={inReturn}
                                setInReturn={setInReturn}
                                roster={roster}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <div className={styles.inputModule}>
                            Depth Score Override:
                            <DepthScoreOverride
                                override={depthScoreOverride}
                                setOverride={setDepthScoreOverride}
                                roster={roster}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={4} className={styles.extraInfo}>
                        <div>{rosterComponent()}</div>
                        <div style={{textAlign: 'end'}}>
                            {settingsComponent()}
                        </div>
                    </Grid>
                </Grid>
            </>
        );
    }

    return (
        <div className={styles.blueprintPage}>
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
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    setLeagueId(inputValue);
                                }
                            }}
                            label="Sleeper ID"
                        />
                        <Button
                            variant="outlined"
                            onClick={() => setLeagueId(inputValue)}
                            disabled={!inputValue}
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
                            setInputValue('');
                            setLeagueId('');
                        }}
                        style={{width: '180px'}}
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
                                maxWidth: '800px',
                            }}
                        />
                    }
                </>
            )}
            {moduleSelectComponent()}
            {module === Module.Unified && (
                <ExportButton
                    className={[
                        'cornerstoneGraphic',
                        'lookToTradeGraphic',
                        'playersToTargetGraphic',
                        'settingsGraphic',
                        'startersGraphic',
                        'positionalGradesGraphic',
                        'depthScoreGraphic',
                    ]}
                    zipName={teamName}
                />
            )}
            {module === Module.Unified && unifiedView()}
            {hasTeamId() && module === Module.Cornerstone && (
                <CornerstoneModule roster={roster} teamName={teamName} />
            )}
            {hasTeamId() && module === Module.LookToTrade && (
                <LookToTradeModule roster={roster} teamName={teamName} />
            )}
            {hasTeamId() && module === Module.PlayersToTarget && (
                <PlayersToTargetModule teamName={teamName} />
            )}
            {hasTeamId() && module === Module.Settings && (
                <Settings
                    roster={roster}
                    leagueId={leagueId}
                    numRosters={rosters?.length ?? 0}
                    teamName={teamName}
                />
            )}
            {hasTeamId() && module === Module.Starters && (
                <StartersModule roster={roster} teamName={teamName} />
            )}
            {hasTeamId() && module === Module.PositionalGrades && (
                <PositionalGrades
                    roster={roster}
                    teamName={teamName}
                    isSuperFlex={isSuperFlex}
                    leagueSize={rosters?.length ?? 0}
                />
            )}
            {hasTeamId() && module === Module.DepthScore && (
                <DepthScore roster={roster} teamName={teamName} />
            )}
            {module === Module.BigBoy && (
                <BigBoy
                    roster={roster}
                    teamName={teamName}
                    numRosters={numRosters}
                />
            )}
            {hasTeamId() && module === Module.WaiverTargets && (
                <WaiverTargets />
            )}
        </div>
    );
}
