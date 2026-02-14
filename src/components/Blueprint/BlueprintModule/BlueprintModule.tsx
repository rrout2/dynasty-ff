import {useEffect, useRef, useState} from 'react';
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
    AZURE_API_URL,
    convertStringToOutlookOption,
    convertStringToRosterArchetype,
    convertStringToValueArchetype,
    LeagueSettings,
    PowerRank,
    RosterPlayer,
    TradeAsset,
    useAdpData,
    useBlueprint,
    useDomainTrueRanks,
    useDraftCapitalGrade,
    useFetchRosters,
    useGetPicks,
    useLeague,
    useLeagueIdFromUrl,
    useLeaguePowerRanks,
    useParamFromUrl,
    usePlayerData,
    usePositionalGrades,
    usePositionalValueGrades,
    useProjectedLineup,
    useRosterSettingsFromId,
    useSleeperIdMap,
    useTeamIdFromUrl,
    useTeamProductionShare,
    useTeamRosterArchetype,
    useTeamValueArchetype,
    useTeamValueShare,
    useThreeFactorGrades,
    useTitle,
    useTradeSuggestions,
    useTwoYearOutlook,
} from '../../../hooks/hooks';
import {
    FLEX,
    FLEX_SET,
    QB,
    RB,
    SUPER_FLEX,
    SUPER_FLEX_SET,
    TE,
    WR,
} from '../../../consts/fantasy';
import {
    getAllUsers,
    Player,
    Roster,
    User,
} from '../../../sleeper-api/sleeper-api';
import {
    BLUEPRINT_ID,
    LEAGUE_ID,
    MOVE,
    NONE_TEAM_ID,
    ROSTER_ARCHETYPE,
    TEAM_ID,
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
import {Box, Button, IconButton, Modal, Tooltip} from '@mui/material';
import {
    AddCircleOutline,
    FileDownload,
    Preview,
    Save,
    Casino,
    PushPin,
    PushPinOutlined,
} from '@mui/icons-material';
import NewV1, {rookiePickIdToString} from '../NewV1/NewV1';
import {toPng} from 'html-to-image';
import Premium from '../Premium/Premium';
import {useSearchParams} from 'react-router-dom';
import {isRookiePickId} from '../v1/modules/playerstotarget/PlayersToTargetModule';
import axios from 'axios';

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
    'Use strategic downtiering to raise your production ceiling',
    "Try targeting rookie picks at a discount from 'contenders' in your league",
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

const CATCH_ALL_PRIORITY_OPTIONS = new Map<OutlookOption, string[]>([
    [
        OutlookOption.Rebuild,
        [
            'Everyone on your current roster should be shopped for the right price',
            "Don't go out of your way to target any rookie picks further than two years out",
            'Be active - multiple small market wins is easier than one masive trade',
            'Primarily build through the insulated positions (WR & RB)',
            'Rebuilding is about gaining value, less about immediate positional needs',
            'Worry less about age & more about 9 month market plays & value insulation',
        ],
    ],
    [
        OutlookOption.Reload,
        [
            'The more you play the market, the quicker the reload will be',
            "Don't downtier too far from top assets, no further than one or two tiers",
            'Make as many trades as possible to build small value wins',
            'Shop your productive vets at a premium when they produce midseason',
            'Use rookie picks to gain value wins, not to plug holes',
            "Try targeting rookie picks at a discount from 'contenders' in your league",
        ],
    ],
    [
        OutlookOption.Contend,
        [
            'If you have a poor start to the season, you can always reload midseason',
            'Rebuilds & reloads are your most likely trade partners when looking to uptier',
            "Don't make unecessary moves that fail to improve your upside opportunity",
            "Production matters closer to the season; don't neglect value wins now",
            'Avoid volatile situational outlooks heading into the NFL draft',
            "Don't superload one position at the expense of others",
        ],
    ],
]);

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
    priorityDescription: string;
};

function assetToString(p: TradeAsset) {
    if (p.playerSleeperId) {
        return '' + p.playerSleeperId;
    }
    return `RP-API-${p.pickYear}-${p.pickRound}-${p.overallPickIndex}`;
}

export default function BlueprintModule({
    premium = false,
}: BlueprintModuleProps) {
    // Hooks
    useTitle(premium ? 'Premium Blueprint Module' : 'Blueprint Module');
    const [loggedIn, setLoggedIn] = useState(
        sessionStorage.getItem('authToken') !== null
    );
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [newLeagueModalOpen, setNewLeagueModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [newLeagueId, setNewLeagueId] = useState('');
    const [newBlueprintId, setNewBlueprintId] = useState('');
    const [blueprintId, setBlueprintId] = useParamFromUrl(BLUEPRINT_ID);
    const [leagueId, setLeagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();

    const [isSleeperLeague, setIsSleeperLeague] = useState(true);
    const [tradePartners, setTradePartners] = useState<(User | undefined)[]>([
        undefined,
        undefined,
    ]);
    const [topPriorities, setTopPriorities] = useState<string[]>(['', '', '']);
    const [roster, setRoster] = useState<Roster>();
    const [rosterPlayers, setRosterPlayers] = useState<Player[]>([]);
    const [apiRosterPlayers, setApiRosterPlayers] = useState<RosterPlayer[]>(
        []
    );
    const playerData = usePlayerData();
    const {getApiIdFromSleeperId} = useSleeperIdMap();
    const {sortByAdp, getPositionalAdp} = useAdpData();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettingsFromId(leagueId);
    const rosterSettingsHasSuperFlex = rosterSettings.has(SUPER_FLEX);
    const [numTeams, setNumTeams] = useState(12);

    const {blueprint, setBlueprint} = useBlueprint(blueprintId);
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
    const {tradeSuggestions: apiTradeSuggestions} = useTradeSuggestions(
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
            priorityDescription: '',
        },
        {
            move: Move.PIVOT,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
            priorityDescription: '',
        },
        {
            move: Move.UPTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
            priorityDescription: '',
        },
        {
            move: Move.DOWNTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
            priorityDescription: '',
        },
        {
            move: Move.PIVOT,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
            priorityDescription: '',
        },
        {
            move: Move.UPTIER,
            playerIdsToTrade: [],
            playerIdsToTarget: [
                ['', ''],
                ['', ''],
                ['', ''],
            ],
            priorityDescription: '',
        },
    ]);
    const [draftCapitalNotes2026, setDraftCapitalNotes2026] = useState('');
    const [draftCapitalNotes2027, setDraftCapitalNotes2027] = useState('');
    const [draftCapitalNotes, setDraftCapitalNotes] = useState(
        new Map<number, string>()
    ); // only updates when draftCapitalNotes2026 or draftCapitalNotes2027 changes
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
    const [percentile, setPercentile] = useState('69th');
    const [buildPercentage, setBuildPercentage] = useState('23%');
    const {qb, setQb, rb, setRb, wr, setWr, te, setTe} =
        usePositionalValueGrades(
            leagueId,
            '' + getRosterIdFromUser(specifiedUser)
        );
    const {
        draftCapitalGrade: draftCapitalScore,
        setDraftCapitalGrade: setDraftCapitalScore,
    } = useDraftCapitalGrade(leagueId, '' + getRosterIdFromUser(specifiedUser));
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
    const [apiStartingLineup, setApiStartingLineup] = useState<
        {player: RosterPlayer; position: string}[]
    >([]);
    const [draftStrategy, setDraftStrategy] = useState<DraftStrategyLabel[]>([
        DraftStrategyLabel.None,
        DraftStrategyLabel.None,
    ]);
    const {
        valueSharePercent,
        leagueRank: valueShareRank,
        setValueSharePercent,
        setLeagueRank: setValueShareRank,
        qbValueSharePercent,
        rbValueSharePercent,
        wrValueSharePercent,
        teValueSharePercent,
        qbValueProportionPercent,
        rbValueProportionPercent,
        wrValueProportionPercent,
        teValueProportionPercent,
        pickValueProportionPercent,
    } = useTeamValueShare(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser),
        isSleeperLeague
    );
    const [startingQbAge, setStartingQbAge] = useState(0);
    const [startingRbAge, setStartingRbAge] = useState(0);
    const [startingWrAge, setStartingWrAge] = useState(0);
    const [startingTeAge, setStartingTeAge] = useState(0);
    const [makeup, setMakeup] = useState(new Map<string, number>());
    const {
        productionSharePercent,
        leagueRank: productionShareRank,
        setProductionSharePercent,
        setLeagueRank: setProductionShareRank,
    } = useTeamProductionShare(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser),
        isSleeperLeague
    );
    const {domainTrueRanks} = useDomainTrueRanks(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const {threeFactorGrades, setThreeFactorGrades} = useThreeFactorGrades(
        leagueId,
        '' + getRosterIdFromUser(specifiedUser)
    );
    const {leaguePowerRanks, setLeaguePowerRanks} =
        useLeaguePowerRanks(leagueId);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isDownloading, setIsDownloading] = useState(false);
    const [playerIdToAssetKey, setPlayerIdToAssetKey] = useState<
        Map<string, string>
    >(new Map());

    useEffect(() => {
        if (!blueprint || !playerData) return;
        setNumTeams(blueprint.leagueSettings.numberOfTeams);
        setIsSuperFlex(blueprint.leagueSettings.isSuperFlex);
        setPpr(blueprint.leagueSettings.pointsPerReception);
        setTep(blueprint.leagueSettings.tightEndPremium);
        setProductionSharePercent(blueprint.productionSharePercentage);
        setValueSharePercent(blueprint.valueSharePercentage);
        setProductionShareRank(blueprint.productionShareLeagueRank);
        setValueShareRank(blueprint.valueShareLeagueRank);
        setValueArchetype(
            convertStringToValueArchetype(blueprint.valueArchetype)
        );
        setRosterArchetype(
            convertStringToRosterArchetype(blueprint.rosterArchetype)
        );
        setTwoYearOutlook(
            blueprint.outlooks
                .map(o => o.outlook)
                .map(convertStringToOutlookOption)
        );
        setQb(
            blueprint.positionalGrades.find(g => g.position === QB)?.grade ?? 0
        );
        setRb(
            blueprint.positionalGrades.find(g => g.position === RB)?.grade ?? 0
        );
        setWr(
            blueprint.positionalGrades.find(g => g.position === WR)?.grade ?? 0
        );
        setTe(
            blueprint.positionalGrades.find(g => g.position === TE)?.grade ?? 0
        );
        setLeaguePowerRanks(
            blueprint.powerRankings.map(p => {
                return {
                    teamName: p.teamName,
                    overallRank: p.teamRank,
                } as PowerRank;
            })
        );
        setSpecifiedUser({
            display_name: blueprint.teamName,
            user_id: '',
            username: '',
            avatar: '',
            metadata: {
                team_name: '',
            },
        });
        setStartingQbAge(
            blueprint.averageStarterAges.find(g => g.position === QB)
                ?.averageAge ?? 0
        );
        setStartingRbAge(
            blueprint.averageStarterAges.find(g => g.position === RB)
                ?.averageAge ?? 0
        );
        setStartingWrAge(
            blueprint.averageStarterAges.find(g => g.position === WR)
                ?.averageAge ?? 0
        );
        setStartingTeAge(
            blueprint.averageStarterAges.find(g => g.position === TE)
                ?.averageAge ?? 0
        );
        const newMakeup = new Map<string, number>();
        for (const rmu of blueprint.rosterMakeup) {
            newMakeup.set(rmu.assetCategory, rmu.percentage);
        }
        setMakeup(newMakeup);
        const qbs = blueprint.rosterPlayers.filter(p => p.position === QB);
        const numQbs = qbs.length;
        const rbs = blueprint.rosterPlayers.filter(p => p.position === RB);
        const numRbs = rbs.length;
        const wrs = blueprint.rosterPlayers.filter(p => p.position === WR);
        const numWrs = wrs.length;
        const tes = blueprint.rosterPlayers.filter(p => p.position === TE);
        const numTes = tes.length;
        setThreeFactorGrades({
            qbInsulationScoreGrade:
                Math.round(
                    qbs.map(p => p.insulationScore).reduce((a, b) => a + b, 0) /
                        numQbs
                ) / 10,
            rbInsulationScoreGrade:
                Math.round(
                    rbs.map(p => p.insulationScore).reduce((a, b) => a + b, 0) /
                        numRbs
                ) / 10,
            wrInsulationScoreGrade:
                Math.round(
                    wrs.map(p => p.insulationScore).reduce((a, b) => a + b, 0) /
                        numWrs
                ) / 10,
            teInsulationScoreGrade:
                Math.round(
                    tes.map(p => p.insulationScore).reduce((a, b) => a + b, 0) /
                        numTes
                ) / 10,
            qbProductionScoreGrade:
                Math.round(
                    qbs.map(p => p.productionScore).reduce((a, b) => a + b, 0) /
                        numQbs
                ) / 10,
            rbProductionScoreGrade:
                Math.round(
                    rbs.map(p => p.productionScore).reduce((a, b) => a + b, 0) /
                        numRbs
                ) / 10,
            wrProductionScoreGrade:
                Math.round(
                    wrs.map(p => p.productionScore).reduce((a, b) => a + b, 0) /
                        numWrs
                ) / 10,
            teProductionScoreGrade:
                Math.round(
                    tes.map(p => p.productionScore).reduce((a, b) => a + b, 0) /
                        numTes
                ) / 10,
            qbSituationalScoreGrade:
                Math.round(
                    qbs
                        .map(p => p.situationalScore)
                        .reduce((a, b) => a + b, 0) / numQbs
                ) / 10,
            rbSituationalScoreGrade:
                Math.round(
                    rbs
                        .map(p => p.situationalScore)
                        .reduce((a, b) => a + b, 0) / numRbs
                ) / 10,
            wrSituationalScoreGrade:
                Math.round(
                    wrs
                        .map(p => p.situationalScore)
                        .reduce((a, b) => a + b, 0) / numWrs
                ) / 10,
            teSituationalScoreGrade:
                Math.round(
                    tes
                        .map(p => p.situationalScore)
                        .reduce((a, b) => a + b, 0) / numTes
                ) / 10,
        });
        setRosterPlayers(
            blueprint.rosterPlayers.map(p => playerData[p.playerSleeperBotId])
        );
        const newPlayerIdToAssetKey = new Map<string, string>(
            playerIdToAssetKey
        );
        for (const p of blueprint.rosterPlayers) {
            newPlayerIdToAssetKey.set(p.playerSleeperBotId, `player:${p.id}`);
        }
        setApiRosterPlayers(blueprint.rosterPlayers);

        const leagueSettings = blueprint.leagueSettings;
        setApiStartingLineup(
            getApiStartingLineup(leagueSettings, blueprint.rosterPlayers)
        );
    }, [blueprint, playerData]);

    useEffect(() => {
        if (!domainTrueRanks || domainTrueRanks.length === 0 || blueprint) {
            return;
        }
        const newMakeup = new Map<string, number>();
        for (const dtr of domainTrueRanks) {
            const archetype = dtr.dynastyAssetCategory;
            const count = (newMakeup.get(archetype) || 0) + 1;
            newMakeup.set(archetype, count);
        }
        for (const [archetype, count] of newMakeup) {
            newMakeup.set(
                archetype,
                +((100 * count) / domainTrueRanks.length).toFixed(1)
            );
        }
        setMakeup(newMakeup);
    }, [domainTrueRanks]);

    useEffect(() => {
        if (blueprint) return;
        const starters = new Map<string, Player[]>();
        rosterPlayers
            .filter(p => !!p)
            .forEach(player => {
                const name = `${player.first_name} ${player.last_name}`;
                const position = getStartingPosition(name);
                if (position) {
                    const pos = player.position;
                    if (starters.has(pos)) {
                        starters.get(pos)?.push(player);
                    } else {
                        starters.set(pos, [player]);
                    }
                }
            });
        const qb = starters.get(QB);
        if (qb && qb.length > 0) {
            const totalAge = qb.reduce((acc, player) => acc + player.age, 0);
            setStartingQbAge(Math.round(10 * (totalAge / qb.length)) / 10);
        }

        const rb = starters.get(RB);
        if (rb && rb.length > 0) {
            const totalAge = rb.reduce((acc, player) => acc + player.age, 0);
            setStartingRbAge(Math.round(10 * (totalAge / rb.length)) / 10);
        }

        const wr = starters.get(WR);
        if (wr && wr.length > 0) {
            const totalAge = wr.reduce((acc, player) => acc + player.age, 0);
            setStartingWrAge(Math.round(10 * (totalAge / wr.length)) / 10);
        }

        const te = starters.get(TE);
        if (te && te.length > 0) {
            const totalAge = te.reduce((acc, player) => acc + player.age, 0);
            setStartingTeAge(Math.round(10 * (totalAge / te.length)) / 10);
        }
    }, [rosterPlayers, getStartingPosition, blueprint]);

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
        if (!roster?.players) return;
        const newPlayerIdToAssetKey = new Map<string, string>(
            playerIdToAssetKey
        );
        roster.players.forEach(playerId => {
            newPlayerIdToAssetKey.set(
                playerId,
                `player:${getApiIdFromSleeperId(playerId)}`
            );
        });
        setPlayerIdToAssetKey(newPlayerIdToAssetKey);
    }, [roster?.players, getApiIdFromSleeperId]);

    useEffect(() => {
        if (!myPicks) return;
        const year1 = '2026';
        const year2 = '2027';
        const nextYearInfo = getPicksInfo(myPicks, year1);
        setDraftCapitalNotes2026(nextYearInfo);
        const followingYearInfo = getPicksInfo(myPicks, year2);
        setDraftCapitalNotes2027(followingYearInfo);

        const numYearOneFirsts = myPicks.filter(
            p => p.season === year1 && p.round === 1
        );
        let draftStrategy1 = DraftStrategyLabel.None;
        if (numYearOneFirsts.length >= 5) {
            draftStrategy1 = DraftStrategyLabel.Overload;
        } else if (numYearOneFirsts.length >= 3) {
            draftStrategy1 = DraftStrategyLabel.Surplus;
        } else if (numYearOneFirsts.length >= 1) {
            draftStrategy1 = DraftStrategyLabel.Adequate;
        } else {
            draftStrategy1 = DraftStrategyLabel.Deficient;
        }

        const numYearTwoFirsts = myPicks.filter(
            p => p.season === year2 && p.round === 1
        );
        let draftStrategy2 = DraftStrategyLabel.None;
        if (numYearTwoFirsts.length >= 5) {
            draftStrategy2 = DraftStrategyLabel.Overload;
        } else if (numYearTwoFirsts.length >= 3) {
            draftStrategy2 = DraftStrategyLabel.Surplus;
        } else if (numYearTwoFirsts.length >= 1) {
            draftStrategy2 = DraftStrategyLabel.Adequate;
        } else {
            draftStrategy2 = DraftStrategyLabel.Deficient;
        }
        setDraftStrategy([draftStrategy1, draftStrategy2]);
    }, [myPicks]);

    useEffect(() => {
        if (
            apiTradeSuggestions.length === 0 ||
            searchParams.has(`${TO_TRADE}_0`)
        ) {
            return;
        }
        const collatedTrades = new Map<string, string[]>();
        const priorityDescriptions = new Map<string, string>();
        const targetRosterCounts = new Map<number, number>();
        const newPlayerIdToAssetKey = new Map<string, string>(
            playerIdToAssetKey
        );

        function assetToStringAndStore(p: TradeAsset) {
            const str = assetToString(p);
            newPlayerIdToAssetKey.set(str, p.assetKey);
            return str;
        }

        for (const suggestion of apiTradeSuggestions) {
            let key = suggestion.outAssets
                .map(assetToStringAndStore)
                .sort()
                .join(',');
            key += `,${suggestion.rule.moveType}`; // to differentiate between pivot and downtier
            const value = suggestion.inAssets
                .map(assetToStringAndStore)
                .sort()
                .join(',');
            if (!collatedTrades.has(key)) {
                collatedTrades.set(key, [value]);
            } else if (!collatedTrades.get(key)!.includes(value)) {
                // don't add duplicates
                collatedTrades.get(key)!.push(value);
            }
            if (!priorityDescriptions.has(key)) {
                priorityDescriptions.set(
                    key,
                    suggestion.rule.priorityDescription
                );
            }

            const target = suggestion.targetRosterId;
            if (!targetRosterCounts.has(target)) {
                targetRosterCounts.set(target, 1);
            } else {
                targetRosterCounts.set(
                    target,
                    targetRosterCounts.get(target)! + 1
                );
            }
        }

        // find the 2 most common targetRosterIds
        const mostCommonTargetRosterId = [...targetRosterCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(i => i[0])
            .map(i => getUserFromRosterId(i - 1)!)
            .slice(0, 2);
        setTradePartners(mostCommonTargetRosterId);

        const apiSuggestions = collatedTrades
            .entries()
            .map(([key, values]) => ({
                outPlayerIds: key.split(',').slice(0, -1), // remove move type
                returnPackages: values.map(v => v.split(',')),
                type: key.split(',').slice(-1)[0],
                priorityDescription: priorityDescriptions.get(key)!,
            }))
            .map(
                ({outPlayerIds, returnPackages, type, priorityDescription}) => {
                    let move: Move;
                    if (type === 'Pivot') {
                        move = Move.PIVOT;
                    } else if (type === 'Downtier') {
                        move = Move.DOWNTIER;
                    } else {
                        move = Move.UPTIER;
                    }
                    // make sure all arrays have 2 players per return package
                    for (let i = 0; i < returnPackages.length; i++) {
                        if (returnPackages[i].length === 1) {
                            returnPackages[i].push('');
                        }
                    }
                    // make sure at least three return packages
                    while (returnPackages.length < 3) {
                        returnPackages.push(['', '']);
                    }
                    return {
                        move,
                        playerIdsToTrade: outPlayerIds,
                        playerIdsToTarget: returnPackages,
                        priorityDescription,
                    } as FullMove;
                }
            )
            .toArray();
        const sorted = apiSuggestions.sort((a, b) => {
            const toTargetA = a.playerIdsToTarget.filter(
                ids => !ids.every(id => id === '')
            ).length;
            const toTargetB = b.playerIdsToTarget.filter(
                ids => !ids.every(id => id === '')
            ).length;
            return toTargetB - toTargetA;
        });
        while (sorted.length < 6) {
            sorted.push({
                move: Move.PIVOT,
                playerIdsToTrade: [],
                playerIdsToTarget: [
                    ['', ''],
                    ['', ''],
                    ['', ''],
                ],
                priorityDescription: '',
            });
        }
        setFullMoves(
            apiSuggestions.sort((a, b) => {
                const toTargetA = a.playerIdsToTarget.filter(
                    ids => !ids.every(id => id === '')
                ).length;
                const toTargetB = b.playerIdsToTarget.filter(
                    ids => !ids.every(id => id === '')
                ).length;
                return toTargetB - toTargetA;
            })
        );
        setPlayerIdToAssetKey(newPlayerIdToAssetKey);
    }, [apiTradeSuggestions, searchParams]);

    useEffect(() => {
        if (searchParams.has(TOP_PRIORITIES)) {
            return;
        }
        if (valueArchetype !== ValueArchetype.EliteValue) {
            const priorityDescriptions = fullMoves
                .slice(0, 3)
                .map(m => m.priorityDescription);
            const dedupedPriorities = new Set(priorityDescriptions);
            if (dedupedPriorities.size === 3) {
                setTopPriorities(priorityDescriptions);
                return;
            } else {
                const catchAll = CATCH_ALL_PRIORITY_OPTIONS.get(
                    twoYearOutlook[0]
                )!;
                shuffle(catchAll);
                setTopPriorities([
                    ...dedupedPriorities,
                    ...catchAll.slice(0, 3 - dedupedPriorities.size),
                ]);
            }
            return;
        }
        shuffle(ELITE_PRIORITY_OPTIONS);
        setTopPriorities(ELITE_PRIORITY_OPTIONS.slice(0, 3));
    }, [fullMoves, valueArchetype, twoYearOutlook, searchParams]);

    useEffect(() => {
        setOverall(
            Math.round(((qb + rb + wr + te + draftCapitalScore) * 10) / 5) / 10
        );
    }, [qb, rb, wr, te, draftCapitalScore]);

    useEffect(() => {
        let newTwoYearOutlook: OutlookOption[] = [
            OutlookOption.Contend,
            OutlookOption.Contend,
        ];
        switch (valueArchetype) {
            case ValueArchetype.EliteValue:
                newTwoYearOutlook = [
                    OutlookOption.Contend,
                    OutlookOption.Contend,
                ];
                break;
            case ValueArchetype.EnhancedValue:
                newTwoYearOutlook = [
                    OutlookOption.Contend,
                    OutlookOption.Contend,
                ];
                break;
            case ValueArchetype.StandardValue:
                newTwoYearOutlook = [
                    OutlookOption.Contend,
                    OutlookOption.Contend,
                ];
                break;
            case ValueArchetype.AgingValue:
                newTwoYearOutlook = [
                    OutlookOption.Contend,
                    OutlookOption.Reload,
                ];
                break;
            case ValueArchetype.FutureValue:
                newTwoYearOutlook = [
                    OutlookOption.Rebuild,
                    OutlookOption.Contend,
                ];
                break;
            case ValueArchetype.HardRebuild:
                newTwoYearOutlook = [
                    OutlookOption.Rebuild,
                    OutlookOption.Rebuild,
                ];
                break;
            case ValueArchetype.OneYearReload:
                newTwoYearOutlook = [
                    OutlookOption.Reload,
                    OutlookOption.Contend,
                ];
                break;
        }
        setTwoYearOutlook(newTwoYearOutlook);
    }, [valueArchetype]);

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

    function getUserFromRosterId(rosterId: number) {
        if (!rosters) return;
        return allUsers.find(u => u.user_id === rosters[rosterId].owner_id);
    }

    function getStartingPosition(playerName: string) {
        return (
            startingLineup.find(
                ({player}) =>
                    `${player.first_name} ${player.last_name}` === playerName
            )?.position ||
            apiStartingLineup.find(
                ({player}) => player.playerName === playerName
            )?.position
        );
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
    const submitNewLeagueIdOrBlueprintId = () => {
        clearUrlSave();

        setRoster(undefined);
        setRosterPlayers([]);
        setTeamId('0');
        setSpecifiedUser(undefined);

        if (newLeagueId) {
            setBlueprint(undefined);
            setBlueprintId('');
            setLeagueId(newLeagueId.trim());
            setNewLeagueId('');
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.delete(BLUEPRINT_ID);
                next.set(LEAGUE_ID, newLeagueId);
                return next;
            });
        }

        if (newBlueprintId) {
            setLeagueId('');
            setBlueprintId(newBlueprintId.trim());
            setNewBlueprintId('');
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.delete(LEAGUE_ID);
                next.delete(TEAM_ID);
                next.set(BLUEPRINT_ID, newBlueprintId);
                return next;
            });
        }

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
                priorityDescription: '',
            },
            {
                move: Move.PIVOT,
                playerIdsToTrade: [],
                playerIdsToTarget: [
                    ['', ''],
                    ['', ''],
                    ['', ''],
                ],
                priorityDescription: '',
            },
            {
                move: Move.UPTIER,
                playerIdsToTrade: [],
                playerIdsToTarget: [
                    ['', ''],
                    ['', ''],
                    ['', ''],
                ],
                priorityDescription: '',
            },
            {
                move: Move.DOWNTIER,
                playerIdsToTrade: [],
                playerIdsToTarget: [
                    ['', ''],
                    ['', ''],
                    ['', ''],
                ],
                priorityDescription: '',
            },
            {
                move: Move.PIVOT,
                playerIdsToTrade: [],
                playerIdsToTarget: [
                    ['', ''],
                    ['', ''],
                    ['', ''],
                ],
                priorityDescription: '',
            },
            {
                move: Move.UPTIER,
                playerIdsToTrade: [],
                playerIdsToTarget: [
                    ['', ''],
                    ['', ''],
                    ['', ''],
                ],
                priorityDescription: '',
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
            searchParams.set(TOP_PRIORITIES, topPriorities.join('|'));
            searchParams.set(
                TRADE_PARTNERS,
                tradePartners.map(p => p?.user_id || '').join('-')
            );
            fullMoves.forEach((move, idx) => {
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
        setTopPriorities((searchParams.get(TOP_PRIORITIES) || '').split('|'));
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
                priorityDescription: '',
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

    function rerollMove(idx: number) {
        const swapLimit = premium ? 6 : 3;
        const move = fullMoves[idx];
        // swap move at idx with a random move with an idx >= 6
        const randomIdx =
            Math.floor(Math.random() * (fullMoves.length - swapLimit)) +
            swapLimit;
        const randomMove = fullMoves[randomIdx];
        fullMoves[idx] = randomMove;
        fullMoves[randomIdx] = move;
        setFullMoves([...fullMoves]);
    }

    async function submitLogin() {
        const options = {
            method: 'POST',
            url: 'https://domainffapi.azurewebsites.net/api/Auth/login',
            headers: {'Content-Type': 'application/json'},
            data: {email: loginEmail, password: loginPassword},
        };
        const res = await axios.request(options);
        const token = res.data.token;
        sessionStorage.setItem('authToken', token);
        const options2 = {
            method: 'GET',
            url: 'https://domainffapi.azurewebsites.net/api/Auth/me',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const res2 = await axios.request(options2);
        setLoggedIn(res2.data.isAuthenticated);
        setLoginModalOpen(false);
    }

    function submitLogout() {
        sessionStorage.removeItem('authToken');
        setLoggedIn(false);
    }

    return (
        <div style={{backgroundColor: DARK_BLUE}}>
            <div className={styles.headerContainer}>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (loggedIn) {
                            submitLogout();
                        } else {
                            setLoginModalOpen(true);
                        }
                    }}
                    sx={{
                        backgroundColor: '#28ABE2',
                        color: DARK_BLUE,
                        fontFamily: 'Prohibition',
                        '&:disabled': {
                            backgroundColor: 'gray',
                        },
                    }}
                >
                    {loggedIn ? 'Log Out' : 'Login'}
                </Button>
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
                            onChange={e => {
                                setNewLeagueId(e.target.value);
                                setNewBlueprintId('');
                            }}
                            onKeyUp={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitNewLeagueIdOrBlueprintId();
                                }
                            }}
                        />
                        <DomainTextField
                            label="New BP ID (in progress)"
                            value={newBlueprintId}
                            onChange={e => {
                                setNewBlueprintId(e.target.value);
                                setNewLeagueId('');
                            }}
                            onKeyUp={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitNewLeagueIdOrBlueprintId();
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
                                submitNewLeagueIdOrBlueprintId();
                            }}
                            disabled={
                                !newLeagueId.trim() && !newBlueprintId.trim()
                            }
                        >
                            Submit
                        </Button>
                    </Box>
                </Modal>
                <Modal
                    open={loginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                >
                    <Box className={styles.loginModal}>
                        <DomainTextField
                            label="Email"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            onKeyUp={e => e.key === 'Enter' && submitLogin()}
                        />
                        <DomainTextField
                            type={'password'}
                            label="Password"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            onKeyUp={e => e.key === 'Enter' && submitLogin()}
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
                                submitLogin();
                            }}
                            disabled={
                                !loginEmail.trim() || !loginPassword.trim()
                            }
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
                                    apiRosterPlayers={apiRosterPlayers}
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
                                    apiRosterPlayers={apiRosterPlayers}
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
                                    qbValueSharePercent={qbValueSharePercent}
                                    rbValueSharePercent={rbValueSharePercent}
                                    wrValueSharePercent={wrValueSharePercent}
                                    teValueSharePercent={teValueSharePercent}
                                    percentile={percentile}
                                    buildPercentage={buildPercentage}
                                    valueProportion={{
                                        qb: qbValueProportionPercent,
                                        wr: wrValueProportionPercent,
                                        rb: rbValueProportionPercent,
                                        te: teValueProportionPercent,
                                        pick: pickValueProportionPercent,
                                    }}
                                    startingQbAge={startingQbAge}
                                    startingRbAge={startingRbAge}
                                    startingWrAge={startingWrAge}
                                    startingTeAge={startingTeAge}
                                    rosterMakeup={makeup}
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
                            <div className={styles.teamSelectTitle}>
                                Sleeper?
                            </div>
                            <DomainDropdown
                                options={['Y', 'N']}
                                value={isSleeperLeague ? 'Y' : 'N'}
                                onChange={e => {
                                    setIsSleeperLeague(e.target.value === 'Y');
                                }}
                            />
                        </div>
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
                            options={[0, 0.5, 1.0, 1.5, 2]}
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
                                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                14, 15, 16, 17, 18, 19, 20,
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
                                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                14, 15, 16, 17, 18, 19, 20,
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
                    {(roster ||
                        !!rosterPlayers.length ||
                        !!apiRosterPlayers.length) && (
                        <div className={styles.rosterContainer}>
                            <div className={styles.positionContainer}>
                                <div
                                    className={`${styles.positionTitle} ${styles.qbTitle}`}
                                >
                                    QUARTERBACKS
                                </div>
                                <div className={styles.playersColumn}>
                                    {blueprintId
                                        ? apiRosterPlayers
                                              .filter(
                                                  p => p && p.position === QB
                                              )
                                              .map((p, idx) => {
                                                  const fullName = p.playerName;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
                                                              {p.compositePositionRank.slice(
                                                                  2
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })
                                        : rosterPlayers
                                              .filter(
                                                  p => p && p.position === QB
                                              )
                                              .map((p, idx) => {
                                                  const fullName = `${p.first_name} ${p.last_name}`;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
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
                                    if (value !== undefined) {
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
                                    {blueprintId
                                        ? apiRosterPlayers
                                              .filter(
                                                  p => p && p.position === RB
                                              )
                                              .map((p, idx) => {
                                                  const fullName = p.playerName;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
                                                              {p.compositePositionRank.slice(
                                                                  2
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })
                                        : rosterPlayers
                                              .filter(
                                                  p => p && p.position === RB
                                              )
                                              .map((p, idx) => {
                                                  const fullName = `${p.first_name} ${p.last_name}`;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
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
                                    if (value !== undefined) {
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
                                    {blueprintId
                                        ? apiRosterPlayers
                                              .filter(
                                                  p => p && p.position === WR
                                              )
                                              .map((p, idx) => {
                                                  const fullName = p.playerName;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
                                                              {p.compositePositionRank.slice(
                                                                  2
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })
                                        : rosterPlayers
                                              .filter(
                                                  p => p && p.position === WR
                                              )
                                              .map((p, idx) => {
                                                  const fullName = `${p.first_name} ${p.last_name}`;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
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
                                    if (value !== undefined) {
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
                                    {blueprintId
                                        ? apiRosterPlayers
                                              .filter(
                                                  p => p && p.position === TE
                                              )
                                              .map((p, idx) => {
                                                  const fullName = p.playerName;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
                                                              {p.compositePositionRank.slice(
                                                                  2
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })
                                        : rosterPlayers
                                              .filter(
                                                  p => p && p.position === TE
                                              )
                                              .map((p, idx) => {
                                                  const fullName = `${p.first_name} ${p.last_name}`;
                                                  return (
                                                      <div
                                                          key={idx}
                                                          className={
                                                              styles.player
                                                          }
                                                      >
                                                          <div
                                                              className={getClassName(
                                                                  fullName
                                                              )}
                                                          >
                                                              {fullName}
                                                          </div>
                                                          <div
                                                              className={
                                                                  styles.adp
                                                              }
                                                          >
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
                                    if (value !== undefined) {
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
                                        if (value !== undefined) {
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
                                        if (value !== undefined) {
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
                                {premium && (
                                    <>
                                        <DomainTextField
                                            label={
                                                <div className={styles.labels}>
                                                    Percentile
                                                </div>
                                            }
                                            value={percentile}
                                            onChange={e => {
                                                setPercentile(
                                                    '' + e.target.value
                                                );
                                            }}
                                        />
                                        <DomainTextField
                                            label={
                                                <div className={styles.labels}>
                                                    Build Percentage
                                                </div>
                                            }
                                            value={buildPercentage}
                                            onChange={e => {
                                                setBuildPercentage(
                                                    '' + e.target.value
                                                );
                                            }}
                                        />
                                    </>
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
                                rerollMove={() => rerollMove(i)}
                                playerIdToAssetKey={playerIdToAssetKey}
                                leagueId={leagueId}
                                rosterId={
                                    getRosterIdFromUser(specifiedUser) + 1
                                }
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
                                    rerollMove={() => rerollMove(i)}
                                    playerIdToAssetKey={playerIdToAssetKey}
                                    leagueId={leagueId}
                                    rosterId={
                                        getRosterIdFromUser(specifiedUser) + 1
                                    }
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
                            apiRosterPlayers={apiRosterPlayers}
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
                    </div>
                </div>
            </div>
            <div className={styles.offScreen}>
                <div
                    className={'exportableClassPremium'}
                    style={{width: `${1900 * 16}px`, height: `${1043 * 16}px`}}
                >
                    <div className={styles.offScreenInner}>
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
                            apiRosterPlayers={apiRosterPlayers}
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
                            qbValueSharePercent={qbValueSharePercent}
                            rbValueSharePercent={rbValueSharePercent}
                            wrValueSharePercent={wrValueSharePercent}
                            teValueSharePercent={teValueSharePercent}
                            percentile={percentile}
                            buildPercentage={buildPercentage}
                            valueProportion={{
                                qb: qbValueProportionPercent,
                                wr: wrValueProportionPercent,
                                rb: rbValueProportionPercent,
                                te: teValueProportionPercent,
                                pick: pickValueProportionPercent,
                            }}
                            startingQbAge={startingQbAge}
                            startingRbAge={startingRbAge}
                            startingWrAge={startingWrAge}
                            startingTeAge={startingTeAge}
                            rosterMakeup={makeup}
                        />
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
    rerollMove: () => void;
    playerIdToAssetKey: Map<string, string>;
    leagueId: string;
    rosterId: number;
};

type TradeIdea = {
    inAssets: TradeAsset[];
    outAssets: TradeAsset[];
};

const fetchCustomDowntier = async ({
    leagueId,
    rosterId,
    outAssetKeys,
    inAssetKeys = [],
}: {
    leagueId: string;
    rosterId: number;
    outAssetKeys: string[];
    inAssetKeys?: string[];
}) => {
    const authToken = sessionStorage.getItem('authToken');
    const options = {
        method: 'POST',
        url: `${AZURE_API_URL}/TradeRulesAdmin/customize`,
        data: {
            leagueId,
            rosterId,
            gradeRunVersionNumber: 1,
            weekId: 19,
            moveType: 2,
            outAssetKeys,
            inAssetKeys,
            maxResults: 30,
        },
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    };
    const res = await axios.request(options);
    return res.data as TradeIdea[];
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
    rerollMove,
    playerIdToAssetKey,
    leagueId,
    rosterId,
}: SuggestedMoveProps) {
    const playerData = usePlayerData();
    const [optionsToTrade, setOptionsToTrade] = useState<string[]>([]);
    const [downtierPinnedReturnAssets, setDowntierPinnedReturnAssets] =
        useState(playerIdsToTarget.map(row => row.map(() => false)));
    const [loadingAllThree, setLoadingAllThree] = useState(false);
    const [loadingRow, setLoadingRow] = useState(-1);
    useEffect(() => {
        console.log(downtierPinnedReturnAssets);
    }, [downtierPinnedReturnAssets]);

    useEffect(() => {
        const nonIdPlayerOptions: string[] = [];
        for (let i = 1; i < 15; i++) {
            for (let j = 1; j < 5; j++) {
                nonIdPlayerOptions.push(
                    `Rookie Pick ${j}.${i < 10 ? `0${i}` : `${i}`}`
                );
            }
        }
        nonIdPlayerOptions.push('2026 1st');
        nonIdPlayerOptions.push('2027 1st');
        for (let i = 0; i < 4; i++) {
            nonIdPlayerOptions.push(`2026 Round ${i + 1}`);
            nonIdPlayerOptions.push(`2027 Round ${i + 1}`);
        }
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
        if (isRookiePickId(id)) {
            return rookiePickIdToString(id);
        }
        if (!playerData[id]) return id;
        return !Number.isNaN(+id)
            ? `${playerData[id].first_name} ${playerData[id].last_name}`
            : id;
    }

    async function newCustomDowntier(rowIdx: number) {
        const tradeIdeas = await fetchCustomDowntier({
            leagueId,
            rosterId,
            outAssetKeys: [playerIdToAssetKey.get(playerIdsToTrade[0])!],
            inAssetKeys: playerIdsToTarget[rowIdx]
                .filter((_, idx) => downtierPinnedReturnAssets[rowIdx][idx])
                .map(id => playerIdToAssetKey.get(id)!),
        });
        const ideas = tradeIdeas
            .filter(idea => !!idea)
            .filter(idea => {
                // Only keep ideas that are not already in the target.
                const inAssetStrings = idea.inAssets.map(assetToString);
                const targetRow = playerIdsToTarget[rowIdx];
                return !targetRow.every(target => inAssetStrings.includes(target));
            });
        shuffle(ideas);
        const newPlayerIdsToTarget = [...playerIdsToTarget];
        newPlayerIdsToTarget[rowIdx] = ideas[0].inAssets.map(assetToString);
        setPlayerIdsToTarget(newPlayerIdsToTarget);
    }

    async function newCustomDowntierAllThree() {
        const protectedRows: number[] = [];
        for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
            if (
                downtierPinnedReturnAssets[rowIdx][0] !==
                downtierPinnedReturnAssets[rowIdx][1]
            ) {
                protectedRows.push(rowIdx);
                newCustomDowntier(rowIdx);
            }
        }

        if (protectedRows.length === 3) return;

        const ideas = await fetchCustomDowntier({
            leagueId,
            rosterId,
            outAssetKeys: [playerIdToAssetKey.get(playerIdsToTrade[0])!],
        });
        shuffle(ideas);
        const newPlayerIdsToTarget = [...playerIdsToTarget];
        for (let i = 0; i < 3 && i < ideas.length; i++) {
            if (protectedRows.includes(i)) continue;
            newPlayerIdsToTarget[i] = ideas[i].inAssets.map(assetToString);
        }
        setPlayerIdsToTarget(newPlayerIdsToTarget);
    }

    return (
        playerData && (
            <div className={styles.toTradeContainer}>
                <div className={styles.moveTitleContainer}>
                    <div className={styles.moveTitle}>MOVE #{moveNumber}</div>
                    <IconButton
                        aria-label="reroll"
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                        }}
                        TouchRippleProps={{
                            style: {
                                color: 'white',
                            },
                        }}
                        onClick={rerollMove}
                    >
                        <Casino sx={{color: 'white'}} />
                    </IconButton>
                </div>
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
                        value={
                            playerIdsToTrade[0]
                                ? getDisplayValueFromId(playerIdsToTrade[0])
                                : ''
                        }
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            if (value) {
                                if ((value as string).includes(' Round ')) {
                                    const spl = (value as string).split(' ');
                                    const year = spl[0];
                                    const round = spl[2];
                                    setPlayerIdsToTrade([
                                        `RP-API-${year}-${round}`,
                                        playerIdsToTrade[1],
                                    ]);
                                    return;
                                }
                                for (const p of rosterPlayers) {
                                    if (!p) continue;
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
                    {move === Move.DOWNTIER && (
                        <Tooltip
                            title={`Find Downtiers for ${getDisplayValueFromId(
                                playerIdsToTrade[0]
                            )}`}
                        >
                            <IconButton
                                loading={loadingAllThree || loadingRow > -1}
                                sx={{
                                    '&:hover': {
                                        backgroundColor:
                                            'rgba(255, 255, 255, 0.2)',
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.4,
                                    },
                                }}
                                TouchRippleProps={{
                                    style: {
                                        color: 'white',
                                    },
                                }}
                                onClick={() => {
                                    setLoadingAllThree(true);
                                    newCustomDowntierAllThree().finally(() => {
                                        setLoadingAllThree(false);
                                    });
                                }}
                            >
                                <Casino sx={{color: 'white'}} />
                            </IconButton>
                        </Tooltip>
                    )}
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
                                        ? getDisplayValueFromId(
                                              playerIdsToTrade[1]
                                          )
                                        : ''
                                )}
                                onChange={e => {
                                    const {
                                        target: {value},
                                    } = e;
                                    if (!value) return;
                                    if ((value as string).includes(' Round ')) {
                                        const spl = (value as string).split(
                                            ' '
                                        );
                                        const year = spl[0];
                                        const round = spl[2];
                                        setPlayerIdsToTrade([
                                            playerIdsToTrade[0],
                                            `RP-API-${year}-${round}`,
                                        ]);
                                        return;
                                    }
                                    for (const p of rosterPlayers) {
                                        if (!p) continue;
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
                    {move === Move.DOWNTIER && (
                        <>
                            {[0, 1, 2].map(rowIdx => (
                                <div className={styles.downtierRow}>
                                    <PinButton
                                        pinCoords={[rowIdx, 0]}
                                        downtierPinnedReturnAssets={
                                            downtierPinnedReturnAssets
                                        }
                                        setDowntierPinnedReturnAssets={
                                            setDowntierPinnedReturnAssets
                                        }
                                    />
                                    <DomainAutocomplete
                                        selectedPlayer={
                                            playerIdsToTarget[rowIdx][0]
                                        }
                                        setSelectedPlayer={(player: string) => {
                                            const newPlayerIdsToTarget = [
                                                ...playerIdsToTarget,
                                            ];
                                            newPlayerIdsToTarget[rowIdx][0] =
                                                player;
                                            setPlayerIdsToTarget(
                                                newPlayerIdsToTarget
                                            );
                                        }}
                                    />
                                    <img
                                        src={sfIcon}
                                        className={styles.icons}
                                        style={{margin: '0', padding: '0'}}
                                    />
                                    <PinButton
                                        pinCoords={[rowIdx, 1]}
                                        downtierPinnedReturnAssets={
                                            downtierPinnedReturnAssets
                                        }
                                        setDowntierPinnedReturnAssets={
                                            setDowntierPinnedReturnAssets
                                        }
                                    />
                                    <DomainAutocomplete
                                        selectedPlayer={
                                            playerIdsToTarget[rowIdx][1]
                                        }
                                        setSelectedPlayer={(player: string) => {
                                            const newPlayerIdsToTarget = [
                                                ...playerIdsToTarget,
                                            ];
                                            newPlayerIdsToTarget[rowIdx][1] =
                                                player;
                                            setPlayerIdsToTarget(
                                                newPlayerIdsToTarget
                                            );
                                        }}
                                    />
                                    <IconButton
                                        loading={
                                            loadingRow === rowIdx ||
                                            loadingAllThree
                                        }
                                        sx={{
                                            '&:hover': {
                                                backgroundColor:
                                                    'rgba(255, 255, 255, 0.2)',
                                            },
                                            '&.Mui-disabled': {
                                                opacity: 0.4,
                                            },
                                        }}
                                        TouchRippleProps={{
                                            style: {
                                                color: 'white',
                                            },
                                        }}
                                        onClick={() => {
                                            setLoadingRow(rowIdx);
                                            newCustomDowntier(rowIdx).finally(
                                                () => setLoadingRow(-1)
                                            );
                                        }}
                                        disabled={
                                            downtierPinnedReturnAssets[
                                                rowIdx
                                            ][0] ===
                                            downtierPinnedReturnAssets[
                                                rowIdx
                                            ][1]
                                        }
                                    >
                                        <Casino sx={{color: 'white'}} />
                                    </IconButton>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        )
    );
}

type PinButtonProps = {
    downtierPinnedReturnAssets: boolean[][];
    setDowntierPinnedReturnAssets: (assets: boolean[][]) => void;
    pinCoords: number[];
};

function PinButton({
    downtierPinnedReturnAssets,
    setDowntierPinnedReturnAssets,
    pinCoords,
}: PinButtonProps) {
    return (
        <IconButton
            aria-label="pin"
            sx={{
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
            }}
            TouchRippleProps={{
                style: {
                    color: 'white',
                },
            }}
            onClick={() => {
                const newDowntierPinnedReturnAssets = [
                    ...downtierPinnedReturnAssets,
                ];
                newDowntierPinnedReturnAssets[pinCoords[0]][pinCoords[1]] =
                    !downtierPinnedReturnAssets[pinCoords[0]][pinCoords[1]];
                setDowntierPinnedReturnAssets(newDowntierPinnedReturnAssets);
                // if (!downtierPinnedReturnAssets.includes(playerId)) {
                //     setDowntierPinnedReturnAssets([
                //         ...downtierPinnedReturnAssets,
                //         playerId,
                //     ]);
                // } else {
                //     setDowntierPinnedReturnAssets(
                //         downtierPinnedReturnAssets.filter(
                //             asset => asset !== playerId
                //         )
                //     );
                // }

                // if (pinnedReturnAsset === playerId) {
                //     setPinnedReturnAsset('');
                //     return;
                // }
                // setPinnedReturnAsset(playerId);
            }}
        >
            {downtierPinnedReturnAssets[pinCoords[0]][pinCoords[1]] ? (
                <PushPin sx={{color: 'white'}} />
            ) : (
                <PushPinOutlined sx={{color: 'white'}} />
            )}
        </IconButton>
    );
}

export function getApiStartingLineup(
    leagueSettings: LeagueSettings,
    rosterPlayers: RosterPlayer[]
) {
    const {
        quarterbackSlots,
        runningBackSlots,
        wideReceiverSlots,
        tightEndSlots,
        isSuperFlex,
    } = leagueSettings;
    const {flexSlots} = leagueSettings;
    const remainingPlayers = new Set(rosterPlayers.map(p => p.playerId)); // maybe map?
    const startingQbs = rosterPlayers
        .filter(p => p.rosterPosition === QB && p.isStarter)
        .slice(0, quarterbackSlots);
    startingQbs.forEach(p => remainingPlayers.delete(p.playerId));

    const startingRbs = rosterPlayers
        .filter(p => p.position === RB && p.isStarter)
        .slice(0, runningBackSlots);
    startingRbs.forEach(p => remainingPlayers.delete(p.playerId));

    const startingWrs = rosterPlayers
        .filter(p => p.position === WR && p.isStarter)
        .slice(0, wideReceiverSlots);
    startingWrs.forEach(p => remainingPlayers.delete(p.playerId));

    const startingTes = rosterPlayers
        .filter(p => p.position === TE && p.isStarter)
        .slice(0, tightEndSlots);
    startingTes.forEach(p => remainingPlayers.delete(p.playerId));

    const startingFlexes = rosterPlayers
        .filter(
            p =>
                FLEX_SET.has(p.position) &&
                remainingPlayers.has(p.playerId) &&
                p.isStarter
        )
        .slice(0, flexSlots);
    startingFlexes.forEach(p => remainingPlayers.delete(p.playerId));

    let startingSuperFlex: RosterPlayer[] = [];
    if (isSuperFlex) {
        startingSuperFlex = rosterPlayers
            .filter(
                p =>
                    SUPER_FLEX_SET.has(p.position) &&
                    remainingPlayers.has(p.playerId) &&
                    p.isStarter
            )
            .slice(0, 1);
        startingSuperFlex.forEach(p => remainingPlayers.delete(p.playerId));
    }

    return [
        ...startingQbs.map(p => {
            return {
                player: p,
                position: QB,
            };
        }),
        ...startingRbs.map(p => {
            return {
                player: p,
                position: RB,
            };
        }),
        ...startingWrs.map(p => {
            return {
                player: p,
                position: WR,
            };
        }),
        ...startingTes.map(p => {
            return {
                player: p,
                position: TE,
            };
        }),
        ...startingFlexes.map(p => {
            return {
                player: p,
                position: FLEX,
            };
        }),
        ...startingSuperFlex.map(p => {
            return {
                player: p,
                position: SUPER_FLEX,
            };
        }),
    ];
}

function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
