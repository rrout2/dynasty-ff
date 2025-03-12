import {useSearchParams, useNavigate} from 'react-router-dom';
import {
    FormControl,
    Button,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
    CircularProgress,
} from '@mui/material';
import styles from './TeamPage.module.css';
import {CSSProperties, useEffect, useState} from 'react';
import {Roster, User} from '../../../sleeper-api/sleeper-api';
import {
    useFetchRosters,
    useFetchUser,
    useFetchUsers,
    useLeague,
    useLeagueIdFromUrl,
    useProjectedLineup,
    useRosterSettings,
} from '../../../hooks/hooks';
import {LEAGUE_ID, NONE_TEAM_ID, TEAM_ID} from '../../../consts/urlParams';
import PlayerPreview from '../../Player/PlayerPreview/PlayerPreview';
import Menu from '../../Menu/Menu';
import {
    FLEX,
    WR_RB_FLEX,
    WR_TE_FLEX,
    SUPER_FLEX,
} from '../../../consts/fantasy';

// dynasty-ff#/team?leagueId=...&teamId=...
export default function TeamPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const [teamId, setTeamId] = useState('');
    const [roster, setRoster] = useState<Roster>();
    const rosterSettings = useRosterSettings(league);

    const {startingLineup, bench} = useProjectedLineup(
        rosterSettings,
        roster?.players
    );

    useEffect(() => {
        const teamIdFromUrl = searchParams.get(TEAM_ID);
        if (teamIdFromUrl) setTeamId(teamIdFromUrl);
    }, [searchParams]);

    const {data: rosters} = useFetchRosters(leagueId);

    // start fetching all users from league
    const {data: allUsers} = useFetchUsers(rosters);

    // fetch specified user, unless already have allUsers
    const {data: fetchedUser} = useFetchUser(
        teamId,
        rosters,
        /* disabled = */ !!allUsers
    );
    const specifiedUser = allUsers ? allUsers[+teamId] : fetchedUser;

    useEffect(() => {
        if (!rosters || rosters.length === 0 || !hasTeamId()) return;
        setRoster(rosters[+teamId]);
    }, [rosters, teamId]);

    useEffect(() => {
        if (searchParams.get(TEAM_ID) === teamId) return;

        setSearchParams(searchParams => {
            searchParams.set(TEAM_ID, teamId);
            return searchParams;
        });
    }, [teamId]);

    function humanReadablePosition(position: string) {
        switch (position) {
            case FLEX:
                return 'WR/RB/TE';
            case WR_RB_FLEX:
                return 'WR/RB';
            case WR_TE_FLEX:
                return 'WR/TE';
            case SUPER_FLEX:
                return 'QB/WR/RB/TE';
        }
        return position;
    }

    function rosterComponent() {
        const projectedStarters = Array.from(startingLineup).map(
            ({player, position}) => (
                <div className={styles.starterRow}>
                    <div className={styles.starterPosition}>
                        {humanReadablePosition(position)}
                    </div>
                    <PlayerPreview player={player} leagueId={leagueId} />
                </div>
            )
        );
        const projectedBench = bench.map(p => (
            <div className={styles.starterRow}>
                <div className={styles.starterPosition}>BN</div>
                <PlayerPreview player={p} leagueId={leagueId} />
            </div>
        ));
        return (
            <>
                <div>{projectedStarters}</div>
                <div className={styles.bench}>{projectedBench}</div>
            </>
        );
    }

    function returnToLeaguePageButton() {
        return (
            <Button
                variant="outlined"
                onClick={() => {
                    navigate(`../league?${LEAGUE_ID}=${leagueId}`);
                }}
            >
                Return to League Page
            </Button>
        );
    }

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    return (
        <div className={styles.teamPage}>
            {
                <div className={styles.menuWrapper}>
                    <div className={styles.flexSpace} />
                    <div className={styles.teamPageContent}>
                        <div className={styles.teamPageRoster}>
                            {(specifiedUser || allUsers) && (
                                <TeamSelectComponent
                                    teamId={teamId}
                                    setTeamId={setTeamId}
                                    allUsers={allUsers}
                                    specifiedUser={specifiedUser}
                                />
                            )}
                            {hasTeamId() && specifiedUser && rosterComponent()}
                            {!specifiedUser && !allUsers && (
                                <CircularProgress />
                            )}
                        </div>
                    </div>
                    <div className={styles.flexSpace}>
                        <Menu />
                    </div>
                </div>
            }
            {returnToLeaguePageButton()}
        </div>
    );
}

function getDisplayName(user?: User) {
    return `${user?.metadata?.team_name || user?.display_name}`;
}

type TeamSelectComponentProps = {
    teamId: string;
    setTeamId: (value: React.SetStateAction<string>) => void;
    allUsers?: User[];
    specifiedUser?: User;
    style?: CSSProperties;
};

export function TeamSelectComponent({
    teamId,
    setTeamId,
    allUsers,
    specifiedUser,
    style,
}: TeamSelectComponentProps) {
    return (
        <FormControl style={style}>
            <InputLabel>Team</InputLabel>
            <Select
                value={teamId}
                label="Team"
                onChange={(event: SelectChangeEvent) => {
                    setTeamId(event.target.value);
                }}
            >
                <MenuItem value={NONE_TEAM_ID} key={'chooseateam'}>
                    Choose a team:
                </MenuItem>
                {!allUsers && specifiedUser && (
                    <MenuItem value={teamId} key={teamId}>
                        {getDisplayName(specifiedUser)}
                    </MenuItem>
                )}
                {allUsers?.map((u, idx) => (
                    <MenuItem value={idx} key={idx}>
                        {getDisplayName(u)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
