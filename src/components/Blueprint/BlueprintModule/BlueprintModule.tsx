import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';
import styles from './BlueprintModule.module.css';
import DomainDropdown, {DARK_BLUE} from '../shared/DomainDropdown';
import {
    logoHorizontal,
    pprIcon,
    sfIcon,
    teamsIcon,
    tepIcon,
} from '../../../consts/images';
import {
    useAdpData,
    useFetchRosters,
    useGetPicks,
    useLeague,
    useLeagueIdFromUrl,
    usePlayerData,
    usePositionalGrades,
    useProjectedLineup,
    useRosterSettingsFromId,
    useTeamIdFromUrl,
    useTitle,
} from '../../../hooks/hooks';
import {QB, RB, SUPER_FLEX, TE, WR} from '../../../consts/fantasy';
import {
    getAllUsers,
    Player,
    Roster,
    User,
} from '../../../sleeper-api/sleeper-api';
import {NONE_TEAM_ID} from '../../../consts/urlParams';
import {getDisplayName} from '../../Team/TeamPage/TeamPage';
import DomainAutocomplete from '../shared/DomainAutocomplete';
import {getPicksInfo} from '../../../sleeper-api/picks';
import DomainTextField from '../shared/DomainTextField';
import {Box, Button, IconButton, Modal} from '@mui/material';
import {
    AddCircleOutline,
    FileDownload,
    Preview,
    Save,
} from '@mui/icons-material';
import NewV1 from '../NewV1/NewV1';

const PCT_OPTIONS = [
    '0%',
    '5%',
    '10%',
    '15%',
    '20%',
    '25%',
    '30%',
    '35%',
    '40%',
    '45%',
    '50%',
    '55%',
    '60%',
    '65%',
    '70%',
    '75%',
    '80%',
    '85%',
    '90%',
    '95%',
    '100%',
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

enum ValueArchetype {
    None = 'NONE',
    EliteValue = 'ELITE VALUE',
    StandardValue = 'STANDARD VALUE',
    FutureValue = 'FUTURE VALUE',
    AgingValue = 'AGING VALUE',
    OneYearReload = 'ONE YEAR RELOAD',
    HardRebuild = 'HARD REBUILD',
}

export enum RosterArchetype {
    None = 'NONE',
    WellRounded = 'WELL ROUNDED',
    WRFactory = 'WR FACTORY',
    RBHeavy = 'RB HEAVY',
    DualEliteQB = 'DUAL ELITE QB',
    EliteQBTE = 'ELITE QB/TE',
    PlayerDeficient = 'PLAYER DEFICIENT',
}

export enum OutlookOption {
    Rebuild = 'REBUILD',
    Reload = 'RELOAD',
    Contend = 'CONTEND',
}

enum PriorityOption {
    None = 'NONE',
    Sample = 'SAMPLE 1',
    Sample2 = 'SAMPLE 2',
}

type BlueprintModuleProps = {
    premium?: boolean;
};

type FullMove = {
    move: Move;
    playerIdsToTrade: string[];
    playerIdsToTarget: string[][];
};

export default function BlueprintModule({
    premium = false,
}: BlueprintModuleProps) {
    // Hooks
    useTitle('Blueprint Module');
    const [newLeagueModalOpen, setNewLeagueModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [newLeagueId, setNewLeagueId] = useState('');
    const [leagueId, setLeagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [tradePartners, setTradePartners] = useState<(User | undefined)[]>([
        undefined,
        undefined,
    ]);
    const [topPriorities, setTopPriorities] = useState<PriorityOption[]>([
        PriorityOption.None,
        PriorityOption.None,
        PriorityOption.None,
    ]);
    const [roster, setRoster] = useState<Roster>();
    const [rosterPlayers, setRosterPlayers] = useState<Player[]>([]);
    const playerData = usePlayerData();
    const {sortByAdp, getPositionalAdp} = useAdpData();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettingsFromId(leagueId);
    const rosterSettingsHasSuperFlex = rosterSettings.has(SUPER_FLEX);
    const [numTeams, setNumTeams] = useState(12);
    const [valueArchetype, setValueArchetype] = useState<ValueArchetype>(
        ValueArchetype.None
    );
    const [rosterArchetype, setRosterArchetype] = useState<RosterArchetype>(
        RosterArchetype.None
    );
    const [twoYearOutlook, setTwoYearOutlook] = useState<OutlookOption[]>([
        OutlookOption.Rebuild,
        OutlookOption.Reload,
    ]);
    const [fullMoves, setFullMoves] = useState<FullMove[]>([
        {
            move: Move.DOWNTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
        },
        {
            move: Move.PIVOT,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
        },
        {
            move: Move.UPTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
        },
        {
            move: Move.DOWNTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
        },
        {
            move: Move.PIVOT,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
        },
        {
            move: Move.UPTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
        },
    ]);
    const [draftCapitalNotes2026, setDraftCapitalNotes2026] = useState(
        'placeholder 2026 notes'
    );
    const [draftCapitalNotes2027, setDraftCapitalNotes2027] = useState(
        'placeholder 2027 notes'
    );
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
    } = usePositionalGrades(roster, numTeams);
    const [draftCapitalScore, setDraftCapitalScore] = useState(8);
    const [flexScore, setFlexScore] = useState(8);
    const [sfScore, setSfScore] = useState(8);
    const [isSuperFlex, setIsSuperFlex] = useState(true);
    const [ppr, setPpr] = useState(0.5);
    const [tep, setTep] = useState(0.5);
    const [productionShare, setProductionShare] = useState('15%');
    const [valueShare, setValueShare] = useState('25%');
    const [addPickRound, setAddPickRound] = useState(1);
    const [addPickSlot, setAddPickSlot] = useState(1);
    const {myPicks} = useGetPicks(leagueId, roster?.owner_id);
    const {startingLineup} = useProjectedLineup(
        rosterSettings,
        roster?.players
    );

    useEffect(() => {
        if (!league) return;
        setPpr(league.scoring_settings.rec);
        setTep(league.scoring_settings.bonus_rec_te);
        setNumTeams(league.total_rosters);
    }, [league]);
    useEffect(() => {
        setIsSuperFlex(rosterSettingsHasSuperFlex);
    }, [rosterSettingsHasSuperFlex]);
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
        if (!allUsers.length || !hasTeamId()) return;
        if (+teamId >= allUsers.length) {
            // if the teamId is out of bounds, reset it
            setTeamId('0');
        }
    }, [allUsers, teamId]);
    useEffect(() => {
        if (
            !rosters ||
            rosters.length === 0 ||
            !hasTeamId() ||
            !playerData ||
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
        if (!newRoster) {
            console.warn(`roster not found for teamId '${teamId}'`);
            return;
        }
        setRoster(newRoster);
    }, [rosters, teamId, playerData, allUsers]);
    useEffect(() => {
        if (!roster || !playerData) return;
        setRosterPlayers(
            roster?.players
                .map(playerId => playerData[playerId])
                .sort(sortByAdp)
        );
    }, [roster, playerData, sortByAdp]);

    useEffect(() => {
        if (!myPicks || myPicks.length === 0) return;
        const nextYearInfo = getPicksInfo(myPicks, '2026');
        setDraftCapitalNotes2026(nextYearInfo);
        const followingYearInfo = getPicksInfo(myPicks, '2027');
        setDraftCapitalNotes2027(followingYearInfo);
    }, [myPicks]);

    useEffect(() => {
        if (!newLeagueModalOpen) return;
        setTimeout(() => {
            textfieldRef.current?.focus();
        }, 0);
    }, [newLeagueModalOpen]);
    const textfieldRef = useRef<HTMLInputElement>(null);

    // -------------------------- End of hooks --------------------------

    function isStarting(playerName: string) {
        return startingLineup.find(
            ({player}) =>
                `${player.first_name} ${player.last_name}` === playerName
        )?.position;
    }

    function getClassName(playerName: string) {
        const starting = isStarting(playerName);
        switch (starting) {
            case 'QB':
                return styles.qbStarter;
            case 'RB':
                return styles.rbStarter;
            case 'WR':
                return styles.wrStarter;
            case 'TE':
                return styles.teStarter;
        }
        if (starting?.includes('FLEX')) {
            return styles.flexStarter;
        }
        return '';
    }

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    const bpActionButtonStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        border: '2px solid white',
        fontFamily: 'Acumin Pro',
        fontWeight: 'bold',
        fontSize: '20px',
    };
    const submitModal = () => {
        setRoster(undefined);
        setRosterPlayers([]);
        setTeamId('0');
        setSpecifiedUser(undefined);

        setLeagueId(newLeagueId.trim());

        setNewLeagueId('');
        setNewLeagueModalOpen(false);
    };

    return (
        <div style={{backgroundColor: DARK_BLUE}}>
            <div className={styles.headerContainer}>
                <Button
                    variant="outlined"
                    startIcon={<AddCircleOutline />}
                    style={{
                        paddingBottom: '7px',
                        height: '40px',
                    }}
                    sx={{
                        backgroundColor: '#28ABE2',
                        color: DARK_BLUE,
                        borderRadius: '100px',
                        '&:hover': {
                            backgroundColor: '#006FDB',
                            borderColor: '#006FDB',
                        },
                        fontFamily: 'Prohibition',
                        fontSize: '30px',
                    }}
                    onClick={() => {
                        setNewLeagueModalOpen(true);
                    }}
                >
                    NEW LEAGUE
                </Button>
                <Modal
                    open={newLeagueModalOpen}
                    onClose={() => {
                        setNewLeagueModalOpen(false);
                        setNewLeagueId('');
                    }}
                >
                    <Box className={styles.newLeagueModal}>
                        <DomainTextField
                            inputRef={textfieldRef}
                            label="New League ID"
                            value={newLeagueId}
                            onChange={e => setNewLeagueId(e.target.value)}
                            onKeyUp={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitModal();
                                }
                            }}
                        />
                        <Button
                            sx={{
                                fontFamily: 'Prohibition',
                                '&:disabled': {
                                    backgroundColor: 'gray',
                                },
                            }}
                            variant="contained"
                            onClick={() => {
                                submitModal();
                            }}
                            disabled={!newLeagueId.trim()}
                        >
                            Submit
                        </Button>
                    </Box>
                </Modal>
                <div className={styles.bpActions}>
                    <Button
                        variant="outlined"
                        endIcon={<FileDownload />}
                        sx={{
                            ...bpActionButtonStyle,
                            color: '#1AE069',
                        }}
                        onClick={() => console.log('TODO: download blueprint')}
                    >
                        DOWNLOAD BP
                    </Button>
                    <Button
                        variant="outlined"
                        endIcon={<Save />}
                        sx={{
                            ...bpActionButtonStyle,
                            color: '#FABF4A',
                        }}
                        onClick={() => console.log('TODO: save')}
                    >
                        SAVE
                    </Button>
                    <Button
                        variant="outlined"
                        endIcon={<Preview />}
                        sx={{
                            ...bpActionButtonStyle,
                            color: '#F47F20',
                        }}
                        onClick={() => {
                            setPreviewModalOpen(true);
                        }}
                    >
                        SHOW PREVIEW
                    </Button>
                    <Modal
                        open={previewModalOpen}
                        onClose={() => {
                            setPreviewModalOpen(false);
                        }}
                    >
                        <div className={styles.previewModal}>
                            {!premium && (
                                <NewV1
                                    teamName={getDisplayName(specifiedUser)}
                                    numTeams={numTeams}
                                    isSuperFlex={isSuperFlex}
                                    ppr={ppr}
                                    tep={tep}
                                    rosterArchetype={rosterArchetype}
                                    qbGrade={qb}
                                    rbGrade={rb}
                                    wrGrade={wr}
                                    teGrade={te}
                                    benchGrade={depth}
                                    draftCapitalScore={draftCapitalScore}
                                    twoYearOutlook={twoYearOutlook}
                                />
                            )}
                        </div>
                    </Modal>
                </div>
                <div className={styles.title}>BLUEPRINT MODULE</div>
                <img src={logoHorizontal} className={styles.logo} />
            </div>
            <div className={styles.topSection}>
                <div>
                    <div className={styles.dropdownContainer}>
                        <div className={styles.teamSelect}>
                            <div className={styles.teamSelectTitle}>TEAM</div>
                            <DomainDropdown
                                renderValue={value => (
                                    <span
                                        style={{
                                            fontStyle: 'italic',
                                            fontWeight: 'normal',
                                        }}
                                    >{`${value}`}</span>
                                )}
                                options={allUsers.map(u => getDisplayName(u))}
                                value={getDisplayName(specifiedUser)}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    allUsers.forEach((u, idx) => {
                                        if (getDisplayName(u) === value) {
                                            setSpecifiedUser(u);
                                            setTeamId(idx.toString());
                                        }
                                    });
                                }}
                                style={{width: '350px'}}
                            />
                        </div>
                        <DomainDropdown
                            label={
                                <div className={styles.labels}>
                                    <img
                                        src={teamsIcon}
                                        className={styles.icons}
                                    />
                                    TEAMS
                                </div>
                            }
                            options={[8, 10, 12, 14, 16, 18, 20]}
                            value={numTeams}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setNumTeams(value as number);
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div className={styles.labels}>
                                    <img
                                        src={sfIcon}
                                        className={styles.icons}
                                    />
                                    SF?
                                </div>
                            }
                            options={['YES', 'NO']}
                            value={isSuperFlex ? 'YES' : 'NO'}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setIsSuperFlex((value as string) === 'YES');
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div className={styles.labels}>
                                    <img
                                        src={pprIcon}
                                        className={styles.icons}
                                    />
                                    PPR
                                </div>
                            }
                            options={[0, 0.5, 1.0, 1.5, 2]}
                            value={ppr}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setPpr(value as number);
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div className={styles.labels}>
                                    <img
                                        src={tepIcon}
                                        className={styles.icons}
                                    />
                                    TEP
                                </div>
                            }
                            options={[0.5, 1.0, 1.5, 2]}
                            value={tep}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTep(value as number);
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div
                                    style={{width: '40px'}}
                                    className={styles.labels}
                                >
                                    PROD. SHARE
                                </div>
                            }
                            options={PCT_OPTIONS}
                            value={productionShare}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setProductionShare(value as string);
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div
                                    style={{width: '40px'}}
                                    className={styles.labels}
                                >
                                    VALUE SHARE
                                </div>
                            }
                            options={PCT_OPTIONS}
                            value={valueShare}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setValueShare(value as string);
                            }}
                        />
                    </div>
                    {roster && (
                        <div className={styles.rosterContainer}>
                            <div className={styles.positionContainer}>
                                <div
                                    className={`${styles.positionTitle} ${styles.qbTitle}`}
                                >
                                    QUARTERBACKS
                                </div>
                                <div className={styles.playersColumn}>
                                    {rosterPlayers
                                        .filter(p => p.position === QB)
                                        .map((p, idx) => {
                                            const fullName = `${p.first_name} ${p.last_name}`;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={styles.player}
                                                >
                                                    <div
                                                        className={getClassName(
                                                            fullName
                                                        )}
                                                    >
                                                        {fullName}
                                                    </div>
                                                    <div className={styles.adp}>
                                                        {getPositionalAdp(
                                                            fullName
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <DomainDropdown
                                options={GRADE_OPTIONS}
                                value={qb}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (value) {
                                        setQb(value as number);
                                    }
                                }}
                                outlineColor={'#E84D57'}
                            />
                            <div className={styles.positionContainer}>
                                <div
                                    className={`${styles.positionTitle} ${styles.rbTitle}`}
                                >
                                    Running Backs
                                </div>
                                <div className={styles.playersColumn}>
                                    {rosterPlayers
                                        .filter(p => p.position === RB)
                                        .map((p, idx) => {
                                            const fullName = `${p.first_name} ${p.last_name}`;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={styles.player}
                                                >
                                                    <div
                                                        className={getClassName(
                                                            fullName
                                                        )}
                                                    >
                                                        {fullName}
                                                    </div>
                                                    <div className={styles.adp}>
                                                        {getPositionalAdp(
                                                            fullName
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <DomainDropdown
                                options={GRADE_OPTIONS}
                                value={rb}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (value) {
                                        setRb(value as number);
                                    }
                                }}
                                outlineColor={'rgba(40, 171, 226, 1)'}
                            />
                            <div className={styles.positionContainer}>
                                <div
                                    className={`${styles.positionTitle} ${styles.wrTitle}`}
                                >
                                    Wide Receivers
                                </div>
                                <div className={styles.playersColumn}>
                                    {rosterPlayers
                                        .filter(p => p.position === WR)
                                        .map((p, idx) => {
                                            const fullName = `${p.first_name} ${p.last_name}`;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={styles.player}
                                                >
                                                    <div
                                                        className={getClassName(
                                                            fullName
                                                        )}
                                                    >
                                                        {fullName}
                                                    </div>
                                                    <div className={styles.adp}>
                                                        {getPositionalAdp(
                                                            fullName
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <DomainDropdown
                                options={GRADE_OPTIONS}
                                value={wr}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (value) {
                                        setWr(value as number);
                                    }
                                }}
                                outlineColor={'rgb(26, 224, 105)'}
                            />
                            <div className={styles.positionContainer}>
                                <div
                                    className={`${styles.positionTitle} ${styles.teTitle}`}
                                >
                                    Tight Ends
                                </div>
                                <div className={styles.playersColumn}>
                                    {rosterPlayers
                                        .filter(p => p.position === TE)
                                        .map((p, idx) => {
                                            const fullName = `${p.first_name} ${p.last_name}`;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={styles.player}
                                                >
                                                    <div
                                                        className={getClassName(
                                                            fullName
                                                        )}
                                                    >
                                                        {fullName}
                                                    </div>
                                                    <div className={styles.adp}>
                                                        {getPositionalAdp(
                                                            fullName
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <DomainDropdown
                                options={GRADE_OPTIONS}
                                value={te}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (value) {
                                        setTe(value as number);
                                    }
                                }}
                                outlineColor={'rgb(250, 191, 74)'}
                            />
                            <div className={styles.positionContainer}>
                                <div
                                    className={`${styles.positionTitle} ${styles.picksTitle}`}
                                >
                                    Picks
                                </div>
                                {myPicks && (
                                    <div className={styles.playersColumn}>
                                        {myPicks.map((p, idx) => {
                                            return (
                                                <div
                                                    key={idx}
                                                    className={styles.player}
                                                >
                                                    {p.pick_name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className={styles.scoreContainer}>
                                <DomainDropdown
                                    label={
                                        <div
                                            className={styles.labels}
                                            style={{color: 'rgb(252, 71, 26)'}}
                                        >
                                            DC
                                        </div>
                                    }
                                    options={GRADE_OPTIONS}
                                    value={draftCapitalScore}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value) {
                                            setDraftCapitalScore(
                                                value as number
                                            );
                                        }
                                    }}
                                    outlineColor={'rgb(252, 71, 26)'}
                                />
                                <DomainDropdown
                                    label={
                                        <div
                                            className={styles.labels}
                                            style={{
                                                color: 'rgb(180, 217, 228)',
                                            }}
                                        >
                                            FLEX
                                        </div>
                                    }
                                    options={GRADE_OPTIONS}
                                    value={flexScore}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value) {
                                            setFlexScore(value as number);
                                        }
                                    }}
                                    outlineColor={'rgb(180, 217, 228)'}
                                />
                                <DomainDropdown
                                    label={
                                        <div
                                            className={styles.labels}
                                            style={{
                                                color: 'rgb(180, 217, 228)',
                                            }}
                                        >
                                            SF
                                        </div>
                                    }
                                    options={GRADE_OPTIONS}
                                    value={sfScore}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value) {
                                            setSfScore(value as number);
                                        }
                                    }}
                                    outlineColor={'rgb(180, 217, 228)'}
                                />
                                <DomainDropdown
                                    label={
                                        <div
                                            className={styles.labels}
                                            style={{color: '#CD1CFD'}}
                                        >
                                            BN
                                        </div>
                                    }
                                    options={GRADE_OPTIONS}
                                    value={depth}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value) {
                                            setDepth(value as number);
                                        }
                                    }}
                                    outlineColor={'#CD1CFD'}
                                />
                                <DomainDropdown
                                    label={
                                        <div
                                            className={styles.labels}
                                            style={{color: '#B4D9E4'}}
                                        >
                                            OVERALL
                                        </div>
                                    }
                                    options={GRADE_OPTIONS}
                                    value={overall}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value) {
                                            setOverall(value as number);
                                        }
                                    }}
                                    outlineColor={'#B4D9E4'}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.topRightSection}>
                    <div className={styles.archetypeContainer}>
                        <div className={styles.archetypeTitle}>
                            Value Archetype
                        </div>
                        <DomainDropdown
                            style={{width: '250px'}}
                            options={Object.values(ValueArchetype)}
                            value={valueArchetype}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setValueArchetype(value as ValueArchetype);
                                }
                            }}
                        />
                        <div className={styles.archetypeTitle}>
                            Roster Archetype
                        </div>
                        <DomainDropdown
                            style={{width: '250px'}}
                            options={Object.values(RosterArchetype)}
                            value={rosterArchetype}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setRosterArchetype(
                                        value as RosterArchetype
                                    );
                                }
                            }}
                        />
                    </div>
                    <div className={styles.twoYearOutlookContainer}>
                        <div className={styles.archetypeTitle}>
                            2-Year Outlook
                        </div>
                        <DomainDropdown
                            label={<div className={styles.labels}>1.</div>}
                            style={{width: '250px'}}
                            options={Object.values(OutlookOption)}
                            value={twoYearOutlook[0]}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setTwoYearOutlook([
                                        value as OutlookOption,
                                        twoYearOutlook[1],
                                    ]);
                                }
                            }}
                        />
                        <DomainDropdown
                            label={<div className={styles.labels}>2.</div>}
                            style={{width: '250px'}}
                            options={Object.values(OutlookOption)}
                            value={twoYearOutlook[1]}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setTwoYearOutlook([
                                        twoYearOutlook[0],
                                        value as OutlookOption,
                                    ]);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={styles.bottomSection}>
                <div className={styles.tradeContainer}>
                    <div className={styles.tradeTitle}>Trade Strategy</div>
                    <div className={styles.suggestedMovesContainer}>
                        {[0, 1, 2].map(i => (
                            <SuggestedMove
                                key={i}
                                move={fullMoves[i].move}
                                setMove={(move: Move) => {
                                    const newMoves = [...fullMoves];
                                    newMoves[i].move = move;
                                    setFullMoves(newMoves);
                                }}
                                playerIdsToTrade={fullMoves[i].playerIdsToTrade}
                                setPlayerIdsToTrade={(playerIds: string[]) => {
                                    const newMoves = [...fullMoves];
                                    newMoves[i].playerIdsToTrade = playerIds;
                                    setFullMoves(newMoves);
                                }}
                                playerIdsToTarget={
                                    fullMoves[i].playerIdsToTarget
                                }
                                setPlayerIdsToTarget={(
                                    playerIds: string[][]
                                ) => {
                                    const newMoves = [...fullMoves];
                                    newMoves[i].playerIdsToTarget = playerIds;
                                    setFullMoves(newMoves);
                                }}
                                rosterPlayers={rosterPlayers}
                                moveNumber={i + 1}
                            />
                        ))}
                    </div>
                    {premium && (
                        <div className={styles.suggestedMovesContainer}>
                            {[3, 4, 5].map(i => (
                                <SuggestedMove
                                    key={i}
                                    move={fullMoves[i].move}
                                    setMove={(move: Move) => {
                                        const newMoves = [...fullMoves];
                                        newMoves[i].move = move;
                                        setFullMoves(newMoves);
                                    }}
                                    playerIdsToTrade={
                                        fullMoves[i].playerIdsToTrade
                                    }
                                    setPlayerIdsToTrade={(
                                        playerIds: string[]
                                    ) => {
                                        const newMoves = [...fullMoves];
                                        newMoves[i].playerIdsToTrade =
                                            playerIds;
                                        setFullMoves(newMoves);
                                    }}
                                    playerIdsToTarget={
                                        fullMoves[i].playerIdsToTarget
                                    }
                                    setPlayerIdsToTarget={(
                                        playerIds: string[][]
                                    ) => {
                                        const newMoves = [...fullMoves];
                                        newMoves[i].playerIdsToTarget =
                                            playerIds;
                                        setFullMoves(newMoves);
                                    }}
                                    rosterPlayers={rosterPlayers}
                                    moveNumber={i + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.bottomRightSection}>
                    <div className={styles.draftCapitalContainer}>
                        <div className={styles.draftCapitalHeaderRow}>
                            <div className={styles.draftCapitalTitle}>
                                Draft Capital
                            </div>
                            <div className={styles.addDraftPickContainer}>
                                <DomainDropdown
                                    options={[0, 1, 2, 3, 4]}
                                    value={addPickRound}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value || value === 0) {
                                            setAddPickRound(value as number);
                                        }
                                    }}
                                    renderValue={value => (
                                        <span
                                            style={{fontStyle: 'italic'}}
                                        >{`Round ${value}`}</span>
                                    )}
                                />
                                <DomainDropdown
                                    options={[
                                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
                                        12, 13, 14,
                                    ]}
                                    value={addPickSlot}
                                    onChange={e => {
                                        const {
                                            target: {value},
                                        } = e;
                                        if (value || value === 0) {
                                            setAddPickSlot(value as number);
                                        }
                                    }}
                                    renderValue={value => (
                                        <span
                                            style={{fontStyle: 'italic'}}
                                        >{`Pick ${value}`}</span>
                                    )}
                                />
                                <IconButton
                                    sx={{
                                        '&:hover': {
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.2)',
                                        },
                                    }}
                                    TouchRippleProps={{
                                        style: {
                                            color: 'white',
                                        },
                                    }}
                                    onClick={() => {
                                        // TODO: figure out year
                                        const pickString = `${addPickRound}.${
                                            addPickSlot < 10 ? '0' : ''
                                        }${addPickSlot}`;
                                        if (draftCapitalNotes2026) {
                                            setDraftCapitalNotes2026(
                                                `${draftCapitalNotes2026}, ${pickString}`
                                            );
                                        } else {
                                            setDraftCapitalNotes2026(
                                                pickString
                                            );
                                        }
                                    }}
                                >
                                    <AddCircleOutline sx={{color: 'white'}} />
                                </IconButton>
                            </div>
                        </div>
                        <div className={styles.draftCapitalBody}>
                            <DomainTextField
                                flexGrow={1}
                                label={'2026'}
                                value={draftCapitalNotes2026}
                                onChange={e =>
                                    setDraftCapitalNotes2026(e.target.value)
                                }
                            />
                            <DomainTextField
                                flexGrow={1}
                                label={'2027'}
                                value={draftCapitalNotes2027}
                                onChange={e =>
                                    setDraftCapitalNotes2027(e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className={styles.idealTradePartnersContainer}>
                        <div className={styles.idealTradePartnersTitle}>
                            Ideal Trade Partners
                        </div>
                        <div className={styles.idealTradePartnersBody}>
                            <DomainDropdown
                                vertical={true}
                                label={
                                    <span
                                        style={{
                                            fontFamily: 'Prohibition',
                                            fontWeight: 'normal',
                                        }}
                                    >
                                        Trade Partner 1
                                    </span>
                                }
                                style={{width: '270px'}}
                                renderValue={value => (
                                    <span
                                        style={{
                                            fontStyle: 'italic',
                                            fontWeight: 'normal',
                                        }}
                                    >{`${value}`}</span>
                                )}
                                options={[
                                    'Choose a team',
                                    ...allUsers.map(u => getDisplayName(u)),
                                ]}
                                value={
                                    tradePartners[0]
                                        ? getDisplayName(tradePartners[0])
                                        : 'Choose a team'
                                }
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (value === 'Choose a team') {
                                        setTradePartners([
                                            undefined,
                                            tradePartners[1],
                                        ]);
                                        return;
                                    }
                                    allUsers.forEach(u => {
                                        if (getDisplayName(u) === value) {
                                            setTradePartners([
                                                u,
                                                tradePartners[1],
                                            ]);
                                        }
                                    });
                                }}
                            />
                            <DomainDropdown
                                vertical={true}
                                label={
                                    <span
                                        style={{
                                            fontFamily: 'Prohibition',
                                            fontWeight: 'normal',
                                        }}
                                    >
                                        Trade Partner 2
                                    </span>
                                }
                                style={{width: '270px'}}
                                renderValue={value => (
                                    <span
                                        style={{
                                            fontStyle: 'italic',
                                            fontWeight: 'normal',
                                        }}
                                    >{`${value}`}</span>
                                )}
                                options={[
                                    'Choose a team',
                                    ...allUsers.map(u => getDisplayName(u)),
                                ]}
                                value={
                                    tradePartners[1]
                                        ? getDisplayName(tradePartners[1])
                                        : 'Choose a team'
                                }
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (value === 'Choose a team') {
                                        setTradePartners([
                                            tradePartners[0],
                                            undefined,
                                        ]);
                                        return;
                                    }
                                    allUsers.forEach(u => {
                                        if (getDisplayName(u) === value) {
                                            setTradePartners([
                                                tradePartners[0],
                                                u,
                                            ]);
                                        }
                                    });
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.topPrioritiesContainer}>
                        <div className={styles.topPrioritiesTitle}>
                            Top Priorities
                        </div>
                        <DomainDropdown
                            style={{width: '600px'}}
                            renderValue={value => (
                                <span
                                    style={{
                                        fontStyle: 'italic',
                                        fontWeight: 'normal',
                                    }}
                                >{`${value}`}</span>
                            )}
                            value={topPriorities[0]}
                            options={Object.values(PriorityOption)}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTopPriorities([
                                    value as PriorityOption,
                                    topPriorities[1],
                                    topPriorities[2],
                                ]);
                            }}
                        />
                        <DomainDropdown
                            style={{width: '600px'}}
                            renderValue={value => (
                                <span
                                    style={{
                                        fontStyle: 'italic',
                                        fontWeight: 'normal',
                                    }}
                                >{`${value}`}</span>
                            )}
                            value={topPriorities[1]}
                            options={Object.values(PriorityOption)}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTopPriorities([
                                    topPriorities[0],
                                    value as PriorityOption,
                                    topPriorities[2],
                                ]);
                            }}
                        />
                        <DomainDropdown
                            style={{width: '600px'}}
                            renderValue={value => (
                                <span
                                    style={{
                                        fontStyle: 'italic',
                                        fontWeight: 'normal',
                                    }}
                                >{`${value}`}</span>
                            )}
                            value={topPriorities[2]}
                            options={Object.values(PriorityOption)}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTopPriorities([
                                    topPriorities[0],
                                    topPriorities[1],
                                    value as PriorityOption,
                                ]);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

enum Move {
    DOWNTIER = 'DOWNTIER',
    UPTIER = 'UPTIER',
    PIVOT = 'PIVOT',
}

type SuggestedMoveProps = {
    move: Move;
    setMove: (move: Move) => void;
    playerIdsToTrade: string[];
    setPlayerIdsToTrade: (playerIds: string[]) => void;
    playerIdsToTarget: string[][];
    setPlayerIdsToTarget: (playerIds: string[][]) => void;
    rosterPlayers: Player[];
    moveNumber: number;
};

function SuggestedMove({
    move,
    setMove,
    rosterPlayers,
    playerIdsToTrade,
    setPlayerIdsToTrade,
    playerIdsToTarget,
    setPlayerIdsToTarget,
    moveNumber,
}: SuggestedMoveProps) {
    const playerData = usePlayerData();
    const [optionsToTrade, setOptionsToTrade] = useState<string[]>([]);
    useEffect(() => {
        const nonIdPlayerOptions: string[] = [];
        for (let i = 1; i < 15; i++) {
            nonIdPlayerOptions.push(
                `Rookie Pick 1.${i < 10 ? `0${i}` : `${i}`}`
            );
        }
        nonIdPlayerOptions.push('2026 1st');
        nonIdPlayerOptions.push('2027 1st');
        setOptionsToTrade([
            ...rosterPlayers.map(p => `${p.first_name} ${p.last_name}`),
            ...nonIdPlayerOptions,
        ]);
    }, [rosterPlayers]);
    useEffect(() => {
        if (!playerData || !rosterPlayers[0]) return;
        setPlayerIdsToTrade([
            rosterPlayers[0].player_id,
            rosterPlayers[1].player_id,
        ]);
    }, [rosterPlayers, playerData]);

    function getDisplayValueFromId(id: string) {
        if (!playerData) return id;
        return !Number.isNaN(+id)
            ? `${playerData[id].first_name} ${playerData[id].last_name}`
            : id;
    }

    return (
        playerIdsToTrade[0] &&
        playerData && (
            <div className={styles.toTradeContainer}>
                <div className={styles.moveTitle}>MOVE #{moveNumber}</div>
                <DomainDropdown
                    renderValue={value => (
                        <span
                            style={{fontStyle: 'italic', fontWeight: 'normal'}}
                        >{`${value}`}</span>
                    )}
                    options={[Move.DOWNTIER, Move.PIVOT, Move.UPTIER]}
                    value={move}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setMove(value as Move);
                        }
                    }}
                />
                <div className={styles.toTradeRow}>
                    <DomainDropdown
                        renderValue={value => (
                            <span
                                style={{
                                    fontStyle: 'italic',
                                    fontWeight: 'normal',
                                    textTransform: 'uppercase',
                                }}
                            >{`${value}`}</span>
                        )}
                        options={optionsToTrade}
                        value={getDisplayValueFromId(playerIdsToTrade[0])}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            if (value) {
                                for (const p of rosterPlayers) {
                                    if (
                                        `${p.first_name} ${p.last_name}` ===
                                        value
                                    ) {
                                        setPlayerIdsToTrade([
                                            p.player_id,
                                            playerIdsToTrade[1],
                                        ]);
                                        return;
                                    }
                                }
                                setPlayerIdsToTrade([
                                    value as string,
                                    playerIdsToTrade[1],
                                ]);
                            }
                        }}
                    />
                    {move === Move.UPTIER && (
                        <>
                            <img
                                src={sfIcon}
                                className={styles.icons}
                                style={{margin: '0', padding: '0'}}
                            />
                            <DomainDropdown
                                renderValue={value => (
                                    <span
                                        style={{
                                            fontStyle: 'italic',
                                            fontWeight: 'normal',
                                            textTransform: 'uppercase',
                                        }}
                                    >{`${value}`}</span>
                                )}
                                options={optionsToTrade}
                                value={getDisplayValueFromId(
                                    playerIdsToTrade[1]
                                )}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (!value) return;
                                    for (const p of rosterPlayers) {
                                        if (
                                            `${p.first_name} ${p.last_name}` ===
                                            value
                                        ) {
                                            setPlayerIdsToTrade([
                                                playerIdsToTrade[0],
                                                p.player_id,
                                            ]);
                                            return;
                                        }
                                    }
                                    setPlayerIdsToTrade([
                                        playerIdsToTrade[0],
                                        value as string,
                                    ]);
                                }}
                            />
                        </>
                    )}
                </div>
                <div className={styles.toTargetContainer}>
                    {move !== Move.DOWNTIER && (
                        <>
                            <DomainAutocomplete
                                selectedPlayer={playerIdsToTarget[0][0]}
                                setSelectedPlayer={(player: string) => {
                                    setPlayerIdsToTarget([
                                        [player, playerIdsToTarget[0][1]],
                                        playerIdsToTarget[1],
                                        playerIdsToTarget[2],
                                    ]);
                                }}
                            />
                            <DomainAutocomplete
                                selectedPlayer={playerIdsToTarget[1][0]}
                                setSelectedPlayer={(player: string) => {
                                    setPlayerIdsToTarget([
                                        playerIdsToTarget[0],
                                        [player, playerIdsToTarget[1][1]],
                                        playerIdsToTarget[2],
                                    ]);
                                }}
                            />
                            <DomainAutocomplete
                                selectedPlayer={playerIdsToTarget[2][0]}
                                setSelectedPlayer={(player: string) => {
                                    setPlayerIdsToTarget([
                                        playerIdsToTarget[0],
                                        playerIdsToTarget[1],
                                        [player, playerIdsToTarget[2][1]],
                                    ]);
                                }}
                            />
                        </>
                    )}
                    {move == Move.DOWNTIER && (
                        <>
                            <div className={styles.downtierRow}>
                                <DomainAutocomplete
                                    selectedPlayer={playerIdsToTarget[0][0]}
                                    setSelectedPlayer={(player: string) => {
                                        setPlayerIdsToTarget([
                                            [player, playerIdsToTarget[0][1]],
                                            playerIdsToTarget[1],
                                            playerIdsToTarget[2],
                                        ]);
                                    }}
                                />
                                <img
                                    src={sfIcon}
                                    className={styles.icons}
                                    style={{margin: '0', padding: '0'}}
                                />
                                <DomainAutocomplete
                                    selectedPlayer={playerIdsToTarget[0][1]}
                                    setSelectedPlayer={(player: string) => {
                                        setPlayerIdsToTarget([
                                            [playerIdsToTarget[0][0], player],
                                            playerIdsToTarget[1],
                                            playerIdsToTarget[2],
                                        ]);
                                    }}
                                />
                            </div>
                            <div className={styles.downtierRow}>
                                <DomainAutocomplete
                                    selectedPlayer={playerIdsToTarget[1][0]}
                                    setSelectedPlayer={(player: string) => {
                                        setPlayerIdsToTarget([
                                            playerIdsToTarget[0],
                                            [player, playerIdsToTarget[1][1]],
                                            playerIdsToTarget[2],
                                        ]);
                                    }}
                                />
                                <img
                                    src={sfIcon}
                                    className={styles.icons}
                                    style={{margin: '0', padding: '0'}}
                                />
                                <DomainAutocomplete
                                    selectedPlayer={playerIdsToTarget[1][1]}
                                    setSelectedPlayer={(player: string) => {
                                        setPlayerIdsToTarget([
                                            playerIdsToTarget[0],
                                            [playerIdsToTarget[1][0], player],
                                            playerIdsToTarget[2],
                                        ]);
                                    }}
                                />
                            </div>
                            <div className={styles.downtierRow}>
                                <DomainAutocomplete
                                    selectedPlayer={playerIdsToTarget[2][0]}
                                    setSelectedPlayer={(player: string) => {
                                        setPlayerIdsToTarget([
                                            playerIdsToTarget[0],
                                            playerIdsToTarget[1],
                                            [player, playerIdsToTarget[2][1]],
                                        ]);
                                    }}
                                />
                                <img
                                    src={sfIcon}
                                    className={styles.icons}
                                    style={{margin: '0', padding: '0'}}
                                />
                                <DomainAutocomplete
                                    selectedPlayer={playerIdsToTarget[2][1]}
                                    setSelectedPlayer={(player: string) => {
                                        setPlayerIdsToTarget([
                                            playerIdsToTarget[0],
                                            playerIdsToTarget[1],
                                            [playerIdsToTarget[2][0], player],
                                        ]);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    );
}
