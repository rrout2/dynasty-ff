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
    useDomainTrueRanks,
    useFetchRosters,
    useGetPicks,
    useLeague,
    useLeagueIdFromUrl,
    useLeaguePowerRanks,
    usePlayerData,
    usePositionalGrades,
    usePositionalValueGrades,
    useProjectedLineup,
    useRosterSettingsFromId,
    useTeamIdFromUrl,
    useTeamProductionShare,
    useTeamRosterArchetype,
    useTeamValueArchetype,
    useTeamValueShare,
    useThreeFactorGrades,
    useTitle,
    useTwoYearOutlook,
} from '../../../hooks/hooks';
import {QB, RB, SUPER_FLEX, TE, WR} from '../../../consts/fantasy';
import {
    getAllUsers,
    Player,
    Roster,
    User,
} from '../../../sleeper-api/sleeper-api';
import {
    MOVE,
    NONE_TEAM_ID,
    ROSTER_ARCHETYPE,
    TO_TARGET,
    TO_TRADE,
    TOP_PRIORITIES,
    TRADE_PARTNERS,
    TWO_YEAR_OUTLOOK,
    VALUE_ARCHETYPE,
} from '../../../consts/urlParams';
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
import {toPng} from 'html-to-image';
import Premium from '../Premium/Premium';
import {useSearchParams} from 'react-router-dom';

export const PCT_OPTIONS = [
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

const GRADE_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const PRIORITY_OPTIONS = [
    "Don't hold a top TE on a rebuild",
    'Make as many trades as possible to build value wins',
    'You should be getting an absolute haul for your top QBs when trading',
    'Target Assets that have yet to reach their value ceiling',
    "Upside is everything in this format, so don't downtier too much or too far",
    'Downtier from one or both of your QBs to spread out your value',
    "Don't hold more than two top 20 QBs on your roster",
    'Take advantage of market disconnects',
    'Get productive vets at a discount before they gain value closer to the season',
    'Shift any volatile RB value into more stable, long-term assets',
    'Your starting lineup does not matter in the offseason; increase your value portfolio',
    'Target injured cornerstones & perceived under-performers at a discount',
    'Move off assets that have reached their value ceiling',
    'Upside QBs are particularly risky, try to solidify the position by consolidating',
    "Don't go out of your way to target any rookie picks further than two years out",
    'Be active - multiple small market wins is easier than one masive trade',
    'Primarily build through the insulated positions (WR & RB)',
    'Rebuilding is about gaining value, less about immediate positional needs',
    'Worry less about age & more about 9 month market plays & value insulation',
    'It is safer to hold an elite QB/WR than an elite TE',
    'Take advantage of your value at QB and reinvest in skill positions',
    "Don't hold all your RB value at the expense of WR insulation",
    "Work on insulating QB, but don't pay up for a premier option",
    'Insulate value/production for next year',
    'The more you play the market, the quicker the reload will be',
    "Don't uptier too far from top assets, no further than one or two tiers",
    'Make as many trades as possible to build small value wins',
    'Shop your productive vets at a premium when they produce midseason',
    'Use rookie picks to gain value wins, not to plug holes',
    'Try targeting rookie picks at a discount from "contenders" in your league',
    'Use your positional dominance to answer any upside questions at other positions',
    'Use strategic uptiering to raise your production ceiling',
    'Maximize flex spot upside as much as possible',
    "Don't be afraid to add some productive vets to this team",
    'Uptier where you can to raise starting lineup upside',
    'Shift mindset from upside shots to production',
    'Try decreasing your value volatility to avoid an eventual hard rebuild',
    'Utilize depth to extend contention window',
    'If you have a poor start to the season, you can always reload midseason',
    'Rebuilds & reloads are your most likely trade partners when looking to uptier',
    "Don't make unecessary moves that fail to improve your upside opportunity",
    "Production matters closer to the season; don't neglect value wins now",
    'Avoid volatile situational outlooks heading into the NFL draft',
    "Don't superload one position at the expense of others",
];

const ELITE_PRIORITY_OPTIONS = [
    'Get the best players at every position & win your league',
    "Don't make any trades that don't improve production upside opportunity",
    "Don't be afraid to pay the price for highly productive vets",
    'You have the value to comfortably take on some volatile assets',
    'You have all the value leverage in this league, take advantage when trading',
];

export enum ValueArchetype {
    None = 'NONE',
    EliteValue = 'ELITE VALUE',
    EnhancedValue = 'ENHANCED VALUE',
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

export enum DraftStrategyLabel {
    None = 'None',
    Deficient = 'Deficient',
    Adequate = 'Adequate',
    Surplus = 'Surplus',
    Overload = 'Overload',
}

type BlueprintModuleProps = {
    premium?: boolean;
};

export type FullMove = {
    move: Move;
    playerIdsToTrade: string[];
    playerIdsToTarget: string[][];
};

export default function BlueprintModule({
    premium = false,
}: BlueprintModuleProps) {
    // Hooks
    useTitle(premium ? 'Premium Blueprint Module' : 'Blueprint Module');
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
    const [topPriorities, setTopPriorities] = useState<string[]>(['', '', '']);
    const [roster, setRoster] = useState<Roster>();
    const [rosterPlayers, setRosterPlayers] = useState<Player[]>([]);
    const playerData = usePlayerData();
    const {sortByAdp, getPositionalAdp} = useAdpData();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettingsFromId(leagueId);
    const rosterSettingsHasSuperFlex = rosterSettings.has(SUPER_FLEX);
    const [numTeams, setNumTeams] = useState(12);
    const {valueArchetype, setValueArchetype} = useTeamValueArchetype(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const {rosterArchetype, setRosterArchetype} = useTeamRosterArchetype(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const {twoYearOutlook, setTwoYearOutlook} = useTwoYearOutlook(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
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
    const [draftCapitalNotes, setDraftCapitalNotes] = useState(
        new Map<number, string>()
    );
    useEffect(() => {
        setDraftCapitalNotes(
            new Map([
                [2026, draftCapitalNotes2026],
                [2027, draftCapitalNotes2027],
            ])
        );
    }, [draftCapitalNotes2026, draftCapitalNotes2027]);
    const {overall, setOverall, depth, setDepth} = usePositionalGrades(
        roster,
        numTeams,
        /* roundOverall= */ false
    );
    const {qb, setQb, rb, setRb, wr, setWr, te, setTe} =
        usePositionalValueGrades(
            leagueId,
            '' + getRosterIdFromUser(specifiedUser)
        );
    const [draftCapitalScore, setDraftCapitalScore] = useState(8);
    const [isSuperFlex, setIsSuperFlex] = useState(true);
    const [ppr, setPpr] = useState(0.5);
    const [tep, setTep] = useState(0.5);
    const [addPickRound, setAddPickRound] = useState(1);
    const [addPickSlot, setAddPickSlot] = useState(1);
    const {myPicks} = useGetPicks(leagueId, roster?.owner_id);
    const {startingLineup} = useProjectedLineup(
        rosterSettings,
        roster?.players
    );
    const [draftStrategy, setDraftStrategy] = useState<DraftStrategyLabel[]>([
        DraftStrategyLabel.None,
        DraftStrategyLabel.None,
    ]);
    const {
        valueSharePercent,
        leagueRank: valueShareRank,
        setValueSharePercent,
        setLeagueRank: setValueShareRank,
    } = useTeamValueShare(leagueId, '' + getRosterIdFromUser(specifiedUser));
    const {
        productionSharePercent,
        leagueRank: productionShareRank,
        setProductionSharePercent,
        setLeagueRank: setProductionShareRank,
    } = useTeamProductionShare(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const {domainTrueRanks} = useDomainTrueRanks(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const threeFactorGrades = useThreeFactorGrades(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const {leaguePowerRanks} = useLeaguePowerRanks(leagueId);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isDownloading, setIsDownloading] = useState(false);

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

    useEffect(() => {
        if (!playerData || !allUsers || !searchParams.get(ROSTER_ARCHETYPE))
            return;
        // not sure why this is necessary
        setTimeout(loadFromUrl, 200);
    }, [playerData, allUsers, searchParams]);

    // -------------------------- End of hooks --------------------------

    function getRosterIdFromUser(user?: User) {
        if (!rosters || !user) return -1;
        return rosters.findIndex(r => r.owner_id === user.user_id) ?? -1;
    }

    function getStartingPosition(playerName: string) {
        return startingLineup.find(
            ({player}) =>
                `${player.first_name} ${player.last_name}` === playerName
        )?.position;
    }

    function getClassName(playerName: string) {
        const starting = getStartingPosition(playerName);
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
    const submitNewLeague = () => {
        clearUrlSave();

        setRoster(undefined);
        setRosterPlayers([]);
        setTeamId('0');
        setSpecifiedUser(undefined);

        setLeagueId(newLeagueId.trim());

        setNewLeagueId('');
        setNewLeagueModalOpen(false);
        setTradePartners([undefined, undefined]);
        setTopPriorities(['', '', '']);
        setValueArchetype(ValueArchetype.None);
        setRosterArchetype(RosterArchetype.None);
        setFullMoves([
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
        setDraftStrategy([DraftStrategyLabel.None, DraftStrategyLabel.None]);
    };

    const handleExport = async () => {
        setIsDownloading(true);
        let elements: HTMLElement[] = [];
        const elementClassName = premium
            ? 'exportableClassPremium'
            : 'exportableClassV1';
        elements = Array.from(
            document.getElementsByClassName(elementClassName)
        ) as HTMLElement[];
        elements = [elements[0]];

        const dataUrl = await toPng(elements[0], {
            backgroundColor: 'rgba(0, 0, 0, 0)',
            cacheBust: true,
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download =
            `${getDisplayName(specifiedUser)}.png` || 'default_name.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsDownloading(false);
    };

    function saveToUrl() {
        setSearchParams(searchParams => {
            searchParams.set(VALUE_ARCHETYPE, valueArchetype);
            searchParams.set(ROSTER_ARCHETYPE, rosterArchetype);
            searchParams.set(TOP_PRIORITIES, topPriorities.join('-'));
            searchParams.set(
                TRADE_PARTNERS,
                tradePartners.map(p => p?.user_id || '').join('-')
            );
            fullMoves.forEach((move, idx) => {
                console.log(move);
                searchParams.set(`${MOVE}_${idx}`, move.move);
                // these are em dashes! to prevent breaking up rookie pick IDs
                searchParams.set(
                    `${TO_TRADE}_${idx}`,
                    move.playerIdsToTrade.join('—')
                );
                searchParams.set(
                    `${TO_TARGET}_${idx}`,
                    move.playerIdsToTarget.map(p => p.join('—')).join('|')
                );
            });
            searchParams.set(TWO_YEAR_OUTLOOK, twoYearOutlook.join('-'));

            return searchParams;
        });
    }

    function loadFromUrl() {
        setValueArchetype(
            (searchParams.get(VALUE_ARCHETYPE) as ValueArchetype) ||
                ValueArchetype.None
        );
        setRosterArchetype(
            (searchParams.get(ROSTER_ARCHETYPE) as RosterArchetype) ||
                RosterArchetype.None
        );
        setTopPriorities((searchParams.get(TOP_PRIORITIES) || '').split('-'));
        setTradePartners(
            allUsers.filter(u =>
                (searchParams.get(TRADE_PARTNERS) || '')
                    .split('-')
                    .includes(u.user_id)
            )
        );
        setTwoYearOutlook(
            (searchParams.get(TWO_YEAR_OUTLOOK) || '')
                .split('-')
                .map(o => o as OutlookOption)
        );

        const moves = [];
        for (let i = 0; i < 6; i++) {
            moves.push({
                move:
                    (searchParams.get(`${MOVE}_${i}`) as Move) || Move.DOWNTIER,
                playerIdsToTrade: (
                    searchParams.get(`${TO_TRADE}_${i}`) || ''
                ).split('—'),
                playerIdsToTarget: (searchParams.get(`${TO_TARGET}_${i}`) || '')
                    .split('|')
                    .map(p => p.split('—')),
            });
        }
        setFullMoves(moves);
    }

    function clearUrlSave() {
        setSearchParams(searchParams => {
            searchParams.delete(VALUE_ARCHETYPE);
            searchParams.delete(ROSTER_ARCHETYPE);
            searchParams.delete(TOP_PRIORITIES);
            searchParams.delete(TRADE_PARTNERS);
            searchParams.delete(TWO_YEAR_OUTLOOK);
            for (let i = 0; i < 6; i++) {
                searchParams.delete(`${MOVE}_${i}`);
                searchParams.delete(`${TO_TRADE}_${i}`);
                searchParams.delete(`${TO_TARGET}_${i}`);
            }
            return searchParams;
        });
    }

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
                                    submitNewLeague();
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
                                submitNewLeague();
                            }}
                            disabled={!newLeagueId.trim()}
                        >
                            Submit
                        </Button>
                    </Box>
                </Modal>
                <div className={styles.bpActions}>
                    <Button
                        loading={isDownloading}
                        variant="outlined"
                        endIcon={<FileDownload />}
                        sx={{
                            ...bpActionButtonStyle,
                            color: '#1AE069',
                            '.MuiButton-loadingIndicator': {
                                color: '#1AE069',
                            },
                        }}
                        onClick={() => handleExport()}
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
                        onClick={() => saveToUrl()}
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
                        <div
                            className={styles.previewModal}
                            style={{width: premium ? '1900px' : '800px'}}
                        >
                            {!premium && (
                                <NewV1
                                    teamName={getDisplayName(specifiedUser)}
                                    numTeams={numTeams}
                                    isSuperFlex={isSuperFlex}
                                    ppr={ppr}
                                    tep={tep}
                                    valueArchetype={valueArchetype}
                                    rosterArchetype={rosterArchetype}
                                    qbGrade={qb}
                                    rbGrade={rb}
                                    wrGrade={wr}
                                    teGrade={te}
                                    benchGrade={depth}
                                    overallGrade={overall}
                                    draftCapitalScore={draftCapitalScore}
                                    twoYearOutlook={twoYearOutlook}
                                    rosterPlayers={rosterPlayers}
                                    getStartingPosition={getStartingPosition}
                                    productionShare={`${productionSharePercent}%`}
                                    valueShare={`${valueSharePercent}%`}
                                    productionShareRank={productionShareRank}
                                    valueShareRank={valueShareRank}
                                    draftCapitalNotes={draftCapitalNotes}
                                    tradePartners={tradePartners}
                                    topPriorities={topPriorities}
                                    tradeStrategy={fullMoves}
                                />
                            )}
                            {premium && (
                                <Premium
                                    teamName={getDisplayName(specifiedUser)}
                                    numTeams={numTeams}
                                    isSuperFlex={isSuperFlex}
                                    ppr={ppr}
                                    tep={tep}
                                    valueArchetype={valueArchetype}
                                    rosterArchetype={rosterArchetype}
                                    qbGrade={qb}
                                    rbGrade={rb}
                                    wrGrade={wr}
                                    teGrade={te}
                                    benchGrade={depth}
                                    overallGrade={overall}
                                    draftCapitalScore={draftCapitalScore}
                                    twoYearOutlook={twoYearOutlook}
                                    rosterPlayers={rosterPlayers}
                                    getStartingPosition={getStartingPosition}
                                    productionShare={`${productionSharePercent}%`}
                                    valueShare={`${valueSharePercent}%`}
                                    productionShareRank={productionShareRank}
                                    valueShareRank={valueShareRank}
                                    draftCapitalNotes={draftCapitalNotes}
                                    tradePartners={tradePartners}
                                    topPriorities={topPriorities}
                                    tradeStrategy={fullMoves}
                                    draftStrategy={draftStrategy}
                                    domainTrueRanks={domainTrueRanks}
                                    threeFactorGrades={threeFactorGrades}
                                    leaguePowerRanks={leaguePowerRanks}
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
                        <DomainTextField
                            label={
                                <div
                                    style={{width: '40px'}}
                                    className={styles.labels}
                                >
                                    PROD. SHARE
                                </div>
                            }
                            // options={PCT_OPTIONS}
                            value={productionSharePercent}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (Number.isNaN(+value)) return;
                                setProductionSharePercent(+value);
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div
                                    style={{width: '40px'}}
                                    className={styles.labels}
                                >
                                    PROD. SHARE RANK
                                </div>
                            }
                            options={[
                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                                15, 16, 17, 18, 19, 20,
                            ]}
                            value={productionShareRank}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setProductionShareRank(value as number);
                            }}
                        />
                        <DomainTextField
                            label={
                                <div
                                    style={{width: '40px'}}
                                    className={styles.labels}
                                >
                                    VALUE SHARE
                                </div>
                            }
                            value={valueSharePercent}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (Number.isNaN(+value)) return;
                                setValueSharePercent(+value);
                            }}
                        />
                        <DomainDropdown
                            label={
                                <div
                                    style={{width: '40px'}}
                                    className={styles.labels}
                                >
                                    VALUE SHARE RANK
                                </div>
                            }
                            options={[
                                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
                                15, 16, 17, 18, 19, 20,
                            ]}
                            value={valueShareRank}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setValueShareRank(value as number);
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
                                        .filter(p => p && p.position === QB)
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
                                        .filter(p => p && p.position === RB)
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
                                        .filter(p => p && p.position === WR)
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
                                        .filter(p => p && p.position === TE)
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
                                {overall > -1 && (
                                    <DomainTextField
                                        label={
                                            <div
                                                className={styles.labels}
                                                style={{color: '#B4D9E4'}}
                                            >
                                                OVERALL
                                            </div>
                                        }
                                        value={overall}
                                        onChange={e => {
                                            let val = +e.target.value;
                                            if (Number.isNaN(val)) {
                                                console.log(
                                                    e.target.value,
                                                    'is not a number'
                                                );
                                                return;
                                            }
                                            while (val > 10) {
                                                val = val / 10;
                                            }
                                            setOverall(val);
                                        }}
                                        outlineColor={'#B4D9E4'}
                                        labelMarginRight={'10px'}
                                    />
                                )}
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
                            options={
                                valueArchetype === ValueArchetype.EliteValue
                                    ? ELITE_PRIORITY_OPTIONS
                                    : PRIORITY_OPTIONS
                            }
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTopPriorities([
                                    value as string,
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
                            options={
                                valueArchetype === ValueArchetype.EliteValue
                                    ? ELITE_PRIORITY_OPTIONS
                                    : PRIORITY_OPTIONS
                            }
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTopPriorities([
                                    topPriorities[0],
                                    value as string,
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
                            options={
                                valueArchetype === ValueArchetype.EliteValue
                                    ? ELITE_PRIORITY_OPTIONS
                                    : PRIORITY_OPTIONS
                            }
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                setTopPriorities([
                                    topPriorities[0],
                                    topPriorities[1],
                                    value as string,
                                ]);
                            }}
                        />
                    </div>
                    {premium && (
                        <div className={styles.draftStrategyContainer}>
                            <div className={styles.draftStrategyTitle}>
                                Draft Strategy
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
                                value={draftStrategy[0]}
                                options={Object.values(DraftStrategyLabel)}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    setDraftStrategy([
                                        value as DraftStrategyLabel,
                                        draftStrategy[1],
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
                                value={draftStrategy[1]}
                                options={Object.values(DraftStrategyLabel)}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    setDraftStrategy([
                                        draftStrategy[0],
                                        value as DraftStrategyLabel,
                                    ]);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.offScreen}>
                <div
                    className={'exportableClassV1'}
                    style={{width: '12800px', height: '16971px'}}
                >
                    <div className={styles.offScreenInner}>
                        <NewV1
                            teamName={getDisplayName(specifiedUser)}
                            numTeams={numTeams}
                            isSuperFlex={isSuperFlex}
                            ppr={ppr}
                            tep={tep}
                            valueArchetype={valueArchetype}
                            rosterArchetype={rosterArchetype}
                            qbGrade={qb}
                            rbGrade={rb}
                            wrGrade={wr}
                            teGrade={te}
                            benchGrade={depth}
                            overallGrade={overall}
                            draftCapitalScore={draftCapitalScore}
                            twoYearOutlook={twoYearOutlook}
                            rosterPlayers={rosterPlayers}
                            getStartingPosition={getStartingPosition}
                            productionShare={`${productionSharePercent}%`}
                            valueShare={`${valueSharePercent}%`}
                            productionShareRank={productionShareRank}
                            valueShareRank={valueShareRank}
                            draftCapitalNotes={draftCapitalNotes}
                            tradePartners={tradePartners}
                            topPriorities={topPriorities}
                            tradeStrategy={fullMoves}
                        />
                        {/* <Premium
                            teamName={getDisplayName(specifiedUser)}
                            numTeams={numTeams}
                            isSuperFlex={isSuperFlex}
                            ppr={ppr}
                            tep={tep}
                            valueArchetype={valueArchetype}
                            rosterArchetype={rosterArchetype}
                            qbGrade={qb}
                            rbGrade={rb}
                            wrGrade={wr}
                            teGrade={te}
                            benchGrade={depth}
                            overallGrade={overall}
                            draftCapitalScore={draftCapitalScore}
                            twoYearOutlook={twoYearOutlook}
                            rosterPlayers={rosterPlayers}
                            getStartingPosition={getStartingPosition}
                            productionShare={`${productionSharePercent}%`}
                            valueShare={`${valueSharePercent}%`}
                            productionShareRank={productionShareRank}
                            valueShareRank={valueShareRank}
                            draftCapitalNotes={draftCapitalNotes}
                            tradePartners={tradePartners}
                            topPriorities={topPriorities}
                            tradeStrategy={fullMoves}
                            draftStrategy={draftStrategy}
                        /> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export enum Move {
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
            ...rosterPlayers
                .filter(p => !!p)
                .map(p => `${p.first_name} ${p.last_name}`),
            ...nonIdPlayerOptions,
        ]);
    }, [rosterPlayers]);
    useEffect(() => {
        if (!playerData || !rosterPlayers[0] || playerIdsToTrade[0]) return;
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
