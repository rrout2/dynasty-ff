import {useEffect, useState} from 'react';
import {
    blankblueprint,
    outlook1,
    outlook2,
    outlook3,
    silhouette,
} from '../../../../../consts/images';
import {
    useLeagueIdFromUrl,
    useFetchRosters,
    usePlayerData,
    useTeamIdFromUrl,
    useAdpData,
    useLeague,
    useRosterSettings,
} from '../../../../../hooks/hooks';
import {
    Roster,
    User,
    getAllUsers,
} from '../../../../../sleeper-api/sleeper-api';
import ExportButton from '../../shared/ExportButton';
import {useStarters} from '../Starters/useStarters';
import {useSettings} from '../settings/useSettings';
import styles from './BigBoy.module.css';
import {NONE_TEAM_ID} from '../../../../../consts/urlParams';
import {useCornerstone} from '../cornerstone/useCornerstone';
import {useDepthScore} from '../DepthScore/useDepthScore';
import {usePlayersToTarget} from '../playerstotarget/usePlayersToTarget';
import {usePositionalGrades} from '../PositionalGrades/usePositionalGrades';
import {useLookToTrade} from '../looktotrade/useLookToTrade';
import {
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Switch,
} from '@mui/material';
import {
    FLEX,
    WR_RB_FLEX,
    WR_TE_FLEX,
    QB,
    RB,
    WR,
    TE,
    BENCH,
    SUPER_FLEX,
} from '../../../../../consts/fantasy';

enum Archetype {
    HardRebuild = 'HARD REBUILD',
    FutureValue = 'FUTURE VALUE',
    WellRounded = 'WELL ROUNDED',
    OneYearReload = 'ONE YEAR RELOAD',
    EliteValue = 'ELITE VALUE',
    WRFactory = 'WR FACTORY',
    DualEliteQB = 'DUAL ELITE QB',
    EliteQBTE = 'ELITE QB/TE',
    RBHeavy = 'RB HEAVY',
}

const ArchetypeDetails = {
    [Archetype.HardRebuild]: [['REBUILD', 'REBUILD', 'CONTEND']],
    [Archetype.FutureValue]: [['REBUILD', 'CONTEND', 'CONTEND']],
    [Archetype.WellRounded]: [['CONTEND', 'CONTEND', 'REBUILD']],
    [Archetype.OneYearReload]: [['RELOAD', 'CONTEND', 'CONTEND']],
    [Archetype.EliteValue]: [
        ['CONTEND', 'CONTEND', 'RELOAD'],
        ['CONTEND', 'CONTEND', 'CONTEND'],
    ],
    [Archetype.WRFactory]: [
        ['CONTEND', 'CONTEND', 'RELOAD'],
        ['CONTEND', 'CONTEND', 'REBUILD'],
    ],
    [Archetype.DualEliteQB]: [
        ['CONTEND', 'CONTEND', 'RELOAD'],
        ['REBUILD', 'CONTEND', 'CONTEND'],
    ],
    [Archetype.EliteQBTE]: [
        ['CONTEND', 'CONTEND', 'RELOAD'],
        ['REBUILD', 'CONTEND', 'CONTEND'],
    ],
    [Archetype.RBHeavy]: [['CONTEND', 'CONTEND', 'REBUILD']],
};

const ALL_ARCHETYPES = Object.values(Archetype);

export default function BigBoy() {
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const {sortByAdp} = useAdpData();
    const [teamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const playerData = usePlayerData();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [roster, setRoster] = useState<Roster>();
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [showPreview, setShowPreview] = useState(false);
    const [archIdx, setArchIdx] = useState(0);
    const [archetype, setArchetype] = useState(Archetype.HardRebuild);
    useEffect(() => {
        setArchIdx(0);
    }, [archetype]);

    const teamName =
        specifiedUser?.metadata?.team_name ?? specifiedUser?.display_name;

    const {graphicComponent: settingsGraphic} = useSettings(
        rosters?.length ?? 0,
        undefined,
        true
    );
    const {graphicComponent: startersGraphic} = useStarters(
        roster,
        undefined,
        true
    );

    const {graphicComponent: cornerstoneGraphic, allPositionalSelectors} =
        useCornerstone(roster, undefined, true);

    const {
        graphicComponent: depthScoreGraphic,
        overrideComponent: depthScoreOverride,
    } = useDepthScore(roster, undefined, true);

    const {
        graphicComponent: playersToTargetGraphic,
        inputComponent: playersToTargetInput,
    } = usePlayersToTarget(undefined, true);

    const {
        graphicComponent: positionalGradesGraphic,
        overrideComponent: positionalGradesOverride,
    } = usePositionalGrades(roster, undefined, true);

    const {
        graphicComponent: lookToTradeGraphic,
        inputComponent: lookToTradeInput,
    } = useLookToTrade(roster, undefined, true);

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

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    function fullBlueprint() {
        return (
            <div className={styles.fullBlueprint}>
                {settingsGraphicComponent()}
                {startersGraphicComponent()}
                {cornerstoneGraphicComponent()}
                {depthScoreGraphicComponent()}
                {playersToTargetGraphicComponent()}
                {positionalGradesGraphicComponent()}
                {lookToTradeGraphicComponent()}
                {teamNameComponent()}
                {archetypeComponent()}
                {threeYearOutlookComponent()}
                <img src={blankblueprint} className={styles.base} />
            </div>
        );
    }

    function togglePreview() {
        return (
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showPreview}
                            onChange={e => setShowPreview(e.target.checked)}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    }
                    label="Show Preview"
                />
            </FormGroup>
        );
    }

    function settingsGraphicComponent() {
        return <div className={styles.settingsGraphic}>{settingsGraphic}</div>;
    }

    function startersGraphicComponent() {
        return <div className={styles.startersGraphic}>{startersGraphic}</div>;
    }

    function cornerstoneGraphicComponent() {
        return (
            <div className={styles.cornerstoneGraphic}>
                {cornerstoneGraphic}
            </div>
        );
    }

    function depthScoreGraphicComponent() {
        return (
            <div className={styles.depthScoreGraphic}>{depthScoreGraphic}</div>
        );
    }

    function playersToTargetGraphicComponent() {
        return (
            <div className={styles.playersToTargetGraphic}>
                {playersToTargetGraphic}
            </div>
        );
    }

    function positionalGradesGraphicComponent() {
        return (
            <div className={styles.positionalGradesGraphic}>
                {positionalGradesGraphic}
            </div>
        );
    }

    function lookToTradeGraphicComponent() {
        return (
            <div className={styles.lookToTradeGraphic}>
                {lookToTradeGraphic}
            </div>
        );
    }

    function archetypeComponent() {
        return (
            <div>
                <div className={styles.archetypeTitle}>TEAM ARCHETYPE:</div>
                <div className={styles.archetype}>{archetype}</div>
                <img src={silhouette} className={styles.archetypeSilhouette} />
            </div>
        );
    }

    function threeYearOutlookComponent() {
        const idx = ArchetypeDetails[archetype].length <= archIdx ? 0 : archIdx;
        const outlook = ArchetypeDetails[archetype][idx];

        return (
            <div>
                <div className={styles.outlookTitle}>3-YEAR OUTLOOK:</div>
                <div className={styles.outlookImages}>
                    <img src={outlook1} />
                    <img src={outlook2} />
                    <img src={outlook3} />
                </div>
                <div className={styles.outlookChips}>
                    <div className={styles.outlookChip}>
                        <div className={styles.outlookYear}>YR 1</div>
                        <div className={styles.outlookLabel}>{outlook[0]}</div>
                    </div>
                    <div className={styles.outlookChip}>
                        <div className={styles.outlookYear}>YR 2</div>
                        <div className={styles.outlookLabel}>{outlook[1]}</div>
                    </div>
                    <div className={styles.outlookChip}>
                        <div className={styles.outlookYear}>YR 3</div>
                        <div className={styles.outlookLabel}>{outlook[2]}</div>
                    </div>
                </div>
            </div>
        );
    }

    function teamNameComponent() {
        if (!teamName) return <></>;
        const longName = teamName.length >= 16;
        const veryLongName = teamName.length >= 24;
        return (
            <div
                className={`${styles.teamNameGraphic} ${
                    longName ? styles.smallerTeamName : ''
                } ${veryLongName ? styles.smallestTeamName : ''}`}
            >
                {teamName}
            </div>
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

    function inputsComponent() {
        return (
            <>
                <Grid container spacing={1} className={styles.inputGrid}>
                    <Grid item xs={6}>
                        <div className={styles.inputModule}>
                            Cornerstones:
                            {allPositionalSelectors}
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div className={styles.inputModule}>
                            Players to Target:
                            {playersToTargetInput}
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <div className={styles.inputModule}>
                            Positional Grade Override:
                            {positionalGradesOverride}
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <div className={styles.inputModule}>
                            Look to Trade:
                            {lookToTradeInput}
                        </div>
                    </Grid>
                    <Grid item xs={2}>
                        <div className={styles.inputModule}>
                            Depth Score Override:
                            {depthScoreOverride}
                        </div>
                    </Grid>
                    <Grid item xs={4} className={styles.extraInfo}>
                        <div>{rosterComponent()}</div>
                        <div style={{textAlign: 'end'}}>
                            {settingsComponent()}
                        </div>
                    </Grid>
                    <Grid item xs={4}>
                        <div>{archetypeSelector()}</div>
                    </Grid>
                </Grid>
                {togglePreview()}
            </>
        );
    }

    function archetypeSelector() {
        return (
            <>
                <FormControl>
                    <InputLabel>Archetype</InputLabel>
                    <Select
                        value={archetype}
                        label="Archetype"
                        onChange={(event: SelectChangeEvent) => {
                            setArchetype(event.target.value as Archetype);
                        }}
                    >
                        {ALL_ARCHETYPES.map((arch, idx) => (
                            <MenuItem value={arch} key={idx}>
                                {arch}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {ArchetypeDetails[archetype].length > 1 && (
                    <FormControl>
                        <Select
                            value={archIdx.toString()}
                            onChange={(event: SelectChangeEvent) => {
                                setArchIdx(+event.target.value);
                            }}
                        >
                            {ArchetypeDetails[archetype].map((outlook, idx) => (
                                <MenuItem value={idx} key={idx}>
                                    {outlook.join('/')}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </>
        );
    }

    return (
        <div className={styles.BigBoy}>
            <ExportButton
                className={styles.fullBlueprint}
                pngName={`${teamName}_blueprint.png`}
                label="Download Blueprint"
            />
            {inputsComponent()}
            <div className={!showPreview ? styles.offScreen : ''}>
                {fullBlueprint()}
            </div>
        </div>
    );
}