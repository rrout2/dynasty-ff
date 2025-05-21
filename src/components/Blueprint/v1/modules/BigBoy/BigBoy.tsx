import {SetStateAction, useEffect, useState} from 'react';
import {
    blankRedraftBp,
    blankblueprint,
    circleSlider,
    draftCapitalBackground,
    draftCapitalScale,
    outlook1,
    outlook2,
    outlook3,
    rebuildContendScale,
    riskSafetyScale,
    silhouette,
} from '../../../../../consts/images';
import {
    useLeagueIdFromUrl,
    useFetchRosters,
    usePlayerData,
    useAdpData,
    useLeague,
    useProjectedLineup,
    useRosterSettingsFromId,
    useArchetype,
    useGetPicks,
} from '../../../../../hooks/hooks';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import ExportButton from '../../../shared/ExportButton';
import styles from './BigBoy.module.css';
import rookieDraftStyles from '../../../rookieDraft/RookieDraft/RookieDraft.module.css';
import {
    Button,
    FormControl,
    FormControlLabel,
    FormGroup,
    Grid2,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Switch,
    TextField,
    Tooltip,
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
    FANTASY_POSITIONS,
} from '../../../../../consts/fantasy';
import {
    GraphicComponent as PositionalGradesGraphic,
    OverrideComponent as PositionalGradesOverride,
} from '../PositionalGrades/PositionalGrades';
import {
    GraphicComponent as WaiverTargetsGraphic,
    InputComponent as WaiverTargetsInput,
} from '../WaiverTargets/WaiverTargets';
import {
    GraphicComponent as LookToTradeGraphic,
    InputComponent as LookToTradeInput,
} from '../looktotrade/LookToTradeModule';
import {
    GraphicComponent as CornerstoneGraphic,
    AllPositionalSelectors as CornerstoneSelectors,
} from '../cornerstone/CornerstoneModule';
import {
    StartersGraphic,
    InputComponent as StartersInput,
} from '../Starters/Starters';
import {
    GraphicComponent as DepthScoreGraphic,
    OverrideComponent as DepthScoreOverride,
} from '../DepthScore/DepthScore';
import {
    GraphicComponent as SettingsGraphic,
    InputComponent as SettingsInput,
} from '../settings/Settings';
import {
    GraphicComponent as PlayersToTargetGraphic,
    InputComponent as PlayersToTargetInput,
} from '../playerstotarget/PlayersToTargetModule';
import StyledNumberInput from '../../../shared/StyledNumberInput';
import {useSearchParams} from 'react-router-dom';
import {
    ARCHETYPE,
    COMMENTS,
    CORNERSTONES,
    DEPTH_SCORE_OVERRIDE,
    DRAFT_CAPITAL_NOTES,
    DRAFT_CAPITAL_VALUE,
    IN_RETURN,
    OTHER_SETTINGS,
    OUTLOOK,
    PLAYERS_TO_TARGET,
    PLAYERS_TO_TRADE,
    POSITIONAL_GRADE_OVERRIDES,
    REBUILD_CONTEND_VALUE,
    STARTING_LINEUP,
    WAIVER_TARGETS,
} from '../../../../../consts/urlParams';
import {
    DraftPick,
    RookieDraftGraphic,
    RookieDraftInputs,
    sortDraftPicks,
    useRookieDraft,
    Verdict,
} from '../../../rookieDraft/RookieDraft/RookieDraft';
import {getPositionalOrder} from '../../../infinite/BuySellHold/BuySellHold';
import {
    dualEliteQb,
    eliteQbTe,
    eliteValue,
    futureValue,
    hardRebuild,
    oneYearReload,
    rbHeavy,
    wellRounded,
    wrFactory,
} from '../../../../../consts/images';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import {CURRENT_SEASON} from '../../../../../sleeper-api/picks';

export enum Archetype {
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

export const ARCHETYPE_TO_IMAGE: Map<Archetype, string> = new Map([
    [Archetype.DualEliteQB, dualEliteQb],
    [Archetype.EliteQBTE, eliteQbTe],
    [Archetype.EliteValue, eliteValue],
    [Archetype.FutureValue, futureValue],
    [Archetype.HardRebuild, hardRebuild],
    [Archetype.OneYearReload, oneYearReload],
    [Archetype.RBHeavy, rbHeavy],
    [Archetype.WellRounded, wellRounded],
    [Archetype.WRFactory, wrFactory],
]);

export const ArchetypeDetails = {
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

interface BigBoyProps {
    roster?: Roster;
    teamName?: string;
    numRosters?: number;
}

export default function BigBoy({roster, teamName, numRosters}: BigBoyProps) {
    const [leagueId] = useLeagueIdFromUrl();
    const {myPicks} = useGetPicks(leagueId, roster?.owner_id);
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettingsFromId(leagueId);
    const {sortByAdp, getAdp, getPositionalAdp} = useAdpData();
    const {data: rosters} = useFetchRosters(leagueId);
    const playerData = usePlayerData();
    const {startingLineup, setStartingLineup, bench, benchString} =
        useProjectedLineup(rosterSettings, roster?.players);
    const [showPreview, setShowPreview] = useState(false);
    const [showRookieBP, setShowRookieBP] = useState(false);
    const [isRedraft, setIsRedraft] = useState(false);
    const [rebuildContendValue, setRebuildContendValue] = useState(50);
    const [draftCapitalValue, setDraftCapitalValue] = useState(5);
    const [draftCapitalNotes, setDraftCapitalNotes] = useState('placeholder');
    const [comments, setComments] = useState<string[]>([
        'comment 1',
        'comment 2',
        'comment 3',
    ]);
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
    function isCornerstone(player?: Player) {
        if (!player) return false;
        const adp = getAdp(`${player.first_name} ${player.last_name}`);
        return adp <= 75 && adp >= 0;
    }

    useEffect(() => {
        if (!roster || !playerData) return;

        const cornerstones = roster.players
            .map(playerId => playerData[playerId])
            .filter(isCornerstone)
            .sort(sortByAdp);

        setCornerstones(
            new Map<string, string[]>(
                FANTASY_POSITIONS.map(pos => [
                    pos,
                    cornerstones
                        .filter(player =>
                            player.fantasy_positions.includes(pos)
                        )
                        .map(player => player.player_id)
                        .slice(0, 3),
                ])
            )
        );
    }, [roster, playerData]);
    const [depthScoreOverride, setDepthScoreOverride] = useState(-1);

    const [outlooks, setOutlooks] = useState<string[]>([]);
    const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([
        '10229',
        '5849',
        '4866',
        '10859',
    ]);

    const [otherSettings, setOtherSettings] = useState('');
    const [waiverTarget, setWaiverTarget] = useState<string>('');

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (!playerData || !searchParams.get(STARTING_LINEUP)) return;
        // not sure why this is necessary
        setTimeout(loadFromUrl, 200);
    }, [playerData, searchParams]);

    const {
        draftPicks,
        setDraftPicks,
        rookieTargets,
        setRookieTargets,
        draftStrategy,
        setDraftStrategy,
        qbGrade,
        rbGrade,
        wrGrade,
        teGrade,
        autoPopulatedDraftStrategy,
        setAutoPopulatedDraftStrategy,
        sortByRookieRank,
    } = useRookieDraft();
    useEffect(() => {
        if (myPicks.length === 0) return;
        const picks: DraftPick[] = myPicks
            .filter(pick => pick.season === CURRENT_SEASON)
            .map(pick => {
                return {
                    round: pick.round,
                    pick: pick.slot,
                    verdict: Verdict.None,
                };
            });
        while (picks.length < 4) {
            picks.push({round: '', pick: '', verdict: Verdict.None});
        }
        setDraftPicks(picks);
    }, [myPicks]);
    const isSuperFlex = rosterSettings.has(SUPER_FLEX);
    const {archetype, setArchetype} = useArchetype(
        qbGrade,
        rbGrade,
        wrGrade,
        teGrade,
        isSuperFlex
    );
    useEffect(() => {
        setOutlooks(ArchetypeDetails[archetype][0]);
    }, [archetype]);
    const [additionalDraftNotes, setAdditionalDraftNotes] = useState('');
    useEffect(() => {
        if (!draftPicks || !setDraftCapitalNotes || myPicks.length === 0)
            return;
        const nextYearPicks = myPicks.filter(p => p.season === '2026');
        const numFirsts = nextYearPicks.filter(p => p.round === 1).length;
        const numSeconds = nextYearPicks.filter(p => p.round === 2).length;
        const numThirds = nextYearPicks.filter(p => p.round === 3).length;
        const numFourths = nextYearPicks.filter(p => p.round === 4).length;
        const nextYearInfo = `2026: ${numFirsts} 1st${
            numFirsts !== 1 ? 's' : ''
        }, ${numSeconds} 2nd${numSeconds !== 1 ? 's' : ''}, ${numThirds} 3rd${
            numThirds !== 1 ? 's' : ''
        }, ${numFourths} 4th${numFourths !== 1 ? 's' : ''}`;
        setAdditionalDraftNotes(nextYearInfo);
    }, [draftPicks, myPicks]);
    useEffect(() => {
        const thisYearInfo = draftPicks
            .filter(
                draftPick => draftPick.round !== '' && draftPick.pick !== ''
            )
            .map(draftPick => {
                return `${draftPick.round}.${
                    draftPick.pick && draftPick.pick < 10 ? '0' : ''
                }${draftPick.pick}`;
            })
            .join(', ');
        setDraftCapitalNotes(
            `${thisYearInfo}${
                thisYearInfo.length && additionalDraftNotes.length ? '; ' : ''
            }${additionalDraftNotes}`
        );
    }, [draftPicks, additionalDraftNotes]);

    function shortenOutlook(outlook: string) {
        switch (outlook) {
            case 'REBUILD':
                return 'R';
            case 'CONTEND':
                return 'C';
            case 'RELOAD':
                return 'O';
            default:
                return '?';
        }
    }

    function expandOutlook(outlook: string) {
        switch (outlook) {
            case 'R':
                return 'REBUILD';
            case 'C':
                return 'CONTEND';
            case 'O':
                return 'RELOAD';
            default:
                return '';
        }
    }

    function saveToUrl() {
        setSearchParams(searchParams => {
            searchParams.set(OTHER_SETTINGS, otherSettings);
            searchParams.set(PLAYERS_TO_TARGET, playerSuggestions.join('-'));
            searchParams.set(ARCHETYPE, archetype);
            searchParams.set(OUTLOOK, outlooks.map(shortenOutlook).join('-'));
            if (depthScoreOverride > 0) {
                searchParams.set(
                    DEPTH_SCORE_OVERRIDE,
                    depthScoreOverride.toString()
                );
            }
            const cornerstoneList: string[] = [];
            for (const [pos, starters] of Array.from(cornerstones.entries())) {
                cornerstoneList.push(pos);
                cornerstoneList.push(...starters);
            }
            searchParams.set(CORNERSTONES, cornerstoneList.join('-'));
            playersToTrade.forEach((players, idx) => {
                searchParams.set(
                    `${PLAYERS_TO_TRADE}_${idx}`,
                    players.filter(p => !!p).join('-')
                );
            });
            searchParams.set(IN_RETURN, inReturn.join('-'));
            searchParams.set(DRAFT_CAPITAL_NOTES, draftCapitalNotes);
            searchParams.set(DRAFT_CAPITAL_VALUE, draftCapitalValue.toString());
            searchParams.set(
                REBUILD_CONTEND_VALUE,
                rebuildContendValue.toString()
            );
            searchParams.set(
                POSITIONAL_GRADE_OVERRIDES,
                Array.from(positionalGradeOverrides.entries()).flat().join('-')
            );
            searchParams.set(
                STARTING_LINEUP,
                startingLineup
                    .reduce((acc: string[], curr) => {
                        acc.push(curr.player.player_id);
                        acc.push(curr.position);
                        return acc;
                    }, [])
                    .join('-')
            );

            searchParams.set(WAIVER_TARGETS, waiverTarget);

            searchParams.set(COMMENTS, comments.join('-'));

            return searchParams;
        });
    }

    function clearUrlSave() {
        setSearchParams(searchParams => {
            searchParams.delete(OTHER_SETTINGS);
            searchParams.delete(PLAYERS_TO_TARGET);
            searchParams.delete(ARCHETYPE);
            searchParams.delete(OUTLOOK);
            searchParams.delete(DEPTH_SCORE_OVERRIDE);
            searchParams.delete(CORNERSTONES);
            for (let i = 0; i < 3; i++) {
                searchParams.delete(`${PLAYERS_TO_TRADE}_${i}`);
            }
            searchParams.delete(IN_RETURN);
            searchParams.delete(DRAFT_CAPITAL_NOTES);
            searchParams.delete(DRAFT_CAPITAL_VALUE);
            searchParams.delete(REBUILD_CONTEND_VALUE);
            searchParams.delete(POSITIONAL_GRADE_OVERRIDES);
            searchParams.delete(STARTING_LINEUP);
            searchParams.delete(WAIVER_TARGETS);
            searchParams.delete(COMMENTS);
            return searchParams;
        });
    }

    /**
     * Combines "RP" with the following player ID in the array. This is necessary
     * because the URL params are split by "-" and "RP-2025" is a valid player ID.
     *
     * @param splitTargets The array of strings to combine
     * @returns The modified array
     */
    function combineHangingRp(splitTargets: string[]) {
        const newSplit = [];
        for (let i = 0; i < splitTargets.length; i++) {
            if (splitTargets[i] === 'RP') {
                newSplit.push(`RP-${splitTargets[i + 1]}`);
                i++;
            } else {
                newSplit.push(splitTargets[i]);
            }
        }
        return newSplit;
    }

    function loadFromUrl() {
        setOtherSettings(searchParams.get(OTHER_SETTINGS) || '');
        setPlayerSuggestions(
            combineHangingRp(
                (searchParams.get(PLAYERS_TO_TARGET) || '').split('-')
            )
        );
        setArchetype(
            (searchParams.get(ARCHETYPE) as Archetype) || Archetype.HardRebuild
        );
        setOutlooks(
            (searchParams.get(OUTLOOK) || '').split('-').map(expandOutlook)
        );

        const depthScoreOverride = searchParams.get(DEPTH_SCORE_OVERRIDE);
        if (depthScoreOverride) {
            setDepthScoreOverride(+depthScoreOverride);
        }

        loadCornerstones();

        playersToTrade.forEach((_, idx) => {
            setPlayersToTrade(prev => {
                prev[idx] = (
                    searchParams.get(`${PLAYERS_TO_TRADE}_${idx}`) || ''
                ).split('-');
                return prev;
            });
        });
        setInReturn((searchParams.get(IN_RETURN) || '').split('-'));
        setDraftCapitalNotes(searchParams.get(DRAFT_CAPITAL_NOTES) || '');
        setDraftCapitalValue(+(searchParams.get(DRAFT_CAPITAL_VALUE) || '0'));
        setRebuildContendValue(
            +(searchParams.get(REBUILD_CONTEND_VALUE) || '0')
        );

        loadPosGrades();
        loadStartingLineup();

        setWaiverTarget(searchParams.get(WAIVER_TARGETS) || '');
        setComments((searchParams.get(COMMENTS) || '').split('-'));
    }
    function loadCornerstones() {
        const hyphenSeparatedCornerstones = (
            searchParams.get(CORNERSTONES) || ''
        ).split('-');
        const loadedCornerstones = new Map<string, string[]>();
        let mostRecentVal = '';
        for (const val of hyphenSeparatedCornerstones) {
            if (FANTASY_POSITIONS.includes(val)) {
                loadedCornerstones.set(val, []);
                mostRecentVal = val;
            } else {
                loadedCornerstones.get(mostRecentVal)!.push(val);
            }
        }
        setCornerstones(loadedCornerstones);
    }

    function loadPosGrades() {
        const loadedPositionalGrades: Map<string, number> = new Map();
        const hyphenSeparatedPosGrades = (
            searchParams.get(POSITIONAL_GRADE_OVERRIDES) || ''
        ).split('-');
        hyphenSeparatedPosGrades.forEach((str, idx) => {
            if (!FANTASY_POSITIONS.includes(str)) return;

            let override = 0;
            if (hyphenSeparatedPosGrades[idx + 1] === '') {
                // means that the value is negative, since we separate by hyphen
                override = -hyphenSeparatedPosGrades[idx + 2];
            } else {
                override = +hyphenSeparatedPosGrades[idx + 1];
            }
            loadedPositionalGrades.set(
                str,
                override || positionalGradeOverrides.get(str)!
            );
        });
        setPositionalGradeOverrides(loadedPositionalGrades);
    }

    function loadStartingLineup() {
        const loadedStartingLineup: {player: Player; position: string}[] = [];
        const hyphenSeparatedStartingLineup = (
            searchParams.get(STARTING_LINEUP) || ''
        ).split('-');
        for (let i = 0; i < hyphenSeparatedStartingLineup.length; i += 2) {
            loadedStartingLineup.push({
                player: playerData![hyphenSeparatedStartingLineup[i]],
                position: hyphenSeparatedStartingLineup[i + 1],
            });
        }

        setStartingLineup(loadedStartingLineup);
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
                {isRedraft ? (
                    <div className={styles.waiverTargetsGraphic}>
                        <WaiverTargetsGraphic target={waiverTarget} />
                    </div>
                ) : (
                    threeYearOutlookComponent()
                )}
                {contendRebuildScaleComponent()}
                {draftCapitalGradeComponent()}
                {commentsComponent()}
                <img
                    src={isRedraft ? blankRedraftBp : blankblueprint}
                    className={styles.base}
                />
            </div>
        );
    }

    function commentsInput() {
        return (
            <div className={styles.inputModule}>
                Suggestions/Comments:
                {comments.map((comment, idx) => {
                    return (
                        <TextField
                            style={{margin: '4px'}}
                            key={idx}
                            value={comment}
                            onChange={e => {
                                const newComments = comments.slice();
                                newComments[idx] = e.target.value;
                                setComments(newComments);
                            }}
                        />
                    );
                })}
            </div>
        );
    }

    function commentsComponent() {
        return (
            <ul className={styles.commentsGraphic}>
                {comments.map((c, idx) => {
                    return <li key={idx}>{c}</li>;
                })}
            </ul>
        );
    }

    function draftCapitalGradeComponent() {
        return (
            <div className={styles.draftCapitalGradeGraphic}>
                <div className={styles.scaleAndSlider}>
                    <img src={draftCapitalScale} />
                    <img
                        src={circleSlider}
                        className={styles.otherSlider}
                        style={{left: `${draftCapitalValue * 78}px`}}
                    />
                </div>
                <div className={styles.draftCapitalBackground}>
                    <img src={draftCapitalBackground} />
                </div>
                <div className={styles.draftCapitalText}>
                    {draftCapitalNotes.toUpperCase()}
                </div>
            </div>
        );
    }

    function draftCapitalGradeInput() {
        return (
            <StyledNumberInput
                value={draftCapitalValue}
                onChange={(_, value) => {
                    setDraftCapitalValue(value || 0);
                }}
                min={0}
                max={10}
            />
        );
    }
    function teamGradeNotesInput() {
        return (
            <TextField
                style={{margin: '4px'}}
                label={'Team Grade Notes'}
                value={draftCapitalNotes}
                onChange={e => setDraftCapitalNotes(e.target.value)}
            />
        );
    }
    function contendRebuildScaleComponent() {
        return (
            <div className={styles.rebuildContendScaleGraphic}>
                <div className={styles.scaleAndSlider}>
                    <img
                        src={isRedraft ? riskSafetyScale : rebuildContendScale}
                    />
                    <img
                        src={circleSlider}
                        className={styles.slider}
                        style={{left: `${rebuildContendValue * 5.45}px`}}
                    />
                </div>
            </div>
        );
    }

    function contendRebuildScaleInput() {
        return (
            <StyledNumberInput
                value={rebuildContendValue}
                onChange={(_, value) => {
                    setRebuildContendValue(value || 0);
                }}
                min={0}
                max={100}
            />
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
    function ToggleShowRookieBP() {
        return (
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showRookieBP}
                            onChange={e => setShowRookieBP(e.target.checked)}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    }
                    label="Show Rookie BP?"
                />
            </FormGroup>
        );
    }

    function ToggleRedraft() {
        return (
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isRedraft}
                            onChange={e => setIsRedraft(e.target.checked)}
                            inputProps={{'aria-label': 'controlled'}}
                        />
                    }
                    label="Redraft?"
                />
            </FormGroup>
        );
    }

    function settingsGraphicComponent() {
        return (
            <div className={styles.settingsGraphic}>
                <SettingsGraphic
                    numRosters={numRosters ?? 0}
                    otherSettings={otherSettings}
                    transparent={true}
                />
            </div>
        );
    }

    function startersGraphicComponent() {
        return (
            <div className={styles.startersGraphic}>
                <StartersGraphic
                    startingLineup={startingLineup}
                    transparent={true}
                />
            </div>
        );
    }

    function cornerstoneGraphicComponent() {
        return (
            <div className={styles.cornerstoneGraphic}>
                <CornerstoneGraphic
                    cornerstones={cornerstones}
                    transparent={true}
                />
            </div>
        );
    }

    function depthScoreGraphicComponent() {
        return (
            <div className={styles.depthScoreGraphic}>
                <DepthScoreGraphic
                    override={depthScoreOverride}
                    transparent={true}
                    bench={bench}
                    benchString={benchString}
                />
            </div>
        );
    }

    function playersToTargetGraphicComponent() {
        return (
            <div className={styles.playersToTargetGraphic}>
                <PlayersToTargetGraphic
                    playerSuggestions={playerSuggestions}
                    transparent={true}
                />
            </div>
        );
    }

    function positionalGradesGraphicComponent() {
        return (
            <div className={styles.positionalGradesGraphic}>
                <PositionalGradesGraphic
                    overrides={positionalGradeOverrides}
                    roster={roster}
                    transparent={true}
                    isSuperFlex={isSuperFlex}
                    leagueSize={rosters?.length ?? 0}
                />
            </div>
        );
    }

    function lookToTradeGraphicComponent() {
        return (
            <div className={styles.lookToTradeGraphic}>
                <LookToTradeGraphic
                    inReturn={inReturn}
                    playersToTrade={playersToTrade}
                    transparent={true}
                />
            </div>
        );
    }

    function archetypeComponent() {
        return (
            <div>
                {!isRedraft && (
                    <div className={styles.archetypeTitle}>
                        {'TEAM ARCHETYPE:'}
                    </div>
                )}
                <div className={styles.archetype}>{archetype}</div>
                <img src={silhouette} className={styles.archetypeSilhouette} />
            </div>
        );
    }

    function threeYearOutlookComponent() {
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
                        <div className={styles.outlookLabel}>{outlooks[0]}</div>
                    </div>
                    <div className={styles.outlookChip}>
                        <div className={styles.outlookYear}>YR 2</div>
                        <div className={styles.outlookLabel}>{outlooks[1]}</div>
                    </div>
                    <div className={styles.outlookChip}>
                        <div className={styles.outlookYear}>YR 3</div>
                        <div className={styles.outlookLabel}>{outlooks[2]}</div>
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
        const allPlayers = roster?.players
            .map(playerId => playerData[playerId])
            .sort(sortByAdp);
        if (!allPlayers) return <></>;

        return (
            <div className={styles.fullRoster}>
                {FANTASY_POSITIONS.map(pos => (
                    <div className={styles.positionColumn} key={pos}>
                        <b>{pos}</b>
                        {allPlayers
                            .filter(
                                player => !!player && player.position === pos
                            )
                            .map((player, idx) => {
                                const fullName = `${player.first_name} ${player.last_name}`;
                                const positionalAdp =
                                    getPositionalAdp(fullName);
                                return (
                                    <div
                                        className={styles.rosterPlayer}
                                        key={idx}
                                    >
                                        <div>{fullName}</div>
                                        <div>
                                            {positionalAdp === Infinity
                                                ? '∞'
                                                : positionalAdp}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ))}
            </div>
        );
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
                <SettingsInput
                    otherSettings={otherSettings}
                    setOtherSettings={setOtherSettings}
                />
            </div>
        );
    }

    function inputsComponent() {
        return (
            <>
                <Grid2 container spacing={1} className={styles.inputGrid}>
                    <Grid2 size={8}>
                        <div>{rosterComponent()}</div>
                    </Grid2>
                    <Grid2 size={2.5}>
                        <div className={styles.inputModule}>
                            Positional Grade Override:
                            <PositionalGradesOverride
                                overrides={positionalGradeOverrides}
                                setOverrides={setPositionalGradeOverrides}
                                roster={roster}
                                isSuperFlex={isSuperFlex}
                                leagueSize={rosters?.length ?? 0}
                            />
                        </div>
                    </Grid2>
                    <Grid2 size={1.5} className={styles.extraInfo}>
                        <div style={{textAlign: 'end', maxWidth: '120px'}}>
                            {settingsComponent()}
                        </div>
                    </Grid2>
                    <Grid2 size={6}>
                        <div className={styles.inputModule}>
                            Cornerstones:
                            <CornerstoneSelectors
                                cornerstones={cornerstones}
                                setCornerstones={setCornerstones}
                                roster={roster}
                            />
                        </div>
                    </Grid2>
                    <Grid2 size={2}>
                        <div className={styles.inputModule}>
                            Depth Score Override:
                            <DepthScoreOverride
                                override={depthScoreOverride}
                                setOverride={setDepthScoreOverride}
                                roster={roster}
                            />
                        </div>
                    </Grid2>
                    <Grid2 size={4}>
                        <div>{archetypeSelector()}</div>
                    </Grid2>
                    <Grid2 size={4}>
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
                    </Grid2>
                    <Grid2 size={3}>
                        <div className={styles.inputModule}>
                            Players to Target:
                            <PlayersToTargetInput
                                playerSuggestions={playerSuggestions}
                                setPlayerSuggestions={setPlayerSuggestions}
                            />
                        </div>
                    </Grid2>
                    <Grid2 size={2.5}>
                        {isRedraft
                            ? 'Risk(0) - Safety(100)'
                            : 'Rebuild(0) - Contend(100)'}
                        <div>{contendRebuildScaleInput()}</div>
                        {isRedraft
                            ? 'Overall Team Grade'
                            : 'Draft Capital Grade'}
                        <div>{draftCapitalGradeInput()}</div>
                        {!isRedraft && (
                            <DraftCapitalInput
                                draftPicks={draftPicks}
                                setDraftPicks={setDraftPicks}
                                additionalDraftNotes={additionalDraftNotes}
                                setAdditionalDraftNotes={
                                    setAdditionalDraftNotes
                                }
                            />
                        )}
                        {isRedraft && teamGradeNotesInput()}
                        {commentsInput()}
                    </Grid2>
                    <Grid2 size={2.5}>
                        <div className={styles.inputModule}>
                            Starters:
                            <StartersInput
                                startingLineup={startingLineup}
                                setStartingLineup={setStartingLineup}
                                roster={roster}
                            />
                        </div>
                    </Grid2>
                    <Grid2 size={12}>
                        <RookieDraftInputs
                            draftPicks={draftPicks}
                            setDraftPicks={setDraftPicks}
                            rookieTargets={rookieTargets}
                            setRookieTargets={setRookieTargets}
                            draftStrategy={draftStrategy}
                            setDraftStrategy={setDraftStrategy}
                            autoPopulatedDraftStrategy={
                                autoPopulatedDraftStrategy
                            }
                            setAutoPopulatedDraftStrategy={
                                setAutoPopulatedDraftStrategy
                            }
                            sortByRookieRank={sortByRookieRank}
                        />
                    </Grid2>
                </Grid2>
            </>
        );
    }

    function archetypeSelector() {
        if (outlooks.length === 0) return <></>;
        return (
            <div className={styles.inputModule}>
                <FormControl style={{margin: '4px'}}>
                    <InputLabel>
                        {isRedraft ? 'Team Build' : 'Archetype'}
                    </InputLabel>
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
                {!isRedraft &&
                    [0, 1, 2].map(idx => (
                        <FormControl style={{margin: '4px'}} key={idx}>
                            <InputLabel>Year {idx + 1}</InputLabel>
                            <Select
                                label={`Year ${idx + 1}`}
                                value={outlooks[idx]}
                                onChange={(event: SelectChangeEvent) => {
                                    const newOutlooks = outlooks.slice();
                                    newOutlooks[idx] = event.target.value;
                                    setOutlooks(newOutlooks);
                                }}
                            >
                                <MenuItem value={'CONTEND'} key={'CONTEND'}>
                                    {'CONTEND'}
                                </MenuItem>
                                <MenuItem value={'REBUILD'} key={'REBUILD'}>
                                    {'REBUILD'}
                                </MenuItem>

                                <MenuItem value={'RELOAD'} key={'RELOAD'}>
                                    {'RELOAD'}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    ))}
                {isRedraft && (
                    <WaiverTargetsInput
                        target={waiverTarget}
                        setTarget={setWaiverTarget}
                    />
                )}
            </div>
        );
    }
    const qbOverride = positionalGradeOverrides.get(QB) || -1;
    const rbOverride = positionalGradeOverrides.get(RB) || -1;
    const wrOverride = positionalGradeOverrides.get(WR) || -1;
    const teOverride = positionalGradeOverrides.get(TE) || -1;
    const rookieDraftGraphic = (
        <RookieDraftGraphic
            archetype={archetype}
            teamName={teamName || ''}
            outlooks={outlooks}
            teamNeeds={getPositionalOrder({
                qbGrade: qbOverride > -1 ? qbOverride : qbGrade,
                rbGrade: rbOverride > -1 ? rbOverride : rbGrade,
                wrGrade: wrOverride > -1 ? wrOverride : wrGrade,
                teGrade: teOverride > -1 ? teOverride : teGrade,
            })}
            draftPicks={draftPicks}
            rookieTargets={rookieTargets}
            draftStrategy={draftStrategy}
            draftCapitalScore={draftCapitalValue}
        />
    );

    return (
        <div className={styles.BigBoy}>
            <ExportButton
                className={styles.fullBlueprint}
                pngName={`${teamName}_blueprint.png`}
                label="Download Blueprint"
            />
            <ExportButton
                className={[
                    styles.fullBlueprint,
                    rookieDraftStyles.rookieDraftGraphic,
                ]}
                zipName={`${teamName}_blueprint.zip`}
                label="Download v1 BP & Rookie Draft BP"
            />
            <Tooltip title="Save to URL">
                <Button variant={'outlined'} onClick={saveToUrl}>
                    {'Save'}
                </Button>
            </Tooltip>
            <Tooltip title="Clear Save from URL">
                <Button
                    variant={'outlined'}
                    onClick={clearUrlSave}
                    disabled={!searchParams.get(STARTING_LINEUP)}
                >
                    {'Clear'}
                </Button>
            </Tooltip>
            {togglePreview()}
            <ToggleShowRookieBP />
            <ToggleRedraft />
            <div className={styles.inputsAndPreview}>
                {inputsComponent()}
                {
                    <div className={styles.smaller}>
                        {showPreview && fullBlueprint()}
                        {showRookieBP && rookieDraftGraphic}
                    </div>
                }
            </div>
            <div className={styles.offScreen}>{fullBlueprint()}</div>
            <div className={styles.offScreen}>{rookieDraftGraphic}</div>
        </div>
    );
}

type DraftCapitalInputProps = {
    draftPicks: DraftPick[];
    setDraftPicks: (value: SetStateAction<DraftPick[]>) => void;
    additionalDraftNotes?: string;
    setAdditionalDraftNotes?: (value: SetStateAction<string>) => void;
};

export function DraftCapitalInput({
    draftPicks,
    setDraftPicks,
    additionalDraftNotes,
    setAdditionalDraftNotes,
}: DraftCapitalInputProps) {
    const rounds = [...Array(5).keys()].map(x => x + 1);
    const picks = [...Array(24).keys()].map(x => x + 1);
    return (
        <div className={styles.addRemovePickButtons}>
            <Button
                variant="outlined"
                onClick={() => {
                    setDraftPicks((oldDraftPicks: DraftPick[]) => {
                        return [
                            ...oldDraftPicks,
                            {
                                round: '',
                                pick: '',
                                verdict: Verdict.None,
                            } as DraftPick,
                        ].sort(sortDraftPicks);
                    });
                }}
                endIcon={<Add />}
            >
                Add Pick
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                    setDraftPicks((oldDraftPicks: DraftPick[]) => {
                        return oldDraftPicks.slice(0, -1).sort(sortDraftPicks);
                    });
                }}
                disabled={draftPicks.length <= 4}
                endIcon={<Remove />}
            >
                Remove Pick
            </Button>

            {draftPicks.map((draftPick, idx) => (
                <div
                    key={idx}
                    style={{
                        display: 'flex',
                        gap: '4px',
                    }}
                >
                    <FormControl key={`${idx} round`} style={{flex: '1'}}>
                        <InputLabel>Rnd {idx + 1}</InputLabel>
                        <Select
                            label={`Rnd ${idx + 1}`}
                            value={draftPick.round.toString()}
                            onChange={(event: SelectChangeEvent) => {
                                const newDraftPicks = draftPicks.slice();
                                if (event.target.value === '') {
                                    newDraftPicks[idx].round = '';
                                } else {
                                    newDraftPicks[idx].round =
                                        +event.target.value;
                                }
                                setDraftPicks(
                                    newDraftPicks.sort(sortDraftPicks)
                                );
                            }}
                        >
                            <MenuItem value={''} key={''}>
                                Choose a round:
                            </MenuItem>
                            {rounds.map(round => (
                                <MenuItem value={round} key={round}>
                                    {round}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl key={`${idx} pick`} style={{flex: '1'}}>
                        <InputLabel>Pk {idx + 1}</InputLabel>
                        <Select
                            label={`Pk ${idx + 1}`}
                            value={draftPick.pick.toString()}
                            onChange={(event: SelectChangeEvent) => {
                                const newDraftPicks = draftPicks.slice();
                                if (event.target.value === '') {
                                    newDraftPicks[idx].pick = '';
                                } else {
                                    newDraftPicks[idx].pick =
                                        +event.target.value;
                                }
                                setDraftPicks(
                                    newDraftPicks.sort(sortDraftPicks)
                                );
                            }}
                        >
                            <MenuItem value={''} key={''}>
                                Choose a pick:
                            </MenuItem>
                            {picks.map(pick => (
                                <MenuItem value={pick} key={pick}>
                                    {pick}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            ))}
            {setAdditionalDraftNotes && (
                <TextField
                    style={{margin: '4px'}}
                    label={'Additional Draft Info'}
                    value={additionalDraftNotes}
                    onChange={e => setAdditionalDraftNotes(e.target.value)}
                />
            )}
        </div>
    );
}
