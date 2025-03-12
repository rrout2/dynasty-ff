import styles from './Infinite.module.css';
import {
    blankInfiniteV4,
    domainLogo,
    tradeMeterButton,
    tradeMeterNeedle,
} from '../../../../consts/images';
import {
    useAdpData,
    useBuySellData,
    useFetchRosters,
    useLeague,
    useLeagueIdFromUrl,
    useNonSleeper,
    usePlayerData,
    useProjectedLineup,
    useRoster,
    useRosterSettings,
    useTeamIdFromUrl,
} from '../../../../hooks/hooks';
import {StartersGraphic} from '../../v1/modules/Starters/Starters';
import {GraphicComponent as PositionalGradesGraphic} from '../../v1/modules/PositionalGrades/PositionalGrades';
import {
    useCornerstones,
    GraphicComponent as CornerstonesGraphic,
} from '../../v1/modules/cornerstone/CornerstoneModule';
import {
    getAllUsers,
    getTeamName,
    Roster,
    User,
} from '../../../../sleeper-api/sleeper-api';
import ExportButton from '../../shared/ExportButton';
import RosterTierComponent, {
    RosterTier,
    useRosterTierAndPosGrades,
} from '../RosterTier/RosterTier';
import {
    BuySellTile,
    BuySellTileProps,
    useBuySells,
} from '../BuySellHold/BuySellHold';
import {QB, SUPER_FLEX} from '../../../../consts/fantasy';
import {TeamSelectComponent} from '../../../Team/TeamPage/TeamPage';
import {useEffect, useState} from 'react';
import {NONE_TEAM_ID} from '../../../../consts/urlParams';
export default function Infinite() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const {data: rosters} = useFetchRosters(leagueId);
    const {roster, user, setRoster} = useRoster(rosters, teamId, leagueId);
    const {cornerstones} = useCornerstones(roster);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [isNonSleeper, setIsNonSleeper] = useState(false);
    const [buys, setBuys] = useState<BuySellTileProps[]>([]);
    const {getAdp} = useAdpData();
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
        if (!leagueId || !rosters) return;
        const ownerIds = new Set(rosters.map(r => r.owner_id));
        getAllUsers(leagueId).then(users =>
            // filter to users included in owners.
            // some leagues have users with no associated owner I think.
            setAllUsers(users.filter(u => ownerIds.has(u.user_id)))
        );
    }, [leagueId, rosters]);

    const {
        nonSleeperRosterSettings,
        numRosters,
        teamName: nonSleeperTeamName,
    } = useNonSleeper(rosters, specifiedUser, setRoster);

    const {startingLineup, benchString, setStartingLineup} = useProjectedLineup(
        isNonSleeper ? nonSleeperRosterSettings : rosterSettings,
        roster?.players
    );
    useEffect(() => {
        setStartingLineup(startingLineup.slice(0, 14));
    }, [startingLineup.length]);

    useEffect(() => {
        setIsNonSleeper(!leagueId);
    }, [leagueId]);

    const {getVerdict} = useBuySellData();
    const [buyPercent, setBuyPercent] = useState(0);
    const [sellPercent, setSellPercent] = useState(0);
    const [holdPercent, setHoldPercent] = useState(0);
    const playerData = usePlayerData();
    useEffect(() => {
        if (!roster?.players || !playerData) return;
        const verdicts = roster.players
            .map(playerId => playerData[playerId])
            .filter(p => !!p && getAdp(`${p.first_name} ${p.last_name}`) <= 144)
            .map(p => getVerdict(`${p.first_name} ${p.last_name}`))
            .filter(v => !!v);
        setBuyPercent(
            Math.round(
                (100 *
                    verdicts.filter(v => v && v.verdict.includes('Buy'))
                        .length) /
                    verdicts.length
            )
        );
        setSellPercent(
            Math.round(
                (100 *
                    verdicts.filter(v => v && v.verdict.includes('Sell'))
                        .length) /
                    verdicts.length
            )
        );
        setHoldPercent(
            Math.round(
                (100 *
                    verdicts.filter(v => v && v.verdict.includes('Hold'))
                        .length) /
                    verdicts.length
            )
        );
    }, [roster, playerData, getVerdict]);

    const currentDate = new Date();
    const isSuperFlex = !isNonSleeper
        ? rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1
        : nonSleeperRosterSettings.has(SUPER_FLEX) ||
          (nonSleeperRosterSettings.get(QB) ?? 0) > 1;
    const {tier} = useRosterTierAndPosGrades(isSuperFlex, numRosters, roster);
    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    function getBenchStringClass() {
        const longBenchString = benchString.length >= 440;
        const mediumBenchString = benchString.length >= 321;
        return `${styles.benchStringGraphic} ${
            longBenchString
                ? styles.benchStringGraphicSmallest
                : mediumBenchString
                ? styles.benchStringGraphicSmaller
                : ''
        }`;
    }

    return (
        <>
            <ExportButton
                className={styles.fullBlueprint}
                pngName={`${getTeamName(user)}_infinite.png`}
                disabled={startingLineup.every(
                    ({player}) => player.first_name === ''
                )}
            />
            {leagueId && (
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
            )}
            <span>{buys.map(b => b.playerId).join(',')}</span>
            <div className={styles.fullBlueprint}>
                <div className={styles.startersGraphic}>
                    <StartersGraphic
                        startingLineup={startingLineup}
                        transparent={true}
                        infinite
                    />
                </div>
                <div className={styles.cornerstoneGraphic}>
                    <CornerstonesGraphic
                        cornerstones={cornerstones}
                        transparent={true}
                    />
                </div>
                <div className={getBenchStringClass()}>{benchString}</div>
                <TeamNameComponent
                    teamName={
                        isNonSleeper ? nonSleeperTeamName : getTeamName(user)
                    }
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
                <div className={styles.rosterTierGraphic}>
                    <RosterTierComponent
                        isSuperFlex={isSuperFlex}
                        leagueSize={numRosters}
                        roster={roster}
                    />
                </div>
                <BuySellHoldComponent
                    isSuperFlex={isSuperFlex}
                    leagueSize={numRosters}
                    roster={roster}
                    setBuys={setBuys}
                />
                <div className={styles.monthYear}>
                    {currentDate.toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </div>
                <div className={`${styles.buys} ${styles.marketValueAnalysis}`}>
                    BUYS: {buyPercent}%
                </div>
                <div
                    className={`${styles.sells} ${styles.marketValueAnalysis}`}
                >
                    SELLS: {sellPercent}%
                </div>
                <div
                    className={`${styles.holds} ${styles.marketValueAnalysis}`}
                >
                    HOLDS: {holdPercent}%
                </div>
                <div className={`${styles.buys} ${styles.bshComment}`}>
                    Players domain has ranked higher than market
                </div>
                <div className={`${styles.sells} ${styles.bshComment}`}>
                    Players domain has ranked lower than market
                </div>
                <div className={`${styles.holds} ${styles.bshComment}`}>
                    Players domain has ranked equal to market
                </div>
                <div className={styles.tradeMeterGraphic}>
                    <TradeMeterComponent
                        sellPercent={sellPercent}
                        tier={tier}
                    />
                </div>
                <img src={domainLogo} className={styles.domainLogo} />
                <img src={blankInfiniteV4} className={styles.blankBp} />
            </div>
        </>
    );
}

type TradeMeterComponentProps = {
    sellPercent: number;
    tier: RosterTier;
};
const TradeMeterComponent = ({sellPercent, tier}: TradeMeterComponentProps) => {
    let activity: 'high' | 'midhigh' | 'mid' | 'lowmid' | 'low' = 'low';
    let rotationDegrees = 0;
    switch (tier) {
        case RosterTier.Elite:
            if (sellPercent > 49) {
                activity = 'mid';
            } else if (sellPercent > 19) {
                activity = 'lowmid';
            } else {
                activity = 'low';
            }
            break;
        case RosterTier.Championship:
            if (sellPercent > 49) {
                activity = 'midhigh';
            } else if (sellPercent > 39) {
                activity = 'mid';
            } else if (sellPercent > 19) {
                activity = 'lowmid';
            } else {
                activity = 'low';
            }
            break;
        case RosterTier.Competitive:
            if (sellPercent > 49) {
                activity = 'high';
            } else if (sellPercent > 39) {
                activity = 'midhigh';
            } else if (sellPercent > 19) {
                activity = 'mid';
            } else if (sellPercent > 9) {
                activity = 'lowmid';
            } else {
                activity = 'low';
            }
            break;
        case RosterTier.Reload:
            if (sellPercent > 39) {
                activity = 'high';
            } else if (sellPercent > 19) {
                activity = 'midhigh';
            } else if (sellPercent > 9) {
                activity = 'mid';
            } else {
                activity = 'lowmid';
            }
            break;
        case RosterTier.Rebuild:
            if (sellPercent > 19) {
                activity = 'high';
            } else if (sellPercent > 9) {
                activity = 'midhigh';
            } else {
                activity = 'mid';
            }
            break;
    }

    switch (activity) {
        case 'high':
            rotationDegrees = 30;
            break;
        case 'midhigh':
            rotationDegrees = 0;
            break;
        case 'mid':
            rotationDegrees = -33;
            break;
        case 'lowmid':
            rotationDegrees = -71;
            break;
        case 'low':
            rotationDegrees = -100;
            break;
    }
    return (
        <div className={styles.tradeMeter}>
            <img
                src={tradeMeterNeedle}
                className={styles.tradeMeterNeedle}
                style={{transform: `rotate(${rotationDegrees}deg)`}}
            />
            <img src={tradeMeterButton} className={styles.tradeMeterButton} />
        </div>
    );
};

const countEmojis = (str: string): number => {
    // This regex matches most emoji patterns including:
    // - Single unicode emojis
    // - Compound emojis (e.g. family combinations)
    // - Emojis with skin tone modifiers
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;

    return (str.match(emojiRegex) || []).length;
};

const TeamNameComponent = ({teamName}: {teamName?: string}) => {
    if (!teamName) return <></>;
    // Emojis count as 2 characters since they are wider.
    const teamNameSize = teamName.length + countEmojis(teamName);
    const longName = teamNameSize >= 14 && teamNameSize < 23;
    const veryLongName = teamNameSize >= 23;
    return (
        <div
            className={`${styles.teamNameGraphic} ${
                longName ? styles.smallerTeamName : ''
            } ${veryLongName ? styles.smallestTeamName : ''}`}
        >
            {teamName}
        </div>
    );
};

const BuySellHoldComponent = ({
    isSuperFlex,
    leagueSize,
    roster,
    setBuys,
}: {
    isSuperFlex: boolean;
    leagueSize: number;
    roster?: Roster;
    setBuys?: (buys: BuySellTileProps[]) => void;
}) => {
    const {buys, sells} = useBuySells(isSuperFlex, leagueSize, roster);

    useEffect(() => {
        if (setBuys) {
            setBuys(buys);
        }
    }, [setBuys, buys]);

    const column1 = '640px';
    const column2 = '1002px';

    const row1 = '1102px';
    const row2 = '1246px';
    const row3 = '1478px';
    return (
        <>
            <div
                className={styles.buySellHoldGraphic}
                style={{left: column1, top: row1}}
            >
                <BuySellTile {...buys[0]} />
            </div>
            <div
                className={styles.buySellHoldGraphic}
                style={{left: column1, top: row2}}
            >
                <BuySellTile {...buys[1]} />
            </div>
            <div
                className={styles.buySellHoldGraphic}
                style={{left: column2, top: row1}}
            >
                <BuySellTile {...buys[2]} />
            </div>
            <div
                className={styles.buySellHoldGraphic}
                style={{left: column2, top: row2}}
            >
                <BuySellTile {...buys[3]} />
            </div>
            <div
                className={styles.buySellHoldGraphic}
                style={{left: column1, top: row3}}
            >
                <BuySellTile {...sells[0]} />
            </div>
            <div
                className={styles.buySellHoldGraphic}
                style={{left: column2, top: row3}}
            >
                <BuySellTile {...sells[1]} />
            </div>
        </>
    );
};
