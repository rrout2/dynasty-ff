import {
    getDrafts,
    getLeague,
    getRosters,
    getTradedPicksFromLeague,
} from './sleeper-api';

// Type definitions
interface LeagueData {
    leagueId: string;
    season: string;
    leagueSize: number;
    users: Array<{
        userId: string;
        displayName?: string;
        userName?: string;
    }>;
}

interface DraftOrder {
    [userId: string]: number;
}

interface Draft {
    draftOrder: DraftOrder;
    type: string;
}

interface RosterIdToOwnerId {
    [rosterId: string]: string;
}

interface TeamNames {
    [rosterId: string]: string;
}

interface Team {
    ownerId: string;
    name: string;
    picks: {
        [season: string]: Array<Pick>;
    };
}

interface Teams {
    [rosterId: number]: Team;
}

interface Pick {
    season: string;
    round: number;
    original_roster_id: number;
    current_owner_id: number;
    overallPickIndex?: number;
    slot?: number;
}

export interface FinalPickData {
    pick_name: string;
    round: number;
    season: string;
    slot: number;
}

export interface GetPicksResult {
    picks: {
        [ownerId: string]: Array<FinalPickData>;
    };
    hasDraftOccurred: boolean;
}

export const CURRENT_SEASON = '2025';

/**
 * Returns a string describing the number of picks in each round for a given year.
 * For example, if a team has 2 first-round picks, 1 second-round pick, and 1 third-round pick,
 * this function will return '2 1sts, 1 2nd, 1 3rd'.
 * If the team has no picks in a given year, this function will return an empty string.
 * @param {FinalPickData[]} picks - an array of picks for a given team
 * @param {string} year - the year for which to generate the string
 * @returns {string} - a string describing the number of picks in each round for the given year
 */
export const getPicksInfo = (picks: FinalPickData[], year: string) => {
    const thisYearPicks = picks.filter(p => p.season === year);
    if (thisYearPicks.length === 0) {
        return '';
    }

    const hasSlots = thisYearPicks.some(p => !!p.slot && p.slot > 0);
    if (hasSlots) {
        return thisYearPicks
            .map(p => `${p.round}.${p.slot < 10 ? '0' : ''}${p.slot}`)
            .join(', ');
    }

    const numFirsts = thisYearPicks.filter(p => p.round === 1).length;
    const numSeconds = thisYearPicks.filter(p => p.round === 2).length;
    const numThirds = thisYearPicks.filter(p => p.round === 3).length;
    const numFourths = thisYearPicks.filter(p => p.round === 4).length;
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
    const allRoundsInfo = `${[firstInfo, secondInfo, thirdInfo, fourthInfo]
        .filter(info => info !== '')
        .join(', ')}`;
    return allRoundsInfo;
};

// Convert "overallPickIndex" => "fantasy round + slot" for labeling
function computeFantasyRoundAndSlot(
    overallPickIndex: number,
    leagueSize: number
): {round: number; slot: number} {
    const round = Math.floor((overallPickIndex - 1) / leagueSize) + 1;
    const slot = ((overallPickIndex - 1) % leagueSize) + 1;
    return {round, slot};
}

// Reverse lookup: find which user has draftOrder[userId] === slot
function findUserIdBySlot(draftOrder: DraftOrder, slot: number): string | null {
    return Object.keys(draftOrder).find(u => draftOrder[u] === slot) || null;
}

// We get the roster that originally owns the pick in a "standard snake" or "linear" approach
function getOriginalRosterIdForPick(
    round: number,
    pickInRound: number,
    leagueSize: number,
    rosterIdToOwnerId: RosterIdToOwnerId,
    draftOrder: DraftOrder | null,
    isSnake: boolean
): number {
    if (!draftOrder) {
        // fallback: just say "the original owner was 'pickInRound'"
        return pickInRound;
    }

    // If it's a snake draft AND we're in an even round, invert the slot
    let actualSlot = pickInRound;
    if (isSnake && round % 2 === 0) {
        actualSlot = leagueSize - pickInRound + 1;
    }

    // Now find which user has that "actualSlot" in round 1's draftOrder
    const userId = findUserIdBySlot(draftOrder, actualSlot);
    if (!userId) {
        // fallback
        return pickInRound;
    }

    // find which roster belongs to that user
    const foundRosterId = Object.keys(rosterIdToOwnerId).find(
        r => rosterIdToOwnerId[r] === userId
    );
    return foundRosterId ? Number(foundRosterId) : pickInRound;
}

export async function getPicks(
    leagueData: LeagueData
): Promise<GetPicksResult> {
    try {
        const leagueId = leagueData.leagueId;

        // Fetch data from Sleeper
        const [
            tradedPicksResponse,
            rostersResponse,
            draftsResponse,
            sleeperLeagueDataResponse,
        ] = await Promise.all([
            getTradedPicksFromLeague(leagueId),
            getRosters(leagueId),
            getDrafts(leagueId),
            getLeague(leagueId),
        ]);

        const tradedPicks = tradedPicksResponse;
        const rosters = rostersResponse;
        const drafts = draftsResponse;
        const sleeperLeagueData = sleeperLeagueDataResponse;

        // Create mapping from owner_id to user name
        const ownerIdToUserName: {[ownerId: string]: string} = {};
        leagueData.users.forEach(user => {
            ownerIdToUserName[user.userId] =
                user.displayName || user.userName || `User ${user.userId}`;
        });

        // Create mapping from roster_id to owner_id
        const rosterIdToOwnerId: RosterIdToOwnerId = {};
        rosters.forEach(roster => {
            rosterIdToOwnerId[roster.roster_id] = roster.owner_id;
        });

        // Create mapping from roster_id to team names
        const teamNames: TeamNames = {};
        for (const rosterId in rosterIdToOwnerId) {
            const ownerId = rosterIdToOwnerId[rosterId];
            const userName = ownerIdToUserName[ownerId] || `Team ${rosterId}`;
            teamNames[rosterId] = userName;
        }

        // Determine which seasons we care about
        const currentSeason = Number(leagueData.season);
        let draftStatus: string | null = null;
        let hasDraftOccurred = true; // Default to true

        // Find the draft for the current season
        const currentSeasonDraft = drafts.find(
            (d: {season: string}) => d.season === String(currentSeason)
        );
        if (currentSeasonDraft) {
            draftStatus = currentSeasonDraft.status;
            if (draftStatus === 'pre_draft' || draftStatus === 'drafting') {
                hasDraftOccurred = false;
            }
        }

        // Determine seasons for picks based on draft status
        let seasons: string[] = [];
        // If the current draft HAS occurred (or there's no draft info), get picks for next two years
        if (hasDraftOccurred) {
            seasons = [String(currentSeason + 1), String(currentSeason + 2)];
        }
        // If the current draft has NOT occurred, get picks for current and next year
        else {
            seasons = [String(currentSeason), String(currentSeason + 1)];
        }

        // Initialize picks object for each team
        const teams: Teams = {};
        for (let rId = 1; rId <= leagueData.leagueSize; rId++) {
            const ownerId = rosterIdToOwnerId[rId.toString()];
            teams[rId] = {
                ownerId,
                name: teamNames[rId.toString()] || `Team ${rId}`,
                picks: {},
            };
        }

        // Identify the CURRENT_SEASON draft to get draftOrder + type
        let currentDraft: Draft | null = null;
        for (const d of drafts) {
            if (d.season === '' + currentSeason) {
                currentDraft = {
                    draftOrder: d.draft_order,
                    type: d.type,
                };
                break;
            }
        }
        const draftOrder = currentDraft ? currentDraft.draftOrder : null;
        const isSnakeDraft: boolean =
            !!currentDraft && currentDraft.type === 'snake'; // or 'linear'

        // We'll store all picks in allPicks, then allocate them to teams after trades
        const allPicks: Pick[] = [];

        // Figure out how many rounds this league actually has, but cap at 4
        let leagueDraftRounds = sleeperLeagueData.settings?.draft_rounds || 4;
        if (leagueDraftRounds > 4) {
            leagueDraftRounds = 4;
        }

        // For each relevant season
        for (const season of seasons) {
            if (season !== currentSeason.toString()) {
                //
                // For 2026 (and beyond) => simpler logic, just generate up to leagueDraftRounds
                //
                for (let r = 1; r <= leagueDraftRounds; r++) {
                    for (let rId = 1; rId <= leagueData.leagueSize; rId++) {
                        allPicks.push({
                            season,
                            round: r,
                            original_roster_id: rId,
                            current_owner_id: rId,
                        });
                    }
                }
            } else {
                //
                // =============================
                // Special Handling for CURRENT_SEASON
                // =============================
                //
                // Use universal enumerator = leagueDraftRounds * leagueSize
                const maxPicks = leagueDraftRounds * leagueData.leagueSize;

                for (let i = 1; i <= maxPicks; i++) {
                    // "Fantasy" round & slot for naming
                    const {round, slot} = computeFantasyRoundAndSlot(
                        i,
                        leagueData.leagueSize
                    );

                    // Original owner => who picks "slot" in that round (linear or snake)
                    const originalRosterId = getOriginalRosterIdForPick(
                        round,
                        slot,
                        leagueData.leagueSize,
                        rosterIdToOwnerId,
                        draftOrder,
                        isSnakeDraft
                    );

                    allPicks.push({
                        season,
                        overallPickIndex: i,
                        round,
                        slot,
                        original_roster_id: originalRosterId,
                        current_owner_id: originalRosterId,
                    });
                }
            }
        }

        // Process traded picks (still from Sleeper: {round, season, roster_id, owner_id})
        tradedPicks.forEach(trade => {
            const {round, season, roster_id, owner_id} = trade;

            // Only process relevant seasons & up to leagueDraftRounds
            if (!seasons.includes(season)) return;
            if (round < 1 || round > leagueDraftRounds) return;

            if (season === currentSeason.toString()) {
                // find the CURRENT_SEASON pick with .round===round & original_roster_id===roster_id
                const pickToUpdate = allPicks.find(
                    p =>
                        p.season === currentSeason.toString() &&
                        p.round === round &&
                        p.original_roster_id === Number(roster_id)
                );
                if (pickToUpdate) {
                    pickToUpdate.current_owner_id = Number(owner_id);
                }
            } else {
                // e.g. 2026
                const pickToUpdate = allPicks.find(
                    p =>
                        p.season === season &&
                        p.round === round &&
                        p.original_roster_id === Number(roster_id)
                );
                if (pickToUpdate) {
                    pickToUpdate.current_owner_id = Number(owner_id);
                }
            }
        });

        // Organize picks into team => picks => season
        allPicks.forEach(pick => {
            const {season, current_owner_id} = pick;
            const team = teams[current_owner_id];
            if (!team) return;

            if (!team.picks[season]) {
                team.picks[season] = [];
            }
            team.picks[season].push(pick);
        });

        // Sort picks for each team
        for (const teamObj of Object.values(teams)) {
            for (const season of seasons) {
                if ((teamObj as Team).picks[season]) {
                    if (season === currentSeason.toString()) {
                        // Sort by overallPickIndex (lowest first)
                        (teamObj as Team).picks[season].sort(
                            (a, b) =>
                                (a.overallPickIndex || 999999) -
                                (b.overallPickIndex || 999999)
                        );
                    } else {
                        // Sort by round
                        (teamObj as Team).picks[season].sort(
                            (a, b) => a.round - b.round
                        );
                    }
                }
            }
        }

        // Now build finalResults => ownerId => picks[]
        const finalResults: {[ownerId: string]: Array<FinalPickData>} = {};

        // Sort the seasons numerically so the final output is CURRENT_SEASON, then CURRENT_SEASON + 1, etc.
        const sortedSeasons = seasons
            .map(Number)
            .sort((a, b) => a - b)
            .map(String);

        for (const rosterId in teams) {
            const team = teams[Number(rosterId)];
            const ownerId = team.ownerId;
            const picksArray: FinalPickData[] = [];

            // We push picks in ascending season order
            sortedSeasons.forEach(season => {
                const pickList = team.picks[season] || [];
                pickList.forEach(p => {
                    let pickName = `${season} Round ${p.round}`; // fallback label
                    if (p.slot && p.slot > 0) {
                        pickName += `, Pick ${p.slot}`;
                    }

                    // Append original owner
                    if (
                        p.original_roster_id &&
                        p.original_roster_id !== p.current_owner_id
                    ) {
                        const originalName =
                            teamNames[p.original_roster_id.toString()] ||
                            `Team ${p.original_roster_id}`;
                        pickName += ` (${originalName})`;
                    }

                    picksArray.push({
                        pick_name: pickName,
                        round: p.round,
                        slot: p.slot || -1,
                        season,
                    });
                });
            });

            finalResults[ownerId] = picksArray;
        }

        return {picks: finalResults, hasDraftOccurred};
    } catch (error) {
        console.error('Error in getPicks:', error);
        // Return default structure in case of error
        return {picks: {}, hasDraftOccurred: true};
    }
}
