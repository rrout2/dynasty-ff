import {ChangeEvent, SetStateAction, useEffect, useState} from 'react';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import styles from './UnifiedModule.module.css';
import {
    useAdpData,
    useGetPicks,
    useLeagueIdFromUrl,
    usePlayerData,
    usePositionalGrades,
} from '../../../../../hooks/hooks';
import {
    GraphicComponent as CornerstonesGraphic,
    InputComponent as CornerstonesInput,
    useCornerstones,
} from '../CornerstonesModule/CornerstonesModule';
import {
    GraphicComponent as RosterGraphic,
    InputComponent as RosterInput,
} from '../RosterModule/RosterModule';
import {GraphicComponent as SettingsGraphic} from '../SettingsModule/SettingsModule';
import {FANTASY_POSITIONS} from '../../../../../consts/fantasy';
import ExportButton from '../../../shared/ExportButton';
import {
    GraphicComponent as SuggestedMovesGraphic,
    InputComponent as SuggestedMovesInput,
    useBuySells,
} from '../SuggestedMovesModule/SuggestedMovesModule';
import {
    GraphicComponent as HoldsGraphic,
    InputComponent as HoldsInput,
    useHolds,
} from '../HoldsModule/HoldsModule';
import {
    GraphicComponent as RisersFallersGraphic,
    InputComponent as RisersFallersInput,
    useRisersFallers,
} from '../RisersFallersModule/RisersFallersModule';
import {
    Grid2,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import {
    GraphicComponent as PositionalGradesGraphic,
    InputComponent as PositionalGradesInput,
} from '../PositionalGrades/PositionalGrades';
import {
    Outlook,
    useThreeYearOutlook,
    InputComponent as ThreeYearOutlookInput,
    GraphicComponent as ThreeYearOutlookGraphic,
} from '../ThreeYearOutlook/ThreeYearOutlook';
import {ALL_ARCHETYPES, Archetype} from '../../consts/archetypes';
import {
    DraftPick,
    DraftStrategy,
    RookieDraftInputs,
    useRookieDraft,
} from '../../../rookieDraft/RookieDraft/RookieDraft';
import {DraftCapitalInput} from '../../../v1/modules/BigBoy/BigBoy';
import {FinalPickData} from '../../../../../sleeper-api/picks';
export type UnifiedModuleProps = {
    roster?: Roster;
    numRosters?: number;
    teamName?: string;
};

export default function UnifiedModule({
    roster,
    numRosters,
    teamName,
}: UnifiedModuleProps): JSX.Element {
    const {cornerstones, setCornerstones} = useCornerstones(roster);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [leagueId] = useLeagueIdFromUrl();
    const {sells, setSells, buys, setBuys, plusMap, setPlusMap} =
        useBuySells(roster);
    const {myPicks, hasDraftOccurred} = useGetPicks(leagueId, roster?.owner_id);
    const {holds, setHolds} = useHolds(roster);
    const {
        risers,
        setRisers,
        riserValues,
        setRiserValues,
        fallers,
        setFallers,
        fallerValues,
        setFallerValues,
    } = useRisersFallers(roster);
    const {overall, setOverall, qb, setQb, rb, setRb, wr, setWr, te, setTe} =
        usePositionalGrades();
    const {
        values: outlookValues,
        setValues: setOutlookValues,
        outlook,
        setOutlook,
    } = useThreeYearOutlook();
    const playerData = usePlayerData();
    const {sortByAdp} = useAdpData();
    useEffect(() => {
        if (!roster || !playerData) return;
        setAllPlayers(
            roster.players
                .map(playerId => playerData[playerId])
                .filter(p => !!p)
                .sort(sortByAdp)
        );
    }, [roster, playerData]);

    const {
        draftPicks,
        setDraftPicks,
        rookieTargets,
        setRookieTargets,
        draftStrategy,
        setDraftStrategy,
        draftCapitalScore,
        setDraftCapitalScore,
        autoPopulatedDraftStrategy,
        setAutoPopulatedDraftStrategy,
        sortByRookieRank,
    } = useRookieDraft();
    const [rookiePickHeaders, setRookiePickHeaders] = useState([
        '2025 Rookie Picks',
        '2026 Rookie Picks',
    ]);

    const rankStateMap = new Map(
        FANTASY_POSITIONS.map(pos => [pos, useState('4th')])
    );

    return (
        <div>
            <ExportButton
                className={[
                    'rosterGraphic',
                    'settingsGraphic',
                    'cornerstonesGraphic',
                    'suggestedMovesGraphic',
                    'holdsGraphic',
                    'risersFallersGraphic',
                    'positionalGradesGraphic',
                    'threeYearOutlookGraphic',
                ]}
                zipName={`${teamName}_unified.zip`}
            />
            <UnifiedInputs
                roster={roster}
                cornerstones={cornerstones}
                setCornerstones={setCornerstones}
                sells={sells}
                setSells={setSells}
                buys={buys}
                setBuys={setBuys}
                plusMap={plusMap}
                setPlusMap={setPlusMap}
                holds={holds}
                setHolds={setHolds}
                risers={risers}
                setRisers={setRisers}
                riserValues={riserValues}
                setRiserValues={setRiserValues}
                fallers={fallers}
                setFallers={setFallers}
                fallerValues={fallerValues}
                setFallerValues={setFallerValues}
                rankStateMap={rankStateMap}
                overall={overall}
                setOverall={setOverall}
                qb={qb}
                setQb={setQb}
                rb={rb}
                setRb={setRb}
                wr={wr}
                setWr={setWr}
                te={te}
                setTe={setTe}
                draftPicks={draftPicks}
                setDraftPicks={setDraftPicks}
                rookieTargets={rookieTargets}
                setRookieTargets={setRookieTargets}
                draftStrategy={draftStrategy}
                setDraftStrategy={setDraftStrategy}
                draftCapitalScore={draftCapitalScore}
                setDraftCapitalScore={setDraftCapitalScore}
                autoPopulatedDraftStrategy={autoPopulatedDraftStrategy}
                setAutoPopulatedDraftStrategy={setAutoPopulatedDraftStrategy}
                sortByRookieRank={sortByRookieRank}
                outlookValues={outlookValues}
                setOutlookValues={setOutlookValues}
                outlook={outlook}
                setOutlook={setOutlook}
                rookiePickHeaders={rookiePickHeaders}
                setRookiePickHeaders={setRookiePickHeaders}
                myPicks={myPicks}
                hasDraftOccurred={hasDraftOccurred}
            />
            <CornerstonesGraphic
                cornerstones={cornerstones}
                graphicClassName="cornerstonesGraphic"
            />
            <RosterGraphic
                allPlayers={allPlayers}
                rankStateMap={rankStateMap}
                numRosters={numRosters ?? 0}
                graphicClassName="rosterGraphic"
            />
            <SettingsGraphic
                leagueId={leagueId}
                numRosters={numRosters ?? 0}
                graphicClassName="settingsGraphic"
            />
            <SuggestedMovesGraphic
                sells={sells}
                buys={buys}
                graphicClassName="suggestedMovesGraphic"
                plusMap={plusMap}
            />
            <HoldsGraphic holds={holds} graphicClassName="holdsGraphic" />
            <RisersFallersGraphic
                risers={risers}
                fallers={fallers}
                riserValues={riserValues}
                fallerValues={fallerValues}
                graphicClassName="risersFallersGraphic"
            />
            <PositionalGradesGraphic
                overall={overall}
                qb={qb}
                rb={rb}
                wr={wr}
                te={te}
                draftCapitalScore={draftCapitalScore}
                graphicClassName="positionalGradesGraphic"
            />
            <ThreeYearOutlookGraphic
                values={outlookValues}
                outlook={outlook}
                graphicClassName="threeYearOutlookGraphic"
            />
        </div>
    );
}

export type UnifiedInputsProps = {
    roster: Roster | undefined;
    cornerstones: string[];
    setCornerstones: (cornerstones: string[]) => void;
    sells: string[];
    setSells: (sells: string[]) => void;
    buys: string[];
    setBuys: (buys: string[]) => void;
    plusMap: Map<string, boolean>;
    setPlusMap: (plusMap: Map<string, boolean>) => void;
    holds: string[];
    setHolds: (holds: string[]) => void;
    risers: string[];
    setRisers: (risers: string[]) => void;
    riserValues: number[];
    setRiserValues: (values: number[]) => void;
    fallers: string[];
    setFallers: (fallers: string[]) => void;
    fallerValues: number[];
    setFallerValues: (values: number[]) => void;
    rankStateMap: Map<
        string,
        [string, React.Dispatch<React.SetStateAction<string>>]
    >;
    overall: number;
    setOverall: (value: number) => void;
    qb: number;
    setQb: (value: number) => void;
    rb: number;
    setRb: (value: number) => void;
    wr: number;
    setWr: (value: number) => void;
    te: number;
    setTe: (value: number) => void;
    draftPicks: DraftPick[];
    setDraftPicks: (value: SetStateAction<DraftPick[]>) => void;
    rookieTargets: string[][];
    setRookieTargets: (value: SetStateAction<string[][]>) => void;
    draftStrategy: DraftStrategy;
    setDraftStrategy: (draftStrategy: DraftStrategy) => void;
    draftCapitalScore: number;
    setDraftCapitalScore: (draftCapitalScore: number) => void;
    autoPopulatedDraftStrategy: number[];
    setAutoPopulatedDraftStrategy: (draftStrategy: number[]) => void;
    sortByRookieRank: (a: string, b: string) => number;
    outlookValues?: number[];
    setOutlookValues?: (values: number[]) => void;
    outlook?: Outlook;
    setOutlook?: (outlook: Outlook) => void;
    archetype?: Archetype;
    setArchetype?: (archetype: Archetype) => void;
    otherSettings?: string;
    setOtherSettings?: (otherSettings: string) => void;
    rookiePickComments?: string[];
    setRookiePickComments?: (value: SetStateAction<string[]>) => void;
    rookiePickHeaders: string[];
    setRookiePickHeaders: (value: SetStateAction<string[]>) => void;
    suggestionsAndComments?: string[];
    setSuggestionsAndComments?: (suggestionsAndComments: string[]) => void;
    myPicks: FinalPickData[];
    hasDraftOccurred: boolean;
};

export function UnifiedInputs({
    roster,
    cornerstones,
    setCornerstones,
    sells,
    setSells,
    buys,
    setBuys,
    plusMap,
    setPlusMap,
    holds,
    setHolds,
    risers,
    setRisers,
    riserValues,
    setRiserValues,
    fallers,
    setFallers,
    fallerValues,
    setFallerValues,
    rankStateMap,
    overall,
    setOverall,
    qb,
    setQb,
    rb,
    setRb,
    wr,
    setWr,
    te,
    setTe,
    draftCapitalScore,
    setDraftCapitalScore,
    draftPicks,
    setDraftPicks,
    rookieTargets,
    setRookieTargets,
    draftStrategy,
    setDraftStrategy,
    autoPopulatedDraftStrategy,
    setAutoPopulatedDraftStrategy,
    sortByRookieRank,
    outlookValues,
    setOutlookValues,
    outlook,
    setOutlook,
    archetype,
    setArchetype,
    otherSettings,
    setOtherSettings,
    rookiePickComments,
    setRookiePickComments,
    rookiePickHeaders,
    setRookiePickHeaders,
    suggestionsAndComments,
    setSuggestionsAndComments,
    myPicks,
    hasDraftOccurred,
}: UnifiedInputsProps) {
    useEffect(() => {
        if (!draftPicks || !setRookiePickComments) return;
        const getPicksInfo = (picks: FinalPickData[], year: string) => {
            if (picks.filter(p => p.season === year).length === 0) {
                return '';
            }
            const numFirsts = picks.filter(
                p => p.round === 1 && p.season === year
            ).length;
            const numSeconds = picks.filter(
                p => p.round === 2 && p.season === year
            ).length;
            const numThirds = picks.filter(
                p => p.round === 3 && p.season === year
            ).length;
            const numFourths = picks.filter(
                p => p.round === 4 && p.season === year
            ).length;
            const firstInfo =
                numFirsts > 0
                    ? `${numFirsts === 1 ? '' : numFirsts} 1st${
                          numFirsts !== 1 ? 's' : ''
                      }`.trim()
                    : '';
            const secondInfo =
                numSeconds > 0
                    ? `${numSeconds === 1 ? '' : numSeconds} 2nd${
                          numSeconds !== 1 ? 's' : ''
                      }`.trim()
                    : '';
            const thirdInfo =
                numThirds > 0
                    ? `${numThirds === 1 ? '' : numThirds} 3rd${
                          numThirds !== 1 ? 's' : ''
                      }`.trim()
                    : '';
            const fourthInfo =
                numFourths > 0
                    ? `${numFourths === 1 ? '' : numFourths} 4th${
                          numFourths !== 1 ? 's' : ''
                      }`.trim()
                    : '';
            const allRoundsInfo = `${[
                firstInfo,
                secondInfo,
                thirdInfo,
                fourthInfo,
            ]
                .filter(info => info !== '')
                .join(', ')}`;
            return allRoundsInfo;
        };
        const thisYearInfo = draftPicks
            .filter(
                draftPick => draftPick.round !== '' && draftPick.pick !== ''
            )
            .map(
                draftPick =>
                    `${draftPick.round}.${
                        draftPick.pick && draftPick.pick < 10 ? '0' : ''
                    }${draftPick.pick}`
            )
            .join(', ');
        const nextYearInfo = getPicksInfo(myPicks, '2026');
        const followingYearInfo = getPicksInfo(myPicks, '2027');
        if (hasDraftOccurred) {
            setRookiePickComments([nextYearInfo, followingYearInfo]);
        } else {
            setRookiePickComments([thisYearInfo, nextYearInfo]);
        }
    }, [draftPicks, myPicks, hasDraftOccurred]);

    return (
        <Grid2
            container
            spacing={1}
            style={{width: '1000px', height: 'fit-content'}}
        >
            <Grid2 size={8} className={styles.gridItem}>
                Cornerstones
                <CornerstonesInput
                    playerIds={roster?.players ?? []}
                    setCornerstones={setCornerstones}
                    cornerstones={cornerstones}
                />
            </Grid2>
            <Grid2 size={4} className={styles.gridItem}>
                Roster
                <div>
                    <RosterInput rankStateMap={rankStateMap} />
                </div>
            </Grid2>
            <Grid2 size={6} className={styles.gridItem}>
                Suggested Moves
                <SuggestedMovesInput
                    playerIds={roster?.players ?? []}
                    sells={sells}
                    setSells={setSells}
                    buys={buys}
                    setBuys={setBuys}
                    plusMap={plusMap}
                    setPlusMap={setPlusMap}
                />
            </Grid2>
            <Grid2 size={3.5} className={styles.gridItem}>
                Risers/Fallers
                <RisersFallersInput
                    playerIds={roster?.players ?? []}
                    risers={risers}
                    setRisers={setRisers}
                    riserValues={riserValues}
                    setRiserValues={setRiserValues}
                    fallers={fallers}
                    setFallers={setFallers}
                    fallerValues={fallerValues}
                    setFallerValues={setFallerValues}
                />
            </Grid2>
            <Grid2 size={2.5} className={styles.gridItem} style={{gap: '6px'}}>
                Positional Grades
                <PositionalGradesInput
                    overall={overall}
                    setOverall={setOverall}
                    qb={qb}
                    setQb={setQb}
                    rb={rb}
                    setRb={setRb}
                    wr={wr}
                    setWr={setWr}
                    te={te}
                    setTe={setTe}
                    draftCapitalScore={draftCapitalScore}
                    setDraftCapitalScore={setDraftCapitalScore}
                />
            </Grid2>
            <Grid2 size={4} className={styles.gridItem}>
                Holds
                <HoldsInput
                    playerIds={roster?.players ?? []}
                    holds={holds}
                    setHolds={setHolds}
                />
                <DraftCapitalInput
                    draftPicks={draftPicks}
                    setDraftPicks={setDraftPicks}
                />
            </Grid2>
            {!archetype &&
                outlookValues &&
                setOutlookValues &&
                setOutlook &&
                outlook &&
                setOutlook && (
                    <Grid2 size={5.5} className={styles.gridItem}>
                        Three Year Outlook
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <ThreeYearOutlookInput
                                values={outlookValues}
                                setValues={setOutlookValues}
                                outlook={outlook}
                                setOutlook={setOutlook}
                            />
                        </div>
                    </Grid2>
                )}
            <Grid2 size={3} className={styles.gridItem}>
                {!!archetype && !!setArchetype && (
                    <>
                        Archetype
                        <Select
                            value={archetype}
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
                    </>
                )}
                {!!setOtherSettings && (
                    <>
                        Other Settings
                        <TextField
                            value={otherSettings}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setOtherSettings(event.target.value);
                            }}
                            label="Other Settings"
                        />
                    </>
                )}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                    }}
                >
                    Rookie Pick Comment Header
                    {rookiePickHeaders.map((comment, idx) => (
                        <TextField
                            key={idx}
                            value={comment}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setRookiePickHeaders(
                                    rookiePickHeaders.map((currHeader, i) =>
                                        i === idx
                                            ? event.target.value
                                            : currHeader
                                    )
                                );
                            }}
                            label={`Header ${idx + 1}`}
                        />
                    ))}
                </div>
                {!!setRookiePickComments && !!rookiePickComments && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                        }}
                    >
                        Rookie Pick Comments
                        {rookiePickComments.map((comment, idx) => (
                            <TextField
                                key={idx}
                                value={comment}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>
                                ) => {
                                    setRookiePickComments(
                                        rookiePickComments.map(
                                            (currComment, i) =>
                                                i === idx
                                                    ? event.target.value
                                                    : currComment
                                        )
                                    );
                                }}
                                label={rookiePickHeaders[idx]}
                            />
                        ))}
                    </div>
                )}
            </Grid2>
            {!!setSuggestionsAndComments && !!suggestionsAndComments && (
                <Grid2
                    size={4.5}
                    className={styles.gridItem}
                    style={{gap: '6px'}}
                >
                    Suggestions and Comments
                    {suggestionsAndComments.map((comment, idx) => (
                        <TextField
                            key={idx}
                            value={comment}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setSuggestionsAndComments(
                                    suggestionsAndComments.map(
                                        (currComment, i) =>
                                            i === idx
                                                ? event.target.value
                                                : currComment
                                    )
                                );
                            }}
                        />
                    ))}
                </Grid2>
            )}
            <Grid2 size={12} className={styles.gridItem}>
                <RookieDraftInputs
                    draftPicks={draftPicks}
                    setDraftPicks={setDraftPicks}
                    rookieTargets={rookieTargets}
                    setRookieTargets={setRookieTargets}
                    draftStrategy={draftStrategy}
                    setDraftStrategy={setDraftStrategy}
                    autoPopulatedDraftStrategy={autoPopulatedDraftStrategy}
                    setAutoPopulatedDraftStrategy={
                        setAutoPopulatedDraftStrategy
                    }
                    sortByRookieRank={sortByRookieRank}
                />
            </Grid2>
        </Grid2>
    );
}
