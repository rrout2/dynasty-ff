import React, {useEffect, useState} from 'react';
import styles from './BigBoy.module.css';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import {
    blankBlueprintV2,
    dualEliteDVMCCO,
    dualEliteDVMRCC,
    dualEliteGraphCCO,
    dualEliteGraphRCC,
    eliteValueDVMCCC,
    eliteValueDVMCCO,
    eliteValueGraphCCC,
    eliteValueGraphCCO,
    futureValueDVM,
    futureValueGraph,
    hardRebuildDVMRRC,
    hardRebuildDVMRRR,
    hardRebuildGraphRRC,
    hardRebuildGraphRRR,
    oneYearReloadDVM,
    oneYearReloadGraph,
    rbHeavyDVM,
    rbHeavyGraph,
    wellRoundedDVMCCO,
    wellRoundedDVMCCR,
    wellRoundedGraphCCO,
    wellRoundedGraphCCR,
    wrFactorGraphCCR,
    wrFactoryDVMCCO,
    wrFactoryDVMCCR,
    wrFactoryGraphCCO,
} from '../../../../../consts/images';
import {
    useLeagueIdFromUrl,
    usePlayerData,
    useAdpData,
    useLeague,
    useRosterSettings,
} from '../../../../../hooks/hooks';
import {
    GraphicComponent as CornerstonesGraphic,
    useCornerstones,
} from '../CornerstonesModule/CornerstonesModule';
import {GraphicComponent as RosterGraphic} from '../RosterModule/RosterModule';
import {GraphicComponent as SettingsGraphic} from '../SettingsModule/SettingsModule';
import {FANTASY_POSITIONS, SUPER_FLEX} from '../../../../../consts/fantasy';
import ExportButton from '../../../shared/ExportButton';
import {
    GraphicComponent as SuggestedMovesGraphic,
    useBuySells,
} from '../SuggestedMovesModule/SuggestedMovesModule';
import {
    GraphicComponent as HoldsGraphic,
    useHolds,
} from '../HoldsModule/HoldsModule';
import {
    GraphicComponent as RisersFallersGraphic,
    useRisersFallers,
} from '../RisersFallersModule/RisersFallersModule';
import {
    GraphicComponent as PositionalGradesGraphic,
    usePositionalGrades,
} from '../PositionalGrades/PositionalGrades';
import {
    Outlook,
    useThreeYearOutlook,
    GraphicComponent as ThreeYearOutlookGraphic,
} from '../ThreeYearOutlook/ThreeYearOutlook';
import {Archetype, UnifiedInputs} from '../UnifiedModule/UnifiedModule';

interface BigBoyProps {
    roster?: Roster;
    numRosters?: number;
    teamName?: string;
}

export default function BigBoy({roster, numRosters, teamName}: BigBoyProps) {
    const {cornerstones, setCornerstones} = useCornerstones(roster);
    const {sells, setSells, buys, setBuys, plusMap, setPlusMap} =
        useBuySells(roster);
    const {holds, setHolds, comments, setComments} = useHolds(roster);
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
    const {
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
        depth,
        setDepth,
    } = usePositionalGrades();
    const {
        values: outlookValues,
        setValues: setOutlookValues,
        outlook,
        setOutlook,
    } = useThreeYearOutlook();

    const rankStateMap = new Map(
        FANTASY_POSITIONS.map(pos => [pos, useState('4th')])
    );

    const [archetype, setArchetype] = useState<Archetype>(
        Archetype.FutureValue
    );

    return (
        <div>
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
                comments={comments}
                setComments={setComments}
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
                depth={depth}
                setDepth={setDepth}
                outlookValues={outlookValues}
                setOutlookValues={setOutlookValues}
                outlook={outlook}
                setOutlook={setOutlook}
                archetype={archetype}
                setArchetype={setArchetype}
            />
            <FullBlueprint
                roster={roster}
                cornerstones={cornerstones}
                sells={sells}
                buys={buys}
                plusMap={plusMap}
                holds={holds}
                comments={comments}
                risers={risers}
                riserValues={riserValues}
                fallers={fallers}
                fallerValues={fallerValues}
                rankStateMap={rankStateMap}
                overall={overall}
                qb={qb}
                rb={rb}
                wr={wr}
                te={te}
                depth={depth}
                outlookValues={outlookValues}
                outlook={outlook}
                numRosters={numRosters}
                teamName={teamName}
                archetype={archetype}
            />
        </div>
    );
}

interface FullBlueprintProps {
    roster?: Roster;
    cornerstones: string[];
    sells: string[];
    buys: string[];
    plusMap: Map<string, boolean>;
    holds: string[];
    comments: string[];
    risers: string[];
    riserValues: number[];
    fallers: string[];
    fallerValues: number[];
    rankStateMap: Map<
        string,
        [string, React.Dispatch<React.SetStateAction<string>>]
    >;
    overall: number;
    qb: number;
    rb: number;
    wr: number;
    te: number;
    depth: number;
    outlookValues: number[];
    outlook: Outlook;
    archetype: Archetype;
    numRosters?: number;
    teamName?: string;
}

function FullBlueprint({
    roster,
    numRosters,
    rankStateMap,
    cornerstones,
    risers,
    fallers,
    riserValues,
    fallerValues,
    sells,
    buys,
    plusMap,
    holds,
    comments,
    overall,
    qb,
    rb,
    wr,
    te,
    depth,
    teamName,
    archetype,
}: FullBlueprintProps) {
    const playerData = usePlayerData();
    const {sortByAdp} = useAdpData();
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    useEffect(() => {
        if (!roster || !playerData) return;
        setAllPlayers(
            roster.players
                .map(playerId => playerData[playerId])
                .filter(p => !!p)
                .sort(sortByAdp)
        );
    }, [roster, playerData]);

    function getBlueprintCode() {
        const isSuperflex = rosterSettings.has(SUPER_FLEX);
        return `${getStartOfCode(archetype)}-${numRosters ?? 0}-${
            isSuperflex ? 'SF' : '1Q'
        }`;
    }

    return (
        <div className={styles.fullBlueprint}>
            <div className={styles.teamName}>{teamName}</div>
            <div className={styles.rosterGraphic}>
                <RosterGraphic
                    allPlayers={allPlayers}
                    numRosters={numRosters ?? 0}
                    rankStateMap={rankStateMap}
                    transparent={true}
                />
            </div>
            <div className={styles.settingsGraphic}>
                <SettingsGraphic
                    leagueId={leagueId}
                    numRosters={numRosters ?? 0}
                    transparent={true}
                />
            </div>
            <div className={styles.cornerstonesGraphic}>
                <CornerstonesGraphic cornerstones={cornerstones} />
            </div>
            <div className={styles.risersFallersGraphic}>
                <RisersFallersGraphic
                    risers={risers}
                    riserValues={riserValues}
                    fallers={fallers}
                    fallerValues={fallerValues}
                    transparent={true}
                />
            </div>
            <div className={styles.suggestedMovesGraphic}>
                <SuggestedMovesGraphic
                    transparent={true}
                    sells={sells}
                    buys={buys}
                    plusMap={plusMap}
                />
            </div>
            <div className={styles.holdsGraphic}>
                <HoldsGraphic holds={holds} comments={comments} />
            </div>
            <div className={styles.positionalGradesGraphic}>
                <PositionalGradesGraphic
                    overall={overall}
                    qb={qb}
                    rb={rb}
                    wr={wr}
                    te={te}
                    depth={depth}
                    transparent={true}
                />
            </div>
            <div className={styles.threeYearOutlook}>
                <div className={styles.graphCrop}>
                    <img
                        src={getGraphFromArchetype(archetype)}
                        className={styles.graph}
                    />
                </div>
            </div>
            <div className={styles.dvm}>
                <img src={getDvmFromArchetype(archetype)} />
            </div>
            <div className={styles.bpCode}>{getBlueprintCode()}</div>
            <img src={blankBlueprintV2} />
        </div>
    );
}

function getGraphFromArchetype(archetype: Archetype) {
    switch (archetype) {
        case Archetype.HardRebuild_RRC:
            return hardRebuildGraphRRC;
        case Archetype.HardRebuild_RRR:
            return hardRebuildGraphRRR;
        case Archetype.WellRounded_CCR:
            return wellRoundedGraphCCR;
        case Archetype.WellRounded_CCO:
            return wellRoundedGraphCCO;
        case Archetype.DualEliteQB_CCO:
            return dualEliteGraphCCO;
        case Archetype.DualEliteQB_RCC:
            return dualEliteGraphRCC;
        case Archetype.EliteValue_CCC:
            return eliteValueGraphCCC;
        case Archetype.EliteValue_CCO:
            return eliteValueGraphCCO;
        case Archetype.FutureValue:
            return futureValueGraph;
        case Archetype.WRFactory_CCO:
            return wrFactoryGraphCCO;
        case Archetype.WRFactory_CCR:
            return wrFactorGraphCCR;
        case Archetype.OneYearReload:
            return oneYearReloadGraph;
        case Archetype.RBHeavy:
            return rbHeavyGraph;
        default:
            return Archetype.UNSPECIFIED;
    }
}

function getDvmFromArchetype(archetype: Archetype) {
    switch (archetype) {
        case Archetype.HardRebuild_RRC:
            return hardRebuildDVMRRC;
        case Archetype.HardRebuild_RRR:
            return hardRebuildDVMRRR;
        case Archetype.WellRounded_CCR:
            return wellRoundedDVMCCR;
        case Archetype.WellRounded_CCO:
            return wellRoundedDVMCCO;
        case Archetype.DualEliteQB_CCO:
            return dualEliteDVMCCO;
        case Archetype.DualEliteQB_RCC:
            return dualEliteDVMRCC;
        case Archetype.EliteValue_CCC:
            return eliteValueDVMCCC;
        case Archetype.EliteValue_CCO:
            return eliteValueDVMCCO;
        case Archetype.FutureValue:
            return futureValueDVM;
        case Archetype.WRFactory_CCO:
            return wrFactoryDVMCCO;
        case Archetype.WRFactory_CCR:
            return wrFactoryDVMCCR;
        case Archetype.OneYearReload:
            return oneYearReloadDVM;
        case Archetype.RBHeavy:
            return rbHeavyDVM;
        default:
            return Archetype.UNSPECIFIED;
    }
}

function getStartOfCode(archetype: Archetype) {
    switch (archetype) {
        case Archetype.HardRebuild_RRC:
            return 'HR-RRC';
        case Archetype.HardRebuild_RRR:
            return 'HR-RRR';
        case Archetype.WellRounded_CCR:
            return 'WR-CCR';
        case Archetype.WellRounded_CCO:
            return 'WR-CCO';
        case Archetype.DualEliteQB_CCO:
            return 'DQ-CCO';
        case Archetype.DualEliteQB_RCC:
            return 'DQ-RCC';
        case Archetype.EliteValue_CCC:
            return 'EV-CCC';
        case Archetype.EliteValue_CCO:
            return 'EV-CCO';
        case Archetype.FutureValue:
            return 'FV-RCC';
        case Archetype.WRFactory_CCO:
            return 'WF-CCO';
        case Archetype.WRFactory_CCR:
            return 'WF-CCR';
        case Archetype.OneYearReload:
            return '1R-OCC';
        case Archetype.RBHeavy:
            return 'RH-CCR';
        default:
            return '??-???';
    }
}