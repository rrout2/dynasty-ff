import {CSSProperties, useEffect, useState} from 'react';
import styles from './NewInfinite.module.css';
import {
    domainShield,
    newInfiniteBg,
    nflSilhouette,
} from '../../../consts/images';
import {
    useDraftCapitalGrade,
    useFetchRosters,
    useLeague,
    useLeagueIdFromUrl,
    usePositionalValueGrades,
    useProjectedLineup,
    useRoster,
    useRosterSettings,
    useTeamIdFromUrl,
    useUserIdFromUrl,
} from '../../../hooks/hooks';
import {getAllUsers, User} from '../../../sleeper-api/sleeper-api';
import {NONE_TEAM_ID} from '../../../consts/urlParams';
import {getDisplayName} from '../../Team/TeamPage/TeamPage';
import {PositionalGradeDisc} from '../NewV1/NewV1';
import {logoImage} from '../shared/Utilities';
import {NONE_PLAYER_ID} from '../v2/modules/CornerstonesModule/CornerstonesModule';
import {
    FLEX,
    QB,
    RB,
    SUPER_FLEX,
    TE,
    WR,
    WR_RB_FLEX,
    WR_TE_FLEX,
} from '../../../consts/fantasy';
export default function NewInfinite() {
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const [rosterId, setRosterId] = useState<number>(-1);
    const [userId] = useUserIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const {roster} = useRoster(rosters, teamId, leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();

    const [currentDate] = useState(new Date());

    const {startingLineup, benchString} = useProjectedLineup(
        rosterSettings,
        roster?.players
    );
    const {
        qb: qbGrade,
        rb: rbGrade,
        wr: wrGrade,
        te: teGrade,
    } = usePositionalValueGrades(leagueId, '' + rosterId);
    const {draftCapitalGrade: draftCapitalScore} = useDraftCapitalGrade(
        leagueId,
        '' + rosterId
    );

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
        if (!rosters || !specifiedUser) return;
        setRosterId(
            rosters.findIndex(r => r.owner_id === specifiedUser.user_id) ?? -1
        );
    }, [rosters, specifiedUser]);
    useEffect(() => {
        if (!allUsers.length || !userId || !rosters) {
            return;
        }
        const userIndex = rosters.findIndex(
            r => r.owner_id === userId || r.co_owners?.includes(userId)
        );
        if (userIndex === -1) {
            console.warn(
                `could not find user with id '${userId}' in allUsers ${allUsers}`
            );
            return;
        }
        setTeamId('' + userIndex);
        setSpecifiedUser(allUsers[userIndex]);
    }, [allUsers, userId, rosters]);

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    return (
        <>
            notes: bench score is hard coded. Lineup BSH values are hard coded.
            <div className={styles.fullBlueprint}>
                <div className={styles.teamName}>
                    {getDisplayName(specifiedUser)}
                </div>
                <div className={styles.monthYear}>
                    {currentDate.toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </div>
                <PositionalGradeDisc
                    grade={qbGrade}
                    color={'#DB2335'}
                    style={{
                        left: '652px',
                        top: '553px',
                        transform: 'scale(1.63)',
                        transformOrigin: 'top left',
                    }}
                />
                <PositionalGradeDisc
                    grade={rbGrade}
                    color={'#00B1FF'}
                    style={{
                        left: '780px',
                        top: '553px',
                        transform: 'scale(1.63)',
                        transformOrigin: 'top left',
                    }}
                />
                <PositionalGradeDisc
                    grade={wrGrade}
                    color={'#1AE069'}
                    style={{
                        left: '906px',
                        top: '553px',
                        transform: 'scale(1.63)',
                        transformOrigin: 'top left',
                    }}
                />
                <PositionalGradeDisc
                    grade={teGrade}
                    color={'#FFCD00'}
                    style={{
                        left: '1033px',
                        top: '553px',
                        transform: 'scale(1.63)',
                        transformOrigin: 'top left',
                    }}
                />
                <PositionalGradeDisc
                    grade={5} // TODO
                    color={'#CD00FF'}
                    style={{
                        left: '1160px',
                        top: '553px',
                        transform: 'scale(1.63)',
                        transformOrigin: 'top left',
                    }}
                />
                <PositionalGradeDisc
                    grade={draftCapitalScore}
                    color={'#FF4200'}
                    style={{
                        left: '1286px',
                        top: '553px',
                        transform: 'scale(1.63)',
                        transformOrigin: 'top left',
                    }}
                />
                <div className={styles.startingLineup}>
                    {startingLineup.map((lineupPlayer, idx) => (
                        <PlayerRow
                            key={lineupPlayer.player.player_id}
                            position={lineupPlayer.position}
                            playerName={`${lineupPlayer.player.first_name} ${lineupPlayer.player.last_name}`}
                            playerTeam={lineupPlayer.player.team}
                            sleeperId={lineupPlayer.player.player_id}
                            marketDiscrepancy={idx - 4}
                        />
                    ))}
                </div>
                <div className={styles.benchString}>{benchString}</div>
                <img src={newInfiniteBg} className={styles.blankBp} />
            </div>
        </>
    );
}

type PlayerRowProps = {
    position: string;
    playerName: string;
    playerTeam: string;
    sleeperId: string;
    marketDiscrepancy: number;
};

function PlayerRow({
    position,
    playerName,
    playerTeam,
    sleeperId,
    marketDiscrepancy,
}: PlayerRowProps) {
    function getCircleStyling(pos: string): CSSProperties {
        switch (pos) {
            case QB:
                return {
                    backgroundColor: '#DB2335',
                };
            case RB:
                return {backgroundColor: '#00B1FF'};
            case WR:
                return {backgroundColor: '#00FF06'};
            case TE:
                return {backgroundColor: '#FFBC00'};
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return {
                    background:
                        'conic-gradient(from 270deg, #EABA10, #00B1FF, #1AE069, #EABA10)',
                };
            case SUPER_FLEX:
                return {
                    background:
                        'conic-gradient(from 270deg, #EABA10, #DB2335, #00B1FF, #1AE069, #EABA10)',
                };
        }
        return {
            backgroundColor: 'white',
        };
    }

    function getCardStyling(pos: string): CSSProperties {
        switch (pos) {
            case QB:
                return {
                    background: ' rgba(219, 35, 53, 0.25)',
                    outline: '2px solid rgba(219, 35, 53, 1)',
                };
            case RB:
                return {
                    background: ' rgba(0, 177, 255, 0.25)',
                    outline: '2px solid rgba(0, 177, 255, 1)',
                };
            case WR:
                return {
                    background: ' rgba(26, 224, 105, 0.25)',
                    outline: '2px solid #00FF06',
                };
            case TE:
                return {
                    background: ' rgba(250, 191, 74, 0.25)',
                    outline: '2px solid rgba(250, 191, 74, 1)',
                };
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return {
                    background:
                        'linear-gradient(90deg, rgba(0, 177, 255, 0.40) 0.02%, rgba(26, 224, 105, 0.40) 51.45%, rgba(234, 186, 16, 0.40) 99.81%)',
                    outline: '2px solid white',
                };
            case SUPER_FLEX:
                return {
                    background:
                        'linear-gradient(90deg, rgba(227, 24, 55, 0.40) 0.02%, rgba(0, 177, 255, 0.40) 37.52%, rgba(26, 224, 105, 0.40) 63.47%, rgba(234, 186, 16, 0.40) 99.81%)',
                    outline: '2px solid white',
                };
        }
        return {
            backgroundColor: 'white',
        };
    }

    function getDifferenceColor() {
        if (marketDiscrepancy > 0) {
            return 'rgba(26, 224, 105, 1)';
        } else if (marketDiscrepancy < 0) {
            return 'rgba(227, 24, 55, 1)';
        } else {
            return '#EABA10';
        }
    }

    function getDifferenceSymbol() {
        if (marketDiscrepancy > 0) {
            return '+';
        } else if (marketDiscrepancy < 0) {
            return '-';
        } else {
            return '=';
        }
    }

    function abbreviatePosition(pos: string) {
        switch (pos) {
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return 'FL';
            case SUPER_FLEX:
                return 'SF';
        }
        return pos;
    }
    return (
        <div className={styles.playerRow}>
            <div className={styles.playerCard} style={getCardStyling(position)}>
                <div
                    className={styles.position}
                    style={getCircleStyling(position)}
                >
                    {abbreviatePosition(position)}
                </div>
                {logoImage(playerTeam, styles.teamLogo)}
                <img
                    src={
                        sleeperId === NONE_PLAYER_ID
                            ? nflSilhouette
                            : `https://sleepercdn.com/content/nfl/players/${sleeperId}.jpg`
                    }
                    onError={({currentTarget}) => {
                        currentTarget.onerror = null;
                        currentTarget.src =
                            'https://sleepercdn.com/images/v2/icons/player_default.webp';
                    }}
                    className={styles.headshot}
                />
                <div className={styles.playerName}>{playerName}</div>
            </div>
            <div
                className={styles.differenceChip}
                style={{color: getDifferenceColor()}}
            >
                <img src={domainShield} className={styles.domainShield} />
                <div className={styles.marketDiscrepancy}>
                    {getDifferenceSymbol()}
                </div>
                {marketDiscrepancy !== 0 && (
                    <div className={styles.marketDiscrepancy}>
                        {Math.abs(marketDiscrepancy)}
                    </div>
                )}
            </div>
        </div>
    );
}
