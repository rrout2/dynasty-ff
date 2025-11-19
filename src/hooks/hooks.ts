import {
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import playersJson from '../data/players.json';
import rankingsJson from '../data/rankings_11122025.json';
import buySellsData from '../data/buyssellsholds_with_ids_080525.json';
import buySellsContendRebuild from '../data/buyssellsholds_with_ids_111225.json';
import nflScheduleJson from '../data/nfl_schedule.json';
import sfPickMovesJson from '../data/rookieBP/sf_pick_moves.json';
import oneQbPickMovesJson from '../data/rookieBP/1qb_pick_moves.json';
import sfRookieRankingsJson from '../data/rookieBP/sf_rookie_rankings_and_tiers_apr26.json';
import oneQbRookieRankingsJson from '../data/rookieBP/1qb_rookie_rankings_and_tiers_apr26.json';
import playerStoplightsJson from '../data/weekly/playerLightsWeek11.json';
import risersFallersJson from '../data/weekly/risersFallersWeek11.json';
import weeklyRankingsJson from '../data/weekly/rankingsWeek11.json';

import {
    League,
    Player,
    Roster,
    User,
    getAllUsers,
    getLeague,
    getRosters,
    getUser,
} from '../sleeper-api/sleeper-api';
import {useQuery} from '@tanstack/react-query';
import {
    DISALLOWED_BUYS,
    LEAGUE_ID,
    LEAGUE_SIZE,
    MODULE,
    NON_SLEEPER_IDS,
    NONE_TEAM_ID,
    TEAM_ID,
    TEAM_NAME,
    USER_ID,
} from '../consts/urlParams';
import {useSearchParams} from 'react-router-dom';
import {
    ALLOWED_POSITIONS,
    BENCH,
    FLEX,
    PPR,
    QB,
    RB,
    SUPER_FLEX,
    SUPER_FLEX_SET,
    TAXI_SLOTS,
    TE,
    TE_BONUS,
    WR,
    WR_RB_FLEX,
    WR_TE_FLEX,
} from '../consts/fantasy';
import {Module} from '../components/Blueprint/v1/BlueprintGenerator';
import {Lineup} from '../components/Blueprint/v1/modules/Starters/Starters';
import {RosterTier} from '../components/Blueprint/infinite/RosterTier/RosterTier';
import {rookieMap} from '../consts/images';
import {gradeByPosition} from '../components/Blueprint/v1/modules/PositionalGrades/PositionalGrades';
import {calculateDepthScore} from '../components/Blueprint/v1/modules/DepthScore/DepthScore';

import {Archetype} from '../components/Blueprint/v1/modules/BigBoy/BigBoy';
import {FinalPickData, getPicks, GetPicksResult} from '../sleeper-api/picks';
import axios from 'axios';

const AZURE_API_URL = 'https://domainffapi.azurewebsites.net/api/';

function useApiRisersFallers() {
    const currListId = 177;
    const prevListId = 157;
    const {
        data: risersFallers,
    } = useQuery({
        queryKey: ['risersFallers', currListId, prevListId],
        queryFn: async () => {
            const options = {
                method: 'GET',
                url: `${AZURE_API_URL}RiserFaller?currentListId=${currListId}&previousListId=${prevListId}`,
            };
            const res = await axios.request(options);
            return res.data as any[];
        },
        retry: false,
    });

    return {risersFallers};
}

export function useWeeklyRisersFallers(roster?: Roster) {
    const {risersFallers} = useApiRisersFallers();
    const [risers, setRisers] = useState<string[]>(['a', 'b', 'c']);
    const [fallers, setFallers] = useState<string[]>(['a', 'b', 'c']);
    const playerData = usePlayerData();
    useEffect(() => {
        if (!roster || !playerData || !risersFallers) return;
        const rosterNames = roster.players
            .map(p => playerData[p])
            .filter(p => !!p)
            .map(p => `${p.first_name} ${p.last_name}`);
        const included = risersFallers.filter(
            rf =>
                rosterNames.includes(rf.Name) ||
                rosterNames.includes(checkForNickname(rf.Name))
        );
        included.sort((a, b) => b.Difference - a.Difference);
        setRisers(included.slice(0, 3).map(rf => rf.Name));
        setFallers(included.slice(-3).map(rf => rf.Name));
    }, [roster, risersFallers, playerData]);
    return {risers, fallers};
}

export type Stoplight = {
    playerName: string;
    position: string;
    matchupLight: string;
    offenseLight: string;
    vegasLight: string;
};

export function useStoplights(week: string | number = 12) {
    const {
        data: stoplights,
        error,
        isLoading,
        isFetched,
        isError,
    } = useQuery({
        queryKey: ['stoplights', week],
        queryFn: async () => {
            const options = {
                method: 'GET',
                url: `${AZURE_API_URL}api/PlayerLights/${week}`,
            };
            const res = await axios.request(options);
            return res.data as Stoplight[];
        },
        retry: false,
    });

    function findStoplight(name: string): Stoplight | undefined {
        if (!stoplights) return;
        const nickname = checkForNickname(name);
        const foundPlayer = stoplights.find(
            player =>
                player.playerName === name ||
                player.playerName === nickname
        );
        if (!foundPlayer) {
            console.warn('no stoplight found for', name);
            return;
        }
        // console.log('found stoplight for', name);
        return foundPlayer;
    }
    return {stoplights, findStoplight, isFetched};
}

export function useGetPicks(leagueId: string, userId?: string) {
    const [allPicks, setAllPicks] = useState<GetPicksResult>();
    const [myPicks, setMyPicks] = useState<FinalPickData[]>([]);
    const [hasDraftOccurred, setHasDraftOccurred] = useState(false);
    const fetchPicks = async () => {
        const leagueData = await getLeague(leagueId);
        const users = await getAllUsers(leagueId);
        if (!leagueData) return;
        const picks = await getPicks({
            leagueId,
            season: leagueData.season,
            leagueSize: leagueData.total_rosters,
            users: users.map(user => ({
                userId: user.user_id,
                displayName: user.display_name,
                userName: user.username,
            })),
        });
        setAllPicks(picks);
    };

    useEffect(() => {
        if (!leagueId) return;
        fetchPicks();
    }, [leagueId]);

    useEffect(() => {
        if (!allPicks || !allPicks.picks || !userId) return;
        const myPicks = allPicks.picks[userId];
        if (!myPicks) {
            console.warn('no picks found for owner', userId);
        }
        setMyPicks(myPicks);
    }, [allPicks, userId]);

    useEffect(() => {
        if (!allPicks) return;
        setHasDraftOccurred(allPicks.hasDraftOccurred);
    }, [allPicks]);
    return {allPicks, myPicks, hasDraftOccurred};
}

export function useArchetype(
    qbScore: number,
    rbScore: number,
    wrScore: number,
    teScore: number,
    isSuperFlex: boolean
) {
    const [archetype, setArchetype] = useState<Archetype>(
        Archetype.HardRebuild
    );
    const calculateSuperflexArchetype = useCallback(() => {
        const totalScore = qbScore + rbScore + wrScore + teScore;
        if (qbScore >= 8 && rbScore >= 8 && wrScore >= 8 && teScore >= 8) {
            setArchetype(Archetype.EliteValue);
            return;
        }
        if (
            totalScore >= 26 &&
            qbScore >= 6 &&
            rbScore >= 6 &&
            wrScore >= 6 &&
            teScore >= 6
        ) {
            setArchetype(Archetype.WellRounded);
            return;
        }
        if (totalScore >= 20 && qbScore >= 8) {
            setArchetype(Archetype.DualEliteQB);
            return;
        }
        if (totalScore >= 20 && wrScore >= 8) {
            setArchetype(Archetype.WRFactory);
            return;
        }
        if (totalScore >= 20 && rbScore >= 9) {
            setArchetype(Archetype.RBHeavy);
            return;
        }
        if (
            totalScore >= 15 &&
            qbScore >= 4 &&
            rbScore < 9 &&
            wrScore < 8 &&
            wrScore >= 3 &&
            teScore >= 3
        ) {
            setArchetype(Archetype.OneYearReload);
            return;
        }
        if (totalScore >= 15) {
            setArchetype(Archetype.FutureValue);
            return;
        }
        setArchetype(Archetype.HardRebuild);
    }, [qbScore, rbScore, wrScore, teScore, setArchetype]);

    const calculateOneQbArchetype = useCallback(() => {
        const totalScore = qbScore + rbScore + wrScore + teScore;
        if (qbScore >= 8 && rbScore >= 8 && wrScore >= 8 && teScore >= 8) {
            setArchetype(Archetype.EliteValue);
            return;
        }
        if (
            totalScore >= 26 &&
            qbScore >= 6 &&
            rbScore >= 6 &&
            wrScore >= 6 &&
            teScore >= 6
        ) {
            setArchetype(Archetype.WellRounded);
            return;
        }
        if (totalScore >= 20 && wrScore >= 8) {
            setArchetype(Archetype.WRFactory);
            return;
        }
        if (totalScore >= 20 && qbScore >= 8 && teScore >= 8) {
            setArchetype(Archetype.EliteQBTE);
            return;
        }
        if (totalScore >= 20 && rbScore >= 9) {
            setArchetype(Archetype.RBHeavy);
            return;
        }
        if (
            totalScore >= 15 &&
            qbScore >= 4 &&
            rbScore < 9 &&
            wrScore < 8 &&
            wrScore >= 3 &&
            teScore >= 3
        ) {
            setArchetype(Archetype.OneYearReload);
            return;
        }
        if (totalScore >= 15) {
            setArchetype(Archetype.FutureValue);
            return;
        }
        setArchetype(Archetype.HardRebuild);
    }, [qbScore, rbScore, wrScore, teScore, setArchetype]);

    useEffect(() => {
        if (isSuperFlex) {
            calculateSuperflexArchetype();
        } else {
            calculateOneQbArchetype();
        }
    }, [isSuperFlex, calculateSuperflexArchetype, calculateOneQbArchetype]);
    return {
        archetype,
        setArchetype,
    };
}

/**
 * Calculates and returns the ranks of positional grades for a given roster
 * within a league. It computes grades for each position (QB, RB, WR, TE)
 * across all rosters and determines the rank of the specified roster's
 * grades among them.
 *
 * @param rosters - The list of all rosters in the league.
 * @param roster - The specific roster to calculate ranks for.
 * @returns An object containing the ranks for QB, RB, WR, and TE
 * positions.
 */
export function usePositionalRanks(rosters?: Roster[], roster?: Roster) {
    const playerData = usePlayerData();
    const {getPlayerValue} = usePlayerValues();
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const leagueSize = rosters?.length ?? 0;
    const [allQbGrades, setAllQbGrades] = useState<number[]>([]);
    const [qbRank, setQbRank] = useState(-1);
    const [allRbGrades, setAllRbGrades] = useState<number[]>([]);
    const [rbRank, setRbRank] = useState(-1);
    const [allWrGrades, setAllWrGrades] = useState<number[]>([]);
    const [wrRank, setWrRank] = useState(-1);
    const [allTeGrades, setAllTeGrades] = useState<number[]>([]);
    const [teRank, setTeRank] = useState(-1);
    const isSuperFlex =
        rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1;
    const {
        qb: qbGrade,
        rb: rbGrade,
        wr: wrGrade,
        te: teGrade,
    } = usePositionalGrades(roster, leagueSize);

    useEffect(() => {
        if (!playerData || !rosters?.length) return;
        // Needed to force re-render to center grade values.
        const newQbList: number[] = [];
        const newRbList: number[] = [];
        const newWrList: number[] = [];
        const newTeList: number[] = [];
        rosters.forEach(r => {
            newQbList.push(
                gradeByPosition(
                    QB,
                    getPlayerValue,
                    isSuperFlex,
                    leagueSize ?? 0,
                    playerData,
                    r
                )
            );
            newRbList.push(
                gradeByPosition(
                    RB,
                    getPlayerValue,
                    isSuperFlex,
                    leagueSize ?? 0,
                    playerData,
                    r
                )
            );
            newWrList.push(
                gradeByPosition(
                    WR,
                    getPlayerValue,
                    isSuperFlex,
                    leagueSize ?? 0,
                    playerData,
                    r
                )
            );
            newTeList.push(
                gradeByPosition(
                    TE,
                    getPlayerValue,
                    isSuperFlex,
                    leagueSize ?? 0,
                    playerData,
                    r
                )
            );
        });

        setAllQbGrades(newQbList);
        setAllRbGrades(newRbList);
        setAllWrGrades(newWrList);
        setAllTeGrades(newTeList);
    }, [playerData, rosters, isSuperFlex]);

    useEffect(() => {
        if (allQbGrades.length === 0 || qbGrade === -1) return;
        const qbGradesCopy = [...allQbGrades];
        qbGradesCopy.sort((a, b) => b - a);
        const newQbRank = qbGradesCopy.indexOf(qbGrade);
        setQbRank(newQbRank);
    }, [allQbGrades, qbGrade]);
    useEffect(() => {
        if (allRbGrades.length === 0 || rbGrade === -1) return;
        const rbGradesCopy = [...allRbGrades];
        rbGradesCopy.sort((a, b) => b - a);
        const newRbRank = rbGradesCopy.indexOf(rbGrade);
        setRbRank(newRbRank);
    }, [allRbGrades, rbGrade]);
    useEffect(() => {
        if (allWrGrades.length === 0 || wrGrade === -1) return;
        const wrGradesCopy = [...allWrGrades];
        wrGradesCopy.sort((a, b) => b - a);
        const newWrRank = wrGradesCopy.indexOf(wrGrade);
        setWrRank(newWrRank);
    }, [allWrGrades, wrGrade]);
    useEffect(() => {
        if (allTeGrades.length === 0 || teGrade === -1) return;
        const teGradesCopy = [...allTeGrades];
        teGradesCopy.sort((a, b) => b - a);
        const newTeRank = teGradesCopy.indexOf(teGrade);
        setTeRank(newTeRank);
    }, [allTeGrades, teGrade]);
    return {qbRank, rbRank, wrRank, teRank};
}

export function usePositionalGrades(roster?: Roster, leagueSize?: number) {
    const playerData = usePlayerData();
    const {getPlayerValue} = usePlayerValues();
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const {bench} = useProjectedLineup(rosterSettings, roster?.players);

    const [overall, setOverall] = useState(-1);
    const [qb, setQb] = useState(-1);
    const [rb, setRb] = useState(-1);
    const [wr, setWr] = useState(-1);
    const [te, setTe] = useState(-1);
    const [depth, setDepth] = useState(-1);
    const isSuperFlex =
        rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1;
    useEffect(() => {
        if (!playerData || !roster || bench.length === 0) return;
        // Needed to force re-render to center grade values.
        const newQb = gradeByPosition(
            QB,
            getPlayerValue,
            isSuperFlex,
            leagueSize ?? 0,
            playerData,
            roster
        );
        const newRb = gradeByPosition(
            RB,
            getPlayerValue,
            isSuperFlex,
            leagueSize ?? 0,
            playerData,
            roster
        );
        const newWr = gradeByPosition(
            WR,
            getPlayerValue,
            isSuperFlex,
            leagueSize ?? 0,
            playerData,
            roster
        );
        const newTe = gradeByPosition(
            TE,
            getPlayerValue,
            isSuperFlex,
            leagueSize ?? 0,
            playerData,
            roster
        );
        const newDepth = calculateDepthScore(bench, getPlayerValue);
        setQb(newQb);
        setRb(newRb);
        setWr(newWr);
        setTe(newTe);
        setDepth(newDepth);
        setOverall(
            Math.min(
                10,
                Math.round((newQb + newRb + newWr + newTe + newDepth) / 5) + 1
            )
        );
    }, [playerData, roster, bench]);
    return {
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
    };
}

export type RookieRank = {
    Pick: number;
    Name: string;
    Position: string;
    Tier: number;
};

export function useRookieRankings(isSuperFlex: boolean) {
    const [sfRookieRankings] = useState<RookieRank[]>(
        sfRookieRankingsJson as unknown as RookieRank[]
    );
    const [oneQbRookieRankings] = useState<RookieRank[]>(
        oneQbRookieRankingsJson as unknown as RookieRank[]
    );
    const rookieRankings = isSuperFlex ? sfRookieRankings : oneQbRookieRankings;

    function verifyRankings() {
        rookieRankings.forEach(r => {
            if (!rookieMap.has(r.Name)) {
                console.warn('missing rookie card', r.Name);
            }
        });
    }

    function getRookieRank(name: string) {
        const rookieRank = rookieRankings.find(
            r =>
                r.Name.replace(/\W/g, '').toLowerCase() ===
                name.replace(/\W/g, '').toLowerCase()
        );
        if (!rookieRank) {
            return Infinity;
        }
        return rookieRank.Pick;
    }

    function sortByRookieRank(a: string, b: string): number {
        return getRookieRank(a) - getRookieRank(b);
    }

    useEffect(() => {
        verifyRankings();
    }, [rookieRankings]);

    function getRookieTier(pick: number) {
        if (pick < 1 || pick > rookieRankings.length) {
            console.warn('invalid pick', pick);
            return ['', '', ''];
        }
        const tier = rookieRankings[pick - 1].Tier;
        return rookieRankings.filter(r => r.Tier === tier).map(r => r.Name);
    }

    return {rookieRankings, getRookieTier, getRookieRank, sortByRookieRank};
}

export type PickMove = {
    Pick: string;
    Elite: string;
    Championship: string;
    Contender: string;
    Reload: string;
    Rebuild: string;
};

export function usePickMoves(isSuperFlex: boolean) {
    const [sfPickMoves] = useState<PickMove[]>(
        sfPickMovesJson as unknown as PickMove[]
    );
    const [oneQbPickMoves] = useState<PickMove[]>(
        oneQbPickMovesJson as unknown as PickMove[]
    );
    function getMove(pick: number, tier: RosterTier) {
        const pickMoves = isSuperFlex ? sfPickMoves : oneQbPickMoves;
        if (pick < 1 || pick > pickMoves.length) {
            console.warn('invalid pick', pick);
            return '';
        }
        const pickMove = pickMoves[pick - 1];
        switch (tier.toLowerCase()) {
            case 'elite':
                return pickMove.Elite;
            case 'championship':
                return pickMove.Championship;
            case 'contender':
            case 'competitive':
                return pickMove.Contender;
            case 'reload':
                return pickMove.Reload;
            case 'rebuild':
                return pickMove.Rebuild;
            default:
                console.warn('unknown tier', tier);
                return '';
        }
    }
    return {pickMoves: isSuperFlex ? sfPickMoves : oneQbPickMoves, getMove};
}

type TeamSchedule = {
    [week: string]: string;
};

type NFLSeasonSchedule = {
    [team: string]: TeamSchedule;
};

export function useNflSchedule() {
    const [nflSchedule] = useState<NFLSeasonSchedule>(nflScheduleJson);

    return nflSchedule;
}

export type BuySellVerdict = {
    name: string;
    alt_name: string;
    position: string;
    team: string;
    pos_adp: number;
    domain_rank: number;
    difference: number;
    verdict: string;
    explanation: string;
    player_id: string;
    age: number;
    contend_verdict: string;
    rebuild_verdict: string;
};

export function useSplitBuySellData() {
    const [buySells] = useState(
        buySellsContendRebuild as unknown as BuySellVerdict[]
    );
    const [rebuildQbBuys, setRebuildQbBuys] = useState<BuySellVerdict[]>([]);
    const [rebuildRbBuys, setRebuildRbBuys] = useState<BuySellVerdict[]>([]);
    const [rebuildWrBuys, setRebuildWrBuys] = useState<BuySellVerdict[]>([]);
    const [rebuildTeBuys, setRebuildTeBuys] = useState<BuySellVerdict[]>([]);
    const [rebuildSells, setRebuildSells] = useState<BuySellVerdict[]>([]);
    const [rebuildHolds, setRebuildHolds] = useState<BuySellVerdict[]>([]);
    const [contendQbBuys, setContendQbBuys] = useState<BuySellVerdict[]>([]);
    const [contendRbBuys, setContendRbBuys] = useState<BuySellVerdict[]>([]);
    const [contendWrBuys, setContendWrBuys] = useState<BuySellVerdict[]>([]);
    const [contendTeBuys, setContendTeBuys] = useState<BuySellVerdict[]>([]);
    const [contendSells, setContendSells] = useState<BuySellVerdict[]>([]);
    const [contendHolds, setContendHolds] = useState<BuySellVerdict[]>([]);
    const {sortNamesByAdp} = useAdpData();
    useEffect(() => {
        const contendQbBuys = buySells.filter(
            b =>
                b.position === QB &&
                (b.contend_verdict === 'Soft Buy' ||
                    b.contend_verdict === 'Hard Buy')
        );

        const contendRbBuys = buySells.filter(
            b =>
                b.position === RB &&
                (b.contend_verdict === 'Soft Buy' ||
                    b.contend_verdict === 'Hard Buy')
        );

        const contendWrBuys = buySells.filter(
            b =>
                b.position === WR &&
                (b.contend_verdict === 'Soft Buy' ||
                    b.contend_verdict === 'Hard Buy')
        );

        const contendTeBuys = buySells.filter(
            b =>
                b.position === TE &&
                (b.contend_verdict === 'Soft Buy' ||
                    b.contend_verdict === 'Hard Buy')
        );
        const contendSells = buySells
            .filter(
                b =>
                    b.contend_verdict === 'Soft Sell' ||
                    b.contend_verdict === 'Hard Sell'
            )
            .sort((a, b) => sortNamesByAdp(a.name, b.name));

        const contendHolds = buySells
            .filter(
                b =>
                    b.contend_verdict === 'Hold' ||
                    b.contend_verdict === 'Hard Buy' ||
                    b.contend_verdict === 'Soft Buy'
            )
            .sort((a, b) => b.difference - a.difference);
        shuffle(contendQbBuys);
        shuffle(contendRbBuys);
        shuffle(contendWrBuys);
        shuffle(contendTeBuys);
        setContendQbBuys(contendQbBuys);
        setContendRbBuys(contendRbBuys);
        setContendWrBuys(contendWrBuys);
        setContendTeBuys(contendTeBuys);
        setContendSells(contendSells);
        setContendHolds(contendHolds);
        const rebuildQbBuys = buySells.filter(
            b =>
                b.position === QB &&
                (b.rebuild_verdict === 'Soft Buy' ||
                    b.rebuild_verdict === 'Hard Buy')
        );

        const rebuildRbBuys = buySells.filter(
            b =>
                b.position === RB &&
                (b.rebuild_verdict === 'Soft Buy' ||
                    b.rebuild_verdict === 'Hard Buy')
        );

        const rebuildWrBuys = buySells.filter(
            b =>
                b.position === WR &&
                (b.rebuild_verdict === 'Soft Buy' ||
                    b.rebuild_verdict === 'Hard Buy')
        );

        const rebuildTeBuys = buySells.filter(
            b =>
                b.position === TE &&
                (b.rebuild_verdict === 'Soft Buy' ||
                    b.rebuild_verdict === 'Hard Buy')
        );
        const rebuildSells = buySells
            .filter(
                b =>
                    b.rebuild_verdict === 'Soft Sell' ||
                    b.rebuild_verdict === 'Hard Sell'
            )
            .sort((a, b) => sortNamesByAdp(a.name, b.name));

        const rebuildHolds = buySells
            .filter(
                b =>
                    b.rebuild_verdict === 'Hold' ||
                    b.rebuild_verdict === 'Hard Buy' ||
                    b.rebuild_verdict === 'Soft Buy'
            )
            .sort((a, b) => b.difference - a.difference);
        shuffle(rebuildQbBuys);
        shuffle(rebuildRbBuys);
        shuffle(rebuildWrBuys);
        shuffle(rebuildTeBuys);
        setRebuildQbBuys(rebuildQbBuys);
        setRebuildRbBuys(rebuildRbBuys);
        setRebuildWrBuys(rebuildWrBuys);
        setRebuildTeBuys(rebuildTeBuys);
        setRebuildSells(rebuildSells);
        setRebuildHolds(rebuildHolds);
    }, [buySells]);

    function shuffle(array: BuySellVerdict[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getVerdict(playerName: string) {
        const playerNickname = checkForNickname(playerName);
        const verdict = buySells.find(
            b =>
                b.name.replace(/\W/g, '').toLowerCase() ===
                    playerName.replace(/\W/g, '').toLowerCase() ||
                b.alt_name.replace(/\W/g, '').toLowerCase() ===
                    playerNickname.replace(/\W/g, '').toLowerCase() ||
                b.name.replace(/\W/g, '').toLowerCase() ===
                    playerNickname.replace(/\W/g, '').toLowerCase() ||
                b.alt_name.replace(/\W/g, '').toLowerCase() ===
                    playerName.replace(/\W/g, '').toLowerCase()
        );
        if (!verdict) {
            console.warn(
                `cannot find verdict with name = '${playerName}' or alt_name = '${playerNickname}'`
            );
            return undefined;
        }
        return verdict;
    }

    return {
        buySells,
        rebuildQbBuys,
        rebuildRbBuys,
        rebuildWrBuys,
        rebuildTeBuys,
        rebuildSells,
        rebuildHolds,
        contendQbBuys,
        contendRbBuys,
        contendWrBuys,
        contendTeBuys,
        contendSells,
        contendHolds,
        getVerdict,
    };
}

export function useBuySellData() {
    const [buySells] = useState(buySellsData as unknown as BuySellVerdict[]);
    const [qbBuys, setQbBuys] = useState<BuySellVerdict[]>([]);
    const [rbBuys, setRbBuys] = useState<BuySellVerdict[]>([]);
    const [wrBuys, setWrBuys] = useState<BuySellVerdict[]>([]);
    const [teBuys, setTeBuys] = useState<BuySellVerdict[]>([]);
    const [sells, setSells] = useState<BuySellVerdict[]>([]);
    const [holds, setHolds] = useState<BuySellVerdict[]>([]);
    const {sortNamesByAdp} = useAdpData();
    useEffect(() => {
        const qbBuys = buySells.filter(
            b =>
                b.position === QB &&
                (b.verdict === 'Soft Buy' || b.verdict === 'Hard Buy')
        );

        const rbBuys = buySells.filter(
            b =>
                b.position === RB &&
                (b.verdict === 'Soft Buy' || b.verdict === 'Hard Buy')
        );

        const wrBuys = buySells.filter(
            b =>
                b.position === WR &&
                (b.verdict === 'Soft Buy' || b.verdict === 'Hard Buy')
        );

        const teBuys = buySells.filter(
            b =>
                b.position === TE &&
                (b.verdict === 'Soft Buy' || b.verdict === 'Hard Buy')
        );
        const sells = buySells
            .filter(b => b.verdict === 'Soft Sell' || b.verdict === 'Hard Sell')
            .sort((a, b) => sortNamesByAdp(a.name, b.name));

        const holds = buySells
            .filter(
                b =>
                    b.verdict === 'Hold' ||
                    b.verdict === 'Hard Buy' ||
                    b.verdict === 'Soft Buy'
            )
            .sort((a, b) => b.difference - a.difference);
        shuffle(qbBuys);
        shuffle(rbBuys);
        shuffle(wrBuys);
        shuffle(teBuys);
        setQbBuys(qbBuys);
        setRbBuys(rbBuys);
        setWrBuys(wrBuys);
        setTeBuys(teBuys);
        setSells(sells);
        setHolds(holds);
    }, [buySells]);

    function shuffle(array: BuySellVerdict[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function getVerdict(playerName: string) {
        const playerNickname = checkForNickname(playerName);
        const verdict = buySells.find(
            b =>
                b.name.replace(/\W/g, '').toLowerCase() ===
                    playerName.replace(/\W/g, '').toLowerCase() ||
                b.alt_name.replace(/\W/g, '').toLowerCase() ===
                    playerNickname.replace(/\W/g, '').toLowerCase() ||
                b.name.replace(/\W/g, '').toLowerCase() ===
                    playerNickname.replace(/\W/g, '').toLowerCase() ||
                b.alt_name.replace(/\W/g, '').toLowerCase() ===
                    playerName.replace(/\W/g, '').toLowerCase()
        );
        if (!verdict) {
            console.warn(
                `cannot find verdict with name = '${playerName}' or alt_name = '${playerNickname}'`
            );
            return undefined;
        }
        return verdict;
    }

    return {
        buySells,
        qbBuys,
        rbBuys,
        wrBuys,
        teBuys,
        sells,
        holds,
        getVerdict,
    };
}

export interface PlayerData {
    [key: string]: Player;
}

export function usePlayerData() {
    const [playerData, setPlayerData] = useState<PlayerData>();

    const preprocess = (pd: PlayerData) => {
        for (const playerId in pd) {
            const player = pd[playerId];
            if (
                !SUPER_FLEX_SET.has(player.position) ||
                player.last_name === 'Invalid' ||
                player.first_name === 'Duplicate'
            ) {
                delete pd[playerId];
            }
        }
        return pd;
    };

    useEffect(() => {
        setPlayerData(preprocess(playersJson as unknown as PlayerData));
    }, []);

    return playerData;
}
export type PlayerValue = {
    Player: string;
    Value: number;
    Position: string;
    oneQbBonus: number;
    sfBonus: number;
    teValue?: number;
};

// This is a set of players that get a bump in one QB leagues
const oneQbBump = new Set(
    ['Josh Allen', 'Jayden Daniels', 'Jalen Hurts', 'Lamar Jackson'].map(n =>
        n.toLowerCase()
    )
);

// Uses adp data to calculate player values
export function usePlayerValues() {
    const {adpData, getAdp, getPositionalAdp} = useAdpData();

    const getPlayerValue = (playerName: string) => {
        const rank = getAdp(playerName);
        const datum = adpData[rank - 1];
        if (!datum) {
            return {
                Player: playerName,
                Value: 0,
                Position: '',
                oneQbBonus: 0,
                sfBonus: 0,
            };
        }
        const positionalRank = getPositionalAdp(playerName);
        return {
            Player: datum.player_name,
            Position: datum.Position,
            Value: 1.0808218554 * Math.pow(0.97230651306, rank) * 100,
            oneQbBonus: oneQbBump.has(playerName) ? 1 : 0,
            sfBonus: 0,
            teValue:
                datum.Position === TE
                    ? Math.max(10 - positionalRank + 1, 1)
                    : undefined,
        };
    };

    const getBump = (playerName: string, superFlex: boolean) => {
        const playerValue = getPlayerValue(playerName);
        if (playerValue) {
            if (superFlex) {
                return playerValue.sfBonus;
            } else {
                return playerValue.oneQbBonus;
            }
        }
        console.warn(
            `cannot find PlayerValue for player with name = '${playerName}'`
        );
        return 0;
    };

    return {getPlayerValue, getBump};
}

type adpDatum = {
    player_name: string;
    Position: string;
};

type Rank = {
    Player: string;
    Position: string;
};

export function useAdpData() {
    const [adpData, setAdpData] = useState<adpDatum[]>([]);
    useEffect(() => {
        setAdpData(
            (rankingsJson as unknown as Rank[]).map((p: Rank) => {
                return {
                    player_name: p.Player,
                    Position: p.Position,
                };
            })
        );
    }, [rankingsJson]);

    const getAdp = (playerName: string): number => {
        const playerNickname = checkForNickname(playerName);
        let adp = adpData.findIndex(
            a =>
                a.player_name.replace(/\W/g, '').toLowerCase() ===
                playerName.replace(/\W/g, '').toLowerCase()
        );
        if (adp >= 0) {
            return adp + 1;
        }
        adp = adpData.findIndex(
            a =>
                a.player_name.replace(/\W/g, '').toLowerCase() ===
                playerNickname.replace(/\W/g, '').toLowerCase()
        );
        if (adp >= 0) {
            return adp + 1;
        }
        return Infinity;
    };
    const getPositionalAdp = (playerName: string) => {
        const playerNickname = checkForNickname(playerName);
        const idx = getAdp(playerName) - 1;
        if (idx >= adpData.length) return Infinity;

        let adp = adpData
            .filter(player => player.Position === adpData[idx].Position)
            .findIndex(
                a =>
                    a.player_name.replace(/\W/g, '').toLowerCase() ===
                    playerName.replace(/\W/g, '').toLowerCase()
            );
        if (adp >= 0) {
            return adp + 1;
        }
        adp = adpData
            .filter(player => player.Position === adpData[idx].Position)
            .findIndex(
                a =>
                    a.player_name.replace(/\W/g, '').toLowerCase() ===
                    playerNickname.replace(/\W/g, '').toLowerCase()
            );
        if (adp >= 0) {
            return adp + 1;
        }
        return Infinity;
    };
    const sortByAdp = (a: Player, b: Player): number =>
        sortNamesByAdp(
            `${a.first_name} ${a.last_name}`,
            `${b.first_name} ${b.last_name}`
        );
    const sortNamesByAdp = (a: string, b: string): number =>
        getAdp(a) - getAdp(b);

    return {adpData, getAdp, sortByAdp, getPositionalAdp, sortNamesByAdp};
}

export const checkForNickname = (playerName: string) => {
    switch (playerName) {
        case 'Tank Dell':
            return 'Nathaniel Dell';
        case 'Nathaniel Dell':
            return 'Tank Dell';
        case 'Chig Okonkwo':
            return 'Chigoziem Okonkwo';
        case 'Chigoziem Okonkwo':
            return 'Chig Okonkwo';
        case 'Hollywood Brown':
            return 'Marquise Brown';
        case 'Marquise Brown':
            return 'Hollywood Brown';
        case 'Tyrone Tracy':
            return 'Tyrone Tracy Jr';
        case 'Tyrone Tracy Jr':
            return 'Tyrone Tracy';
        case 'Kenneth Walker':
            return 'Kenneth Walker III';
        case 'Kenneth Walker III':
            return 'Kenneth Walker';
        case 'Michael Penix':
            return 'Michael Penix Jr.';
        case 'Michael Penix Jr.':
            return 'Michael Penix';
        case 'Marvin Harrison':
            return 'Marvin Harrison Jr.';
        case 'Marvin Harrison Jr.':
            return 'Marvin Harrison';
        case 'Brian Thomas':
            return 'Brian Thomas Jr.';
        case 'Brian Thomas Jr.':
            return 'Brian Thomas';
        case 'Cam Ward':
            return 'Cameron Ward';
        case 'Cameron Ward':
            return 'Cam Ward';
        case "De'von Achane":
            return 'Devon Achane';
        case "De'Von Achane":
            return 'Devon Achane';
        case 'Devon Achane':
            return "De'Von Achane";
        default:
            return playerName;
    }
};

export function usePlayer(playerId: string) {
    const playerData = usePlayerData();
    const [player, setPlayer] = useState<Player>();

    useEffect(() => {
        if (!playerData) return;
        setPlayer(playerData[playerId]);
    }, [playerId, playerData]);

    return player;
}

export function useLeague(leagueId?: string) {
    const [league, setLeague] = useState<League>();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (!leagueId) {
            setLeague({
                settings: {
                    taxi_slots: +searchParams.get(TAXI_SLOTS)!,
                },
                scoring_settings: {
                    rec: +searchParams.get(PPR)!,
                    bonus_rec_te: +searchParams.get(TE_BONUS)!,
                },
            } as League);
            return;
        }
        getLeague(leagueId).then(l => setLeague(l));
    }, [leagueId]);
    return league;
}

export function useFetchUsers(rosters?: Roster[]) {
    return useQuery({
        queryKey: [rosters],
        enabled: !!rosters && rosters.length > 0,
        queryFn: async () => {
            if (!rosters || rosters.length === 0) {
                throw new Error('rosters is undefined or empty');
            }
            const users: User[] = [];
            for (const rosterId in rosters) {
                const roster = rosters[rosterId];
                if (!roster.owner_id) continue;
                users.push(await getUser(roster.owner_id));
            }
            return users;
        },
        staleTime: 10000,
    });
}

export function useFetchUser(
    teamId: string,
    rosters?: Roster[],
    disabled?: boolean
) {
    return useQuery({
        queryKey: [rosters, teamId],
        enabled: !!rosters && rosters.length > 0 && !!teamId && !disabled,
        queryFn: async () => {
            if (!rosters || rosters.length === 0) {
                throw new Error('rosters is undefined or empty');
            }
            const userId = rosters[+teamId].owner_id;
            if (!userId) return;
            return await getUser(userId);
        },
        staleTime: 10000,
    });
}

export function useFetchLeague(leagueId: string) {
    return useQuery({
        queryKey: [leagueId],
        queryFn: async () => {
            if (!leagueId) {
                throw new Error('leagueId is empty');
            }
            return await getLeague(leagueId);
        },
        staleTime: 10000,
    });
}

export function useFetchRosters(leagueIdNewName: string) {
    return useQuery({
        queryKey: [leagueIdNewName],
        queryFn: async () => {
            if (!leagueIdNewName) throw new Error('leagueId is empty');
            return await getRosters(leagueIdNewName);
        },
        staleTime: 10000,
    });
}

export function useRoster(
    rosters?: Roster[],
    teamId?: string,
    leagueId?: string
) {
    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [user, setUser] = useState<User>();
    const [roster, setRoster] = useState<Roster>();

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
        if (
            !rosters ||
            rosters.length === 0 ||
            !hasTeamId() ||
            !teamId ||
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
    }, [rosters, teamId, allUsers]);

    useEffect(() => {
        if (
            !allUsers.length ||
            !hasTeamId() ||
            !teamId ||
            +teamId >= allUsers.length
        ) {
            return;
        }
        setUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);

    return {roster, user, setRoster};
}

export function useLeagueIdFromUrl(): [
    string,
    Dispatch<SetStateAction<string>>
] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [leagueId, setLeagueId] = useState('');

    useEffect(() => {
        const leagueIdFromUrl = searchParams.get(LEAGUE_ID);
        if (!leagueIdFromUrl) return;

        setLeagueId(leagueIdFromUrl);
    }, [searchParams]);

    useEffect(() => {
        if (leagueId === searchParams.get(LEAGUE_ID) || !leagueId) return;

        setSearchParams(searchParams => {
            searchParams.set(LEAGUE_ID, leagueId);
            return searchParams;
        });
    }, [leagueId]);

    return [leagueId, setLeagueId];
}

export function useDisallowedBuysFromUrl(): [
    string[],
    Dispatch<SetStateAction<string[]>>
] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [disallowedBuys, setDisallowedBuys] = useState<string[]>([]);

    useEffect(() => {
        const disallowedBuysFromUrl = searchParams.get(DISALLOWED_BUYS);
        if (!disallowedBuysFromUrl) return;

        setDisallowedBuys(disallowedBuysFromUrl.split(','));
    }, [searchParams]);

    useEffect(() => {
        if (disallowedBuys === searchParams.get(DISALLOWED_BUYS)?.split(',')) {
            return;
        }
        if (!disallowedBuys || disallowedBuys.length === 0) {
            setSearchParams(searchParams => {
                searchParams.delete(DISALLOWED_BUYS);
                return searchParams;
            });
            return;
        }

        setSearchParams(searchParams => {
            searchParams.set(DISALLOWED_BUYS, disallowedBuys.join(','));
            return searchParams;
        });
    }, [disallowedBuys]);

    return [disallowedBuys, setDisallowedBuys];
}

export function useParamFromUrl(
    param: string,
    defaultValue?: string
): [string, Dispatch<SetStateAction<string>>] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [value, setValue] = useState('');

    useEffect(() => {
        const valueFromUrl = searchParams.get(param);
        if (!valueFromUrl) {
            setValue(defaultValue ?? '');
            return;
        }

        setValue(valueFromUrl);
    }, [searchParams, setValue]);

    useEffect(() => {
        if (value === searchParams.get(param) || value === '') return;

        setSearchParams(searchParams => {
            searchParams.set(param, value);
            return searchParams;
        });
    }, [value, setSearchParams]);

    return [value, setValue];
}

export function useTeamIdFromUrl(): [string, Dispatch<SetStateAction<string>>] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [teamId, setTeamId] = useState('');

    useEffect(() => {
        const teamIdFromUrl = searchParams.get(TEAM_ID);
        if (teamIdFromUrl === teamId) return;
        if (!teamIdFromUrl) {
            setTeamId(NONE_TEAM_ID);
            return;
        }

        setTeamId(teamIdFromUrl);
    }, [searchParams, setTeamId]);

    useEffect(() => {
        if (teamId === searchParams.get(TEAM_ID) || teamId === '') return;

        setSearchParams(searchParams => {
            searchParams.set(TEAM_ID, teamId);
            return searchParams;
        });
    }, [teamId, setSearchParams]);

    return [teamId, setTeamId];
}

export function useUserIdFromUrl(): [string, Dispatch<SetStateAction<string>>] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const userIdFromUrl = searchParams.get(USER_ID);
        if (userIdFromUrl === userId) return;
        if (!userIdFromUrl) {
            return;
        }

        setUserId(userIdFromUrl);
    }, [searchParams, setUserId]);

    useEffect(() => {
        if (userId === searchParams.get(USER_ID) || userId === '') return;

        setSearchParams(searchParams => {
            searchParams.set(USER_ID, userId);
            return searchParams;
        });
    }, [userId, setSearchParams]);

    return [userId, setUserId];
}

export function useModuleFromUrl(): [Module, Dispatch<SetStateAction<Module>>] {
    const [searchParams, setSearchParams] = useSearchParams();
    const [module, setModule] = useState(Module.Unspecified);

    useEffect(() => {
        const module = searchParams.get(MODULE);
        if (!module) {
            setModule(Module.Unspecified);
            return;
        }
        setModule(module as Module);
    }, [searchParams, setModule]);

    useEffect(() => {
        if (module === searchParams.get(MODULE) || !module) return;

        setSearchParams(searchParams => {
            searchParams.set(MODULE, module);
            return searchParams;
        });
    }, [module, setSearchParams]);

    return [module, setModule];
}

export function useRosterSettings(league?: League) {
    const [rosterSettings, setRosterSettings] = useState(
        new Map<string, number>()
    );
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const settings = new Map<string, number>();
        if (!league) {
            settings.set(QB, +searchParams.get(QB)!);
            settings.set(RB, +searchParams.get(RB)!);
            settings.set(WR, +searchParams.get(WR)!);
            settings.set(TE, +searchParams.get(TE)!);
            settings.set(FLEX, +searchParams.get(FLEX)!);
            settings.set(SUPER_FLEX, +searchParams.get(SUPER_FLEX)!);
            settings.set(BENCH, +searchParams.get(BENCH)!);
        } else if (league?.roster_positions) {
            league?.roster_positions.forEach(pos => {
                if (!settings.has(pos)) {
                    settings.set(pos, 0);
                }
                settings.set(pos, settings.get(pos)! + 1);
            });
        }

        setRosterSettings(settings);
    }, [league, league?.roster_positions, searchParams]);
    return rosterSettings;
}

export function useRosterSettingsFromId(leagueId?: string) {
    const league = useLeague(leagueId === undefined ? '' : leagueId);
    const [rosterSettings, setRosterSettings] = useState(
        new Map<string, number>()
    );
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const settings = new Map<string, number>();
        if (!leagueId) {
            settings.set(QB, +searchParams.get(QB)!);
            settings.set(RB, +searchParams.get(RB)!);
            settings.set(WR, +searchParams.get(WR)!);
            settings.set(TE, +searchParams.get(TE)!);
            settings.set(FLEX, +searchParams.get(FLEX)!);
            settings.set(SUPER_FLEX, +searchParams.get(SUPER_FLEX)!);
            settings.set(BENCH, +searchParams.get(BENCH)!);
        } else if (league?.roster_positions) {
            league?.roster_positions.forEach(pos => {
                if (!settings.has(pos)) {
                    settings.set(pos, 0);
                }
                settings.set(pos, settings.get(pos)! + 1);
            });
        }
        setRosterSettings(settings);
    }, [leagueId, league, league?.roster_positions, searchParams]);
    return rosterSettings;
}

export function useWeeklyRanks() {
    const [weeklyRanks] = useState(weeklyRankingsJson);
    function get1QBRanks(p: Player) {
        return get1QbRankByName(p.first_name + ' ' + p.last_name);
    }

    function get1QbRankByName(name: string) {
        const nickname = checkForNickname(name);
        const rank = weeklyRanks.findIndex(
            r => r['1QB'] === nickname || r['1QB'] === name
        );
        if (rank === -1) return Infinity;
        return rank;
    }
    function getSuperflexRanks(p: Player) {
        return getSuperflexRankByName(p.first_name + ' ' + p.last_name);
    }
    function getSuperflexRankByName(name: string) {
        const nickname = checkForNickname(name);
        const rank = weeklyRanks.findIndex(
            r => r['SF'] === nickname || r['SF'] === name
        );
        if (rank === -1) return Infinity;
        return rank;
    }
    function sortBy1QBRanks(a: Player, b: Player) {
        const aRank = get1QBRanks(a);
        const bRank = get1QBRanks(b);
        return aRank - bRank;
    }
    function sortBySuperflexRanks(a: Player, b: Player) {
        const aRank = getSuperflexRanks(a);
        const bRank = getSuperflexRanks(b);
        return aRank - bRank;
    }
    return {
        weeklyRanks,
        sortBy1QBRanks,
        sortBySuperflexRanks,
        get1QBRanks,
        getSuperflexRanks,
        getSuperflexRankByName,
        get1QbRankByName,
    };
}

export function useProjectedLineup(
    rosterSettings: Map<string, number>,
    playerIds?: string[],
    weekly = false
) {
    const playerData = usePlayerData();
    const [startingLineup, setStartingLineup] = useState<Lineup>([]);
    const [bench, setBench] = useState<Player[]>([]);
    const [benchString, setBenchString] = useState('');
    const {getAdp, sortByAdp} = useAdpData();
    const {
        sortBy1QBRanks,
        sortBySuperflexRanks,
        getSuperflexRankByName,
        get1QbRankByName,
    } = useWeeklyRanks();
    const isSuperflex =
        rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1;
    let sortFn: (a: Player, b: Player) => number;
    let getFn: (playerName: string) => number;
    if (!weekly) {
        sortFn = sortByAdp;
        getFn = getAdp;
    } else {
        if (isSuperflex) {
            sortFn = sortBySuperflexRanks;
            getFn = getSuperflexRankByName;
        } else {
            sortFn = sortBy1QBRanks;
            getFn = get1QbRankByName;
        }
    }

    useEffect(() => {
        if (!playerData || !playerIds) return;
        const remainingPlayers = new Set(playerIds);
        const starters: {player: Player; position: string}[] = [];
        Array.from(rosterSettings)
            .sort(
                // sort by number of positions allowed in slot
                // ie, SUPER_FLEX === 4, FLEX === 3, WR_RB_FLEX === 2, WR_TE_FLEX === 2
                (a, b) => {
                    if (a[0] === b[0]) {
                        return 0;
                    }
                    if (!a[0].includes(FLEX) && !b[0].includes(FLEX)) {
                        return 0;
                    }
                    if (a[0].includes(FLEX) && !b[0].includes(FLEX)) {
                        return 1;
                    }
                    if (!a[0].includes(FLEX) && b[0].includes(FLEX)) {
                        return -1;
                    }
                    if (a[0].includes(FLEX) && b[0].includes(FLEX)) {
                        if (
                            a[0] === WR_RB_FLEX ||
                            (a[0] === WR_TE_FLEX && b[0] === FLEX)
                        ) {
                            return -1;
                        }
                        if (
                            b[0] === WR_RB_FLEX ||
                            (b[0] === WR_TE_FLEX && a[0] === FLEX)
                        ) {
                            return 1;
                        }
                        if (a[0] === SUPER_FLEX) {
                            return 1;
                        }
                        if (b[0] === SUPER_FLEX) {
                            return -1;
                        }
                    }
                    return 0;
                }
            )
            .filter(([position]) => ALLOWED_POSITIONS.has(position))
            .forEach(([position, count]) => {
                const bestAtPosition = getBestNAtPosition(
                    position,
                    count,
                    remainingPlayers,
                    getFn,
                    sortFn,
                    playerData,
                    playerIds
                );
                for (let i = 0; i < count; i++) {
                    if (i >= bestAtPosition.length) {
                        starters.push({
                            player: {
                                player_id: '',
                                first_name: '',
                                last_name: '',
                            } as Player,
                            position: position,
                        });
                        continue;
                    }
                    const p = bestAtPosition[i];
                    remainingPlayers.delete(p.player_id);
                    starters.push({
                        player: p,
                        position: position,
                    });
                }
            });

        setStartingLineup(starters);
    }, [!!playerData, playerIds, rosterSettings]);

    useEffect(() => {
        if (!playerData || !playerIds) return;
        const remainingPlayers = new Set(playerIds);

        startingLineup.forEach(p => {
            remainingPlayers.delete(p.player.player_id);
        });

        const benchPlayerList = Array.from(remainingPlayers)
            .map(p => playerData[p])
            .filter(p => !!p);

        setBench(benchPlayerList);

        setBenchString(
            benchPlayerList
                .sort(
                    (a, b) =>
                        a.position.localeCompare(b.position) ||
                        a.last_name.localeCompare(b.last_name)
                )
                .reduce((acc, player, idx) => {
                    const isLast = idx === remainingPlayers.size - 1;
                    const trailingText = isLast ? '' : ', ';
                    return `${acc}${player.first_name[0]}. ${player.last_name} (${player.position})${trailingText}`;
                }, '')
                .toLocaleUpperCase()
        );
    }, [startingLineup]);

    return {startingLineup, setStartingLineup, bench, benchString};
}

export function useTitle(title: string) {
    useEffect(() => {
        const oldTitle = document.title;
        document.title = title;
        return () => {
            document.title = oldTitle;
        };
    }, [title]);
}

export function useAllPlayers() {
    const playerData = usePlayerData();
    const [allPlayers, setAllPlayers] = useState<string[]>([]);
    const [allPlayersSorted, setAllPlayersSorted] = useState<string[]>([]);
    const {sortByAdp} = useAdpData();
    useEffect(() => {
        if (!playerData) return;
        const players: string[] = [];
        for (const playerId in playerData) {
            players.push(playerId);
        }
        setAllPlayers(players);
    }, [playerData]);

    useEffect(() => {
        if (!playerData || !allPlayers) return;
        setAllPlayersSorted(
            allPlayers
                .map(p => playerData[p])
                .sort(sortByAdp)
                .map(p => p.player_id)
        );
    }, [allPlayers, playerData]);

    return allPlayersSorted;
}

export function useNonSleeper(
    rosters?: Roster[],
    specifiedUser?: User,
    setRoster?: (roster: Roster) => void,
    skipSearchParams = false
) {
    const [leagueId] = useLeagueIdFromUrl();
    const [searchParams, setSearchParams] = useSearchParams();
    const [nonSleeperIds, setNonSleeperIds] = useState<string[]>(
        (searchParams.get(NON_SLEEPER_IDS) || '').split('-')
    );
    const [nonSleeperRosterSettings, setNonSleeperRosterSettings] = useState(
        new Map([
            [QB, +(searchParams.get(QB) || 1)],
            [RB, +(searchParams.get(RB) || 2)],
            [WR, +(searchParams.get(WR) || 3)],
            [TE, +(searchParams.get(TE) || 1)],
            [FLEX, +(searchParams.get(FLEX) || 2)],
            [SUPER_FLEX, +(searchParams.get(SUPER_FLEX) || 1)],
            [BENCH, +(searchParams.get(BENCH) || 6)],
        ])
    );
    const [ppr, setPpr] = useState(+(searchParams.get(PPR) || 1));
    const [teBonus, setTeBonus] = useState(+(searchParams.get(TE_BONUS) || 1));
    const [numRosters, setNumRosters] = useState(
        +(searchParams.get(LEAGUE_SIZE) ?? rosters?.length ?? 12)
    );
    const [taxiSlots, setTaxiSlots] = useState(
        +(searchParams.get(TAXI_SLOTS) || 0)
    );
    const [teamName, setTeamName] = useState(
        searchParams.get(TEAM_NAME) ||
            specifiedUser?.metadata?.team_name ||
            specifiedUser?.display_name ||
            ''
    );

    useEffect(() => {
        if (!leagueId) return;
        setTeamName(
            specifiedUser?.metadata?.team_name ||
                specifiedUser?.display_name ||
                ''
        );
    }, [specifiedUser, leagueId]);

    useEffect(() => {
        if (skipSearchParams) return;
        if (leagueId) {
            setSearchParams(searchParams => {
                searchParams.delete(TEAM_NAME);
                return searchParams;
            });
        } else {
            setSearchParams(searchParams => {
                searchParams.set(TEAM_NAME, teamName);
                return searchParams;
            });
        }
    }, [teamName, leagueId, skipSearchParams]);

    useEffect(() => {
        setNumRosters(
            +(searchParams.get(LEAGUE_SIZE) ?? rosters?.length ?? 12)
        );
    }, [rosters]);

    useEffect(() => {
        if (skipSearchParams) return;
        if (leagueId) {
            setSearchParams(searchParams => {
                searchParams.delete(LEAGUE_SIZE);
                return searchParams;
            });
        } else {
            setSearchParams(searchParams => {
                searchParams.set(LEAGUE_SIZE, '' + numRosters);
                return searchParams;
            });
        }
    }, [numRosters, leagueId]);

    useEffect(() => {
        if (skipSearchParams) return;
        if (leagueId) {
            setSearchParams(searchParams => {
                searchParams.delete(PPR);
                searchParams.delete(TE_BONUS);
                searchParams.delete(TAXI_SLOTS);
                return searchParams;
            });
        } else {
            setSearchParams(searchParams => {
                searchParams.set(PPR, '' + ppr);
                searchParams.set(TE_BONUS, '' + teBonus);
                searchParams.set(TAXI_SLOTS, '' + taxiSlots);
                return searchParams;
            });
        }
    }, [ppr, teBonus, taxiSlots, leagueId]);

    useEffect(() => {
        if (skipSearchParams) return;
        if (leagueId) {
            setSearchParams(searchParams => {
                searchParams.delete(QB);
                searchParams.delete(RB);
                searchParams.delete(WR);
                searchParams.delete(TE);
                searchParams.delete(FLEX);
                searchParams.delete(SUPER_FLEX);
                searchParams.delete(BENCH);
                return searchParams;
            });
        } else {
            setSearchParams(searchParams => {
                searchParams.set(QB, '' + nonSleeperRosterSettings.get(QB));
                searchParams.set(RB, '' + nonSleeperRosterSettings.get(RB));
                searchParams.set(WR, '' + nonSleeperRosterSettings.get(WR));
                searchParams.set(TE, '' + nonSleeperRosterSettings.get(TE));
                searchParams.set(FLEX, '' + nonSleeperRosterSettings.get(FLEX));
                searchParams.set(
                    SUPER_FLEX,
                    '' + nonSleeperRosterSettings.get(SUPER_FLEX)
                );
                searchParams.set(
                    BENCH,
                    '' + nonSleeperRosterSettings.get(BENCH)
                );
                return searchParams;
            });
        }
    }, [nonSleeperRosterSettings, leagueId]);

    useEffect(() => {
        if (!setRoster) return;

        setRoster({
            players: nonSleeperIds,
        } as Roster);
    }, [nonSleeperIds, setRoster]);

    useEffect(() => {
        if (skipSearchParams) return;
        if (leagueId) {
            setSearchParams(searchParams => {
                searchParams.delete(NON_SLEEPER_IDS);
                return searchParams;
            });
        } else {
            setSearchParams(searchParams => {
                searchParams.set(
                    NON_SLEEPER_IDS,
                    nonSleeperIds.filter(id => !!id).join('-')
                );
                return searchParams;
            });
        }
    }, [nonSleeperIds, leagueId]);

    return {
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
    };
}

function getBestNAtPosition(
    position: string,
    count: number,
    remainingPlayers: Set<string>,
    getFn: (playerName: string) => number,
    sortFn: (a: Player, b: Player) => number,
    playerData: PlayerData,
    playerIds: string[]
): Player[] {
    switch (position) {
        case FLEX:
            return playerIds
                .filter(p => remainingPlayers.has(p))
                .map(p => playerData[p])
                .filter(
                    p =>
                        !!p &&
                        (p.fantasy_positions.includes(WR) ||
                            p.fantasy_positions.includes(RB) ||
                            p.fantasy_positions.includes(TE))
                )
                .sort(sortFn)
                .slice(0, count);
        case WR_RB_FLEX:
            return playerIds
                .filter(p => remainingPlayers.has(p))
                .map(p => playerData[p])
                .filter(
                    p =>
                        !!p &&
                        (p.fantasy_positions.includes(WR) ||
                            p.fantasy_positions.includes(RB))
                )
                .sort(sortFn)
                .slice(0, count);
        case WR_TE_FLEX:
            return playerIds
                .filter(p => remainingPlayers.has(p))
                .map(p => playerData[p])
                .filter(
                    p =>
                        !!p &&
                        (p.fantasy_positions.includes(WR) ||
                            p.fantasy_positions.includes(TE))
                )
                .sort(sortFn)
                .slice(0, count);

        case SUPER_FLEX:
            return playerIds
                .filter(p => remainingPlayers.has(p))
                .map(p => playerData[p])
                .filter(
                    p =>
                        !!p &&
                        (p.fantasy_positions.includes(WR) ||
                            p.fantasy_positions.includes(RB) ||
                            p.fantasy_positions.includes(TE) ||
                            p.fantasy_positions.includes(QB))
                )
                .sort(sortFn)
                .sort((a, b) => {
                    // maybe adjust this
                    const startingQbThreshold = 160;

                    // manually prioritizing starting level QBs for super flex
                    if (a.position === QB && b.position !== QB) {
                        if (
                            getFn(`${a.first_name} ${a.last_name}`) <
                            startingQbThreshold
                        ) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                    if (a.position !== QB && b.position === QB) {
                        if (
                            getFn(`${b.first_name} ${b.last_name}`) <
                            startingQbThreshold
                        ) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }
                    return sortFn(a, b);
                })
                .slice(0, count);
        default: // non-flex positions
            return playerIds
                .filter(p => remainingPlayers.has(p))
                .map(p => playerData[p])
                .filter(p => !!p && p.fantasy_positions.includes(position))
                .sort(sortFn)
                .slice(0, count);
    }
}
