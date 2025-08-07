import styles from './Weekly.module.css';
import {blankWeekly} from '../../../../consts/images';
import {
    useFetchRosters,
    useLeague,
    useLeagueIdFromUrl,
    useNonSleeper,
    useProjectedLineup,
    useRoster,
    useRosterSettings,
    useTeamIdFromUrl,
    useUserIdFromUrl,
} from '../../../../hooks/hooks';
import {StartersGraphic} from '../../v1/modules/Starters/Starters';
import {GraphicComponent as PositionalGradesGraphic} from '../../v1/modules/PositionalGrades/PositionalGrades';
import {
    getAllUsers,
    getTeamName,
    Roster,
    User,
} from '../../../../sleeper-api/sleeper-api';
import ExportButton from '../../shared/ExportButton';
import {
    BuySellTile,
    BuySellTileProps,
    useBuySells,
} from '../../infinite/BuySellHold/BuySellHold';
import {QB, SUPER_FLEX} from '../../../../consts/fantasy';
import {TeamSelectComponent} from '../../../Team/TeamPage/TeamPage';
import {useEffect, useState} from 'react';
import {NONE_TEAM_ID} from '../../../../consts/urlParams';
import {
    BuySellHoldComponent,
    TeamNameComponent,
} from '../../infinite/Infinite/Infinite';

type InSeasonVerdict = 'ELITE' | 'SOLID' | 'SHAKY?';

export default function Infinite() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const [userId] = useUserIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const {data: rosters} = useFetchRosters(leagueId);
    const {roster, user, setRoster} = useRoster(rosters, teamId, leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [isNonSleeper, setIsNonSleeper] = useState(false);
    const [buys, setBuys] = useState<BuySellTileProps[]>([]);
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
        if (!allUsers.length || !userId) {
            return;
        }
        const userIndex = allUsers.findIndex(u => u.user_id === userId);
        setTeamId('' + userIndex);
        setSpecifiedUser(allUsers[userIndex]);
    }, [allUsers, userId]);

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

    const {startingLineup, setStartingLineup} = useProjectedLineup(
        isNonSleeper ? nonSleeperRosterSettings : rosterSettings,
        roster?.players
    );
    useEffect(() => {
        setStartingLineup(startingLineup.slice(0, 14));
    }, [startingLineup.length]);

    useEffect(() => {
        setIsNonSleeper(!leagueId);
    }, [leagueId]);

    const currentDate = new Date();
    const isSuperFlex = !isNonSleeper
        ? rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1
        : nonSleeperRosterSettings.has(SUPER_FLEX) ||
          (nonSleeperRosterSettings.get(QB) ?? 0) > 1;
    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
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
                />
                <div className={styles.monthYear}>
                    {currentDate.toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                    })}
                </div>
                <img src={blankWeekly} className={styles.blankBp} />
            </div>
        </>
    );
}

function getVerdictColor(tier: InSeasonVerdict): string {
    switch (tier) {
        case 'ELITE':
            return '#009444';
        case 'SOLID':
            return '#8dc63f';
        case 'SHAKY?':
            return '#f1bb1f';
        default:
            return '#000000';
    }
}
