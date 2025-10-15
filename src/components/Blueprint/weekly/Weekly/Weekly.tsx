import styles from './Weekly.module.css';
import {bakeryCard, blankWeekly} from '../../../../consts/images';
import {
    useFetchRosters,
    useLeague,
    useLeagueIdFromUrl,
    useNonSleeper,
    usePlayerData,
    useProjectedLineup,
    useRoster,
    useRosterSettings,
    useStoplights,
    useTeamIdFromUrl,
    useUserIdFromUrl,
    useWeeklyRanks,
    useWeeklyRisersFallers,
} from '../../../../hooks/hooks';
import {PlayerRow, StartersGraphic} from '../../v1/modules/Starters/Starters';
import {GraphicComponent as PositionalGradesGraphic} from '../../v1/modules/PositionalGrades/PositionalGrades';
import {
    getAllUsers,
    getTeamName,
    Player,
    User,
} from '../../../../sleeper-api/sleeper-api';
import ExportButton from '../../shared/ExportButton';
import {BuySellTileProps} from '../../infinite/BuySellHold/BuySellHold';
import {QB, SUPER_FLEX} from '../../../../consts/fantasy';
import {useEffect, useState} from 'react';
import {NONE_TEAM_ID} from '../../../../consts/urlParams';
import {
    BuySellHoldComponent,
    TeamNameComponent,
} from '../../infinite/Infinite/Infinite';
import {
    RosterTier,
    useRosterTierAndPosGrades,
} from '../../infinite/RosterTier/RosterTier';

type InSeasonVerdict = 'TROUBLE' | 'SOLID' | 'SHAKY';

export default function Weekly() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const [userId] = useUserIdFromUrl();
    const [buys, setBuys] = useState<BuySellTileProps[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [teamName, setTeamName] = useState('');

    return (
        <>
            <ExportButton
                className={styles.fullBlueprint}
                pngName={`${teamName}_weekly.png`}
                disabled={!loaded}
            />
            <span>{buys.map(b => b.playerId).join(',')}</span>
            <WeeklyBlueprint
                leagueId={leagueId}
                teamId={teamId}
                setTeamId={setTeamId}
                userId={userId}
                setBuys={setBuys}
                setLoaded={setLoaded}
                setTeamName={setTeamName}
            />
        </>
    );
}

export type WeeklyBlueprintProps = {
    leagueId: string;
    teamId: string;
    setTeamId: (teamId: string) => void;
    userId?: string;
    setBuys?: (buys: BuySellTileProps[]) => void;
    setLoaded?: (loaded: boolean) => void;
    setTeamName?: (name: string) => void;
    classNameForExport?: string;
};

export function WeeklyBlueprint({
    leagueId,
    teamId,
    setTeamId,
    userId,
    setBuys,
    setLoaded,
    setTeamName,
    classNameForExport,
}: WeeklyBlueprintProps) {
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const {data: rosters} = useFetchRosters(leagueId);
    const {roster, user, setRoster} = useRoster(rosters, teamId, leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [isNonSleeper, setIsNonSleeper] = useState(false);
    const [inSeasonVerdict, setInSeasonVerdict] =
        useState<InSeasonVerdict>('SOLID');

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

    useEffect(() => {
        if (!allUsers.length || !userId || !rosters) {
            return;
        }
        const rosterIndex = rosters.findIndex(
            r => r.owner_id === userId || r.co_owners?.includes(userId)
        );
        console.log('rosterIndex', rosterIndex);
        if (rosterIndex === -1) {
            console.warn(
                `could not find user with id '${userId}' in rosters' owners: ${rosters.flatMap(
                    r => [r.owner_id, ...(r.co_owners || [])]
                )}`
            );
            return;
        }
        const userIndex = allUsers.findIndex(
            u => u.user_id === rosters[rosterIndex].owner_id
        );
        console.log('userIndex', userIndex);
        setTeamId('' + userIndex);
        setSpecifiedUser(allUsers[userIndex]);
    }, [allUsers, userId, rosters]);

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
        if (!setTeamName) return;
        setTeamName(getTeamName(user));
    }, [user]);

    const {
        nonSleeperRosterSettings,
        numRosters,
        teamName: nonSleeperTeamName,
    } = useNonSleeper(rosters, specifiedUser, setRoster, true);

    const {startingLineup, setStartingLineup, bench} = useProjectedLineup(
        isNonSleeper ? nonSleeperRosterSettings : rosterSettings,
        roster?.players,
        true
    );
    const [flexOptions, setFlexOptions] = useState<Player[]>([]);
    const playerData = usePlayerData();
    const {risers, fallers} = useWeeklyRisersFallers(roster);
    const {findStoplight} = useStoplights();
    const [winLossRecord, setWinLossRecord] = useState<number[]>([0, 0]);
    useEffect(() => {
        setStartingLineup(startingLineup.slice(0, 14));
    }, [startingLineup.length]);

    useEffect(() => {
        setIsNonSleeper(!leagueId);
    }, [leagueId]);
    const isSuperFlex = !isNonSleeper
        ? rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1
        : nonSleeperRosterSettings.has(SUPER_FLEX) ||
          (nonSleeperRosterSettings.get(QB) ?? 0) > 1;
    useEffect(() => {
        setFlexOptions(
            bench
                .sort(isSuperFlex ? sortBySuperflexRanks : sortBy1QBRanks)
                .filter(p => p.position !== QB)
                .slice(0, 2)
        );
    }, [bench, isSuperFlex]);

    useEffect(() => {
        if (!setLoaded) return;
        setLoaded(startingLineup.some(({player}) => player.first_name !== ''));
    }, [startingLineup]);

    useEffect(() => {
        if (!roster || !roster.settings) return;
        setWinLossRecord([roster.settings.wins, roster.settings.losses]);
    }, [roster?.settings]);

    const {tier} = useRosterTierAndPosGrades(
        isSuperFlex,
        rosters?.length || numRosters || 12,
        roster
    );
    const {sortBy1QBRanks, sortBySuperflexRanks} = useWeeklyRanks();
    useEffect(() => {
        if (!rosters || !roster?.settings || isNonSleeper) return;
        const pointsForList = rosters.map(r => r.settings.fpts).sort();
        const pointsFor = roster.settings.fpts;
        const rank = pointsForList.findIndex(p => p === pointsFor) + 1;
        const percentile = (rank / rosters.length) * 100;
        const winPercentage = (roster.settings.wins / (roster.settings.wins + roster.settings.losses + roster.settings.ties)) * 100;
        const weightedPercentile = winPercentage * 0.4 + percentile * 0.6;
        if (weightedPercentile > 65) {
            setInSeasonVerdict('SOLID');
        } else if (weightedPercentile > 35) {
            setInSeasonVerdict('SHAKY');
        } else {
            setInSeasonVerdict('TROUBLE');
        }
    }, [rosters, roster, isNonSleeper]);
    useEffect(() => {
        if (!isNonSleeper) return;
        switch (tier) {
            case RosterTier.Rebuild:
            case RosterTier.Reload:
                setInSeasonVerdict('TROUBLE');
                break;
            case RosterTier.Competitive:
                setInSeasonVerdict('SHAKY');
                break;
            case RosterTier.Championship:
            case RosterTier.Elite:
                setInSeasonVerdict('SOLID');
        }
    }, [tier, isNonSleeper]);
    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }
    return (
        <div className={`${styles.fullBlueprint} ${classNameForExport || ''}`}>
            <div className={styles.startersGraphic}>
                <StartersGraphic
                    startingLineup={startingLineup}
                    transparent={true}
                    weekly
                />
            </div>
            <div className={styles.flexOptionsGraphic}>
                {flexOptions.map(player => (
                    <PlayerRow
                        key={player.player_id}
                        player={player}
                        position={'BN'}
                        infinite={false}
                        weekly={true}
                        stoplight={findStoplight(
                            `${player.first_name} ${player.last_name}`
                        )}
                    />
                ))}
            </div>
            <div className={styles.winLossRecordGraphic}>
                {winLossRecord.join('-')}
            </div>
            {playerData && (
                <>
                    <div className={styles.risersGraphic}>
                        {risers.map(player => {
                            return (
                                <div
                                    className={styles.riserFallerName}
                                    key={player}
                                >
                                    {maybeShortenedNameString(player)}
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles.fallersGraphic}>
                        {fallers.map(player => {
                            return (
                                <div
                                    className={styles.riserFallerName}
                                    key={player}
                                >
                                    {maybeShortenedNameString(player)}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            <TeamNameComponent
                teamName={isNonSleeper ? nonSleeperTeamName : getTeamName(user)}
            />
            <div className={styles.positionalGradesGraphic}>
                <PositionalGradesGraphic
                    transparent={true}
                    roster={roster}
                    isSuperFlex={isSuperFlex}
                    leagueSize={numRosters}
                    numStarters={startingLineup.length}
                />
            </div>
            <div
                className={styles.rosterTierGraphic}
                style={{color: getVerdictColor(inSeasonVerdict)}}
            >
                {inSeasonVerdict}
            </div>
            <BuySellHoldComponent
                isSuperFlex={isSuperFlex}
                leagueSize={numRosters}
                roster={roster}
                setBuys={setBuys}
                weekly={true}
                inSeasonVerdict={inSeasonVerdict}
            />
            <div className={styles.monthYear}>Week 7</div>
            {/* <img src={bakeryCard} className={styles.bakeryCard} /> */}
            <img src={blankWeekly} className={styles.blankBp} />
        </div>
    );
}

function getVerdictColor(tier: InSeasonVerdict): string {
    switch (tier) {
        case 'TROUBLE':
            return '#c15252';
        case 'SOLID':
            return '#8dc63f';
        case 'SHAKY':
            return '#f1bb1f';
        default:
            return '#000000';
    }
}

function maybeShortenedNameString(fullName: string): string {
    const [firstName, lastName] = fullName.split(' ');
    if (fullName.length >= 15) {
        return `${firstName[0]}. ${lastName}`;
    }
    return fullName;
}
