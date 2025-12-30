import styles from './NewV1.module.css';
import {new1_0Background, nflSilhouette} from '../../../consts/images';
import {
    FullMove,
    Move,
    OutlookOption,
    RosterArchetype,
    ValueArchetype,
} from '../BlueprintModule/BlueprintModule';
import {CSSProperties} from 'react';
import {Player, User} from '../../../sleeper-api/sleeper-api';
import {NONE_PLAYER_ID} from '../v2/modules/CornerstonesModule/CornerstonesModule';
import {logoImage} from '../shared/Utilities';
import {useAdpData, usePlayerData} from '../../../hooks/hooks';
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
import {getDisplayName} from '../../Team/TeamPage/TeamPage';
import {isRookiePickId} from '../v1/modules/playerstotarget/PlayersToTargetModule';

type NewV1Props = {
    teamName: string;
    numTeams: number;
    isSuperFlex: boolean;
    ppr: number;
    tep: number;
    valueArchetype: ValueArchetype;
    rosterArchetype: RosterArchetype;
    qbGrade: number;
    rbGrade: number;
    wrGrade: number;
    teGrade: number;
    benchGrade: number;
    overallGrade: number;
    draftCapitalScore: number;
    twoYearOutlook: OutlookOption[];
    rosterPlayers: Player[];
    getStartingPosition: (playerName: string) => string | undefined;
    productionShare: string;
    valueShare: string;
    productionShareRank: number;
    valueShareRank: number;
    draftCapitalNotes: Map<number, string>;
    tradePartners: (User | undefined)[];
    topPriorities: string[];
    tradeStrategy: FullMove[];
};

function getFontSize(teamName: string) {
    if (teamName.length >= 24) return '35px';
    if (teamName.length >= 20) return '40px';
    return '50px';
}

export default function NewV1({
    teamName,
    numTeams,
    isSuperFlex,
    ppr,
    tep,
    valueArchetype,
    rosterArchetype,
    qbGrade,
    rbGrade,
    wrGrade,
    teGrade,
    benchGrade,
    overallGrade,
    draftCapitalScore,
    twoYearOutlook,
    rosterPlayers,
    getStartingPosition,
    productionShare,
    valueShare,
    productionShareRank,
    valueShareRank,
    draftCapitalNotes,
    tradePartners,
    topPriorities,
    tradeStrategy,
}: NewV1Props) {
    return (
        <div className={`exportableClassV1 ${styles.fullBlueprint}`}>
            <div
                className={styles.teamName}
                style={{fontSize: getFontSize(teamName)}}
            >
                {teamName}
            </div>
            <NumTeams
                numTeams={numTeams}
                style={{right: '204px', top: '28px'}}
            />
            <IsSuperFlex
                isSuperFlex={isSuperFlex}
                style={{right: '145px', top: '28px'}}
            />
            <Ppr ppr={ppr} style={{right: '86px', top: '28px'}} />
            <Tep tep={tep} style={{right: '27px', top: '28px'}} />
            <ValueArchetypeComponent
                valueArchetype={valueArchetype}
                style={{left: '70px', top: '130px'}}
            />
            <RosterArchetypeComponent
                rosterArchetype={rosterArchetype}
                style={{left: '315px', top: '130px'}}
            />
            <ProductionValueShare
                share={productionShare}
                leagueRank={productionShareRank}
                style={{left: '640px', top: '125px'}}
            />
            <ProductionValueShare
                share={valueShare}
                leagueRank={valueShareRank}
                style={{left: '645px', top: '215px'}}
            />
            <TwoYearOutlook
                twoYearOutlook={twoYearOutlook}
                style={{right: '10px', top: '349px'}}
            />
            <OverallGrade
                overallGrade={overallGrade}
                style={{right: '40px', top: '422px'}}
            />
            <RosterGrades
                qbGrade={qbGrade}
                rbGrade={rbGrade}
                wrGrade={wrGrade}
                teGrade={teGrade}
                style={{left: '148px', top: '187px'}}
            />
            <PositionalGradeDisc
                grade={qbGrade}
                color={'#DB2335'}
                style={{left: '65px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={rbGrade}
                color={'#00B1FF'}
                style={{left: '138px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={wrGrade}
                color={'#1AE069'}
                style={{left: '210px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={teGrade}
                color={'#FFBC00'}
                style={{left: '282px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={benchGrade}
                color={'#CD00FF'}
                style={{left: '354px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={draftCapitalScore}
                color={'#FF4200'}
                style={{left: '426px', top: '430px'}}
            />
            <Roster
                rosterPlayers={rosterPlayers}
                getStartingPosition={getStartingPosition}
                style={{left: '62px', top: '207px'}}
            />
            <DraftCapitalNotes
                labelColor="#CD00FF"
                year={2026}
                notes={draftCapitalNotes.get(2026) || ''}
                style={{left: '70px', top: '580px'}}
            />
            <DraftCapitalNotes
                labelColor="#F05A28"
                year={2027}
                notes={draftCapitalNotes.get(2027) || ''}
                style={{left: '70px', top: '620px'}}
            />
            <TopPriorities
                topPriorities={topPriorities}
                style={{left: '130px', top: '745px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[0]}
                style={{left: '300px', top: '558px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[1]}
                style={{left: '300px', top: '695px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[2]}
                style={{left: '300px', top: '832px'}}
            />
            <TradePartners
                tradePartners={tradePartners}
                style={{right: '20px', bottom: '35px'}}
            />
            <img src={new1_0Background} className={styles.backgroundImg} />
        </div>
    );
}

export function Roster({
    rosterPlayers,
    getStartingPosition,
    style,
}: {
    rosterPlayers: Player[];
    getStartingPosition: (playerName: string) => string | undefined;
    style?: CSSProperties;
}) {
    const positionDisplayLimit = 9;
    return (
        <div className={styles.roster} style={style}>
            {[QB, RB, WR, TE].map(pos => (
                <div className={styles.playersColumn}>
                    {rosterPlayers
                        .filter(p => p.position === pos)
                        .slice(0, positionDisplayLimit)
                        .map((p, idx) => (
                            <PlayerCard
                                key={idx}
                                player={p}
                                getStartingPosition={getStartingPosition}
                            />
                        ))}
                </div>
            ))}
        </div>
    );
}

export function PlayerCard({
    player,
    getStartingPosition,
}: {
    player: Player;
    getStartingPosition: (playerName: string) => string | undefined;
}) {
    const {getPositionalAdp} = useAdpData();
    const posAdp = getPositionalAdp(`${player.first_name} ${player.last_name}`);
    function getColorFromAdp(adp: number) {
        if (adp <= 20) return '#1AFF00';
        if (adp <= 35) return '#F1BA4C';
        return '#E31837';
    }

    function getBorderColor(player: Player) {
        const pos = getStartingPosition(
            `${player.first_name} ${player.last_name}`
        );
        if (pos) {
            switch (player.position) {
                case 'QB':
                    return 'rgba(232, 77, 87, 1)';
                case 'RB':
                    return 'rgba(40, 171, 226, 1)';
                case 'WR':
                    return 'rgba(26, 224, 105, 1)';
                case 'TE':
                    return 'rgba(250, 191, 74, 1)';
            }
        }
        return 'none';
    }

    function getCardStyle(player: Player): CSSProperties {
        const pos = getStartingPosition(
            `${player.first_name} ${player.last_name}`
        );
        if (!pos) return {};
        switch (pos) {
            case QB:
                return {
                    outline: '1px solid rgba(232, 77, 87, 1)',
                    backgroundColor: 'rgba(232, 77, 87, 0.22)',
                };
            case RB:
                return {
                    outline: '1px solid rgba(40, 171, 226, 1)',
                    backgroundColor: 'rgba(40, 171, 226, 0.22)',
                };
            case WR:
                return {
                    outline: '1px solid rgba(26, 224, 105, 1)',
                    backgroundColor: 'rgba(26, 224, 105, 0.22)',
                };
            case TE:
                return {
                    outline: '1px solid rgba(250, 191, 74, 1)',
                    backgroundColor: 'rgba(250, 191, 74, 0.22)',
                };
            case SUPER_FLEX:
                return {
                    outline: `1px solid ${getBorderColor(player)}`,
                    background:
                        'linear-gradient(90deg, rgba(219, 35, 53, 0.20) 1.44%, rgba(40, 171, 226, 0.20) 36.67%, rgba(26, 224, 105, 0.20) 69.86%, rgba(255, 170, 0, 0.20) 100%)',
                };
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return {
                    outline: `1px solid ${getBorderColor(player)}`,
                    background:
                        'linear-gradient(90deg, rgba(40, 171, 226, 0.20) 0%, rgba(26, 224, 105, 0.20) 48.79%, rgba(255, 170, 0, 0.20) 100%)',
                };
            default:
                return {};
        }
    }
    return (
        <div className={styles.playerCard} style={getCardStyle(player)}>
            <div className={styles.playerInfo}>
                {logoImage(player.team, styles.teamLogo)}
                <img
                    src={
                        player.player_id === NONE_PLAYER_ID
                            ? nflSilhouette
                            : `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`
                    }
                    onError={({currentTarget}) => {
                        currentTarget.onerror = null;
                        currentTarget.src =
                            'https://sleepercdn.com/images/v2/icons/player_default.webp';
                    }}
                    className={styles.headshot}
                />
                <div className={styles.playerName}>
                    {player.first_name} {player.last_name}
                </div>
            </div>
            <div style={{color: getColorFromAdp(posAdp), paddingTop: '3px'}}>
                {posAdp === Infinity ? '-' : posAdp}
            </div>
        </div>
    );
}

export function ProductionValueShare({
    share,
    leagueRank,
    style,
    live = false,
}: {
    share: string;
    leagueRank: number;
    style?: CSSProperties;
    live?: boolean;
}) {
    return (
        <div className={styles.productionValueShare} style={style}>
            <div className={styles.productionValueShareNumber}>{share}</div>
            <div
                className={styles.leagueRank}
                style={{marginRight: live ? 0 : '30px'}}
            >
                LEAGUE RANK: #{leagueRank}
            </div>
        </div>
    );
}

export function TwoYearOutlook({
    twoYearOutlook,
    style,
}: {
    twoYearOutlook: OutlookOption[];
    style?: CSSProperties;
}) {
    function getBackgroundColor(outlook: OutlookOption) {
        switch (outlook) {
            case OutlookOption.Contend:
                return 'rgba(26, 224, 105, 0.5)';
            case OutlookOption.Rebuild:
                return 'rgba(232, 77, 87, 0.5)';
            case OutlookOption.Reload:
                return 'rgba(250, 191, 74, 0.5)';
        }
    }
    function getBorderColor(outlook: OutlookOption) {
        switch (outlook) {
            case OutlookOption.Contend:
                return 'rgba(26, 224, 105, 1)';
            case OutlookOption.Rebuild:
                return 'rgba(232, 77, 87,1)';
            case OutlookOption.Reload:
                return 'rgba(250, 191, 74, 1)';
        }
    }
    return (
        <div className={styles.twoYearOutlook} style={style}>
            <div
                className={styles.outlookCard}
                style={{
                    backgroundColor: getBackgroundColor(twoYearOutlook[0]),
                    borderColor: getBorderColor(twoYearOutlook[0]),
                }}
            >
                {twoYearOutlook[0]}
            </div>
            <div
                className={styles.outlookCard}
                style={{
                    backgroundColor: getBackgroundColor(twoYearOutlook[1]),
                    borderColor: getBorderColor(twoYearOutlook[1]),
                }}
            >
                {twoYearOutlook[1]}
            </div>
        </div>
    );
}

export function OverallGrade({
    overallGrade,
    style,
}: {
    overallGrade: number;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.overallGrade} style={style}>
            {overallGrade}
        </div>
    );
}

export function NumTeams({
    numTeams,
    style,
}: {
    numTeams: number;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.numTeams} style={style}>
            {numTeams}
        </div>
    );
}

export function IsSuperFlex({
    isSuperFlex,
    style,
}: {
    isSuperFlex: boolean;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.isSuperFlex} style={style}>
            {isSuperFlex ? 'Y' : 'N'}
        </div>
    );
}
export function Ppr({ppr, style}: {ppr: number; style?: CSSProperties}) {
    return (
        <div className={styles.ppr} style={style}>
            {ppr}
        </div>
    );
}

export function Tep({tep, style}: {tep: number; style?: CSSProperties}) {
    return (
        <div className={styles.tep} style={style}>
            {tep}
        </div>
    );
}

export function RosterArchetypeComponent({
    rosterArchetype,
    style,
}: {
    rosterArchetype: RosterArchetype;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.rosterArchetype} style={style}>
            {rosterArchetype}
        </div>
    );
}

export function ValueArchetypeComponent({
    valueArchetype,
    style,
}: {
    valueArchetype: ValueArchetype;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.valueArchetype} style={style}>
            {valueArchetype}
        </div>
    );
}

export function RosterGrades({
    qbGrade,
    rbGrade,
    wrGrade,
    teGrade,
    style,
}: {
    qbGrade: number;
    rbGrade: number;
    wrGrade: number;
    teGrade: number;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.rosterGrades} style={style}>
            <div className={styles.rosterGrade}>{qbGrade}</div>
            <div className={styles.rosterGrade}>{rbGrade}</div>
            <div className={styles.rosterGrade}>{wrGrade}</div>
            <div className={styles.rosterGrade}>{teGrade}</div>
        </div>
    );
}

export function PositionalGradeDisc({
    grade,
    color,
    style,
}: {
    grade: number;
    color: string;
    style?: CSSProperties;
}) {
    return (
        <div style={style} className={styles.positionalGradeDisc}>
            <div className={styles.positionalGradeDiscInner}>
                <div className={styles.pie}>
                    <PieSlice
                        percentage={grade * 10}
                        fill={color}
                        radius={28}
                    />
                </div>
                <div className={styles.pieGrade}>{grade}</div>
            </div>
        </div>
    );
}

type PieSliceProps = {
    percentage: number; // 0–100
    radius: number; // circle radius
    fill: string; // slice color
};
export function PieSlice({percentage, radius, fill}: PieSliceProps) {
    const normalizedPercent = Math.min(Math.max(percentage, 0), 100);
    const angle = (normalizedPercent / 100) * 360;

    const center = radius;
    const r = radius;

    // Convert angle to SVG arc coordinates
    const rad = (angle - 90) * (Math.PI / 180);
    const x = center + r * Math.cos(rad);
    const y = center + r * Math.sin(rad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = `
        M ${center} ${center}
        L ${center} ${center - r}
        A ${r} ${r} 0 ${largeArcFlag} 1 ${x} ${y}
        Z
    `;

    return (
        <svg width={radius * 2} height={radius * 2}>
            {/* Circle for 100% */}
            {percentage === 100 && (
                <circle cx={center} cy={center} r={r} fill={fill} />
            )}

            {/* Pie slice */}
            <path d={pathData} fill={fill} stroke="none" />
        </svg>
    );
}

export function DraftCapitalNotes({
    year,
    notes,
    style,
    labelColor,
}: {
    year: number;
    notes: string;
    labelColor: string;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.draftCapital} style={style}>
            <div
                className={styles.draftCapitalYear}
                style={{color: labelColor}}
            >
                {year}
            </div>
            <div className={styles.draftCapitalNotes}>{notes}</div>
        </div>
    );
}

export function TopPriorities({
    topPriorities,
    style,
}: {
    topPriorities: string[];
    style?: CSSProperties;
}) {
    return (
        <div className={styles.topPriorities} style={style}>
            {topPriorities.map((tp, idx) => (
                <div key={idx} className={styles.topPriority}>
                    {tp}
                </div>
            ))}
        </div>
    );
}

export function TradeStrategyItem({
    trade,
    style,
}: {
    trade: FullMove;
    style?: CSSProperties;
}) {
    function getLabelFromMove(move: Move) {
        switch (move) {
            case Move.DOWNTIER:
                return 'DOWNTIER';
            case Move.UPTIER:
                return 'UPTIER';
            case Move.PIVOT:
                return 'PIVOT';
        }
    }
    return (
        <div className={styles.tradeStrategyItem} style={style}>
            <div className={styles.tradeType} style={{fontSize: trade.move === Move.DOWNTIER ? '30px' : ''}}>
                {getLabelFromMove(trade.move)}
            </div>
            <TradePlayerCard playerId={trade.playerIdsToTrade[0]} />
            {trade.move === Move.UPTIER && (
                <>
                    <TradePlus />
                    <TradePlayerCard playerId={trade.playerIdsToTrade[1]} />
                </>
            )}
            <TradeArrow />
            {trade.move === Move.UPTIER && (
                <div className={styles.targetColumn}>
                    <div className={styles.orRow}>
                        <div className={styles.or}></div>
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[0][0]}
                        />
                    </div>
                    <DividerLine />
                    <div className={styles.orRow}>
                        <div className={styles.or}>OR</div>
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[1][0]}
                        />
                    </div>
                    <DividerLine />
                    <div className={styles.orRow}>
                        <div className={styles.or}>OR</div>
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[2][0]}
                        />
                    </div>
                </div>
            )}
            {trade.move === Move.PIVOT && (
                <>
                    <TradePlayerCard playerId={trade.playerIdsToTarget[0][0]} />
                    <div className={styles.or}>OR</div>
                    <TradePlayerCard playerId={trade.playerIdsToTarget[1][0]} />
                    <div className={styles.or}>OR</div>
                    <TradePlayerCard playerId={trade.playerIdsToTarget[2][0]} />
                </>
            )}
            {trade.move === Move.DOWNTIER && (
                <div className={styles.targetColumn}>
                    <div className={styles.orRow}>
                        <div className={styles.or}></div>
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[0][0]}
                        />
                        <TradePlus size={5} />
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[0][1]}
                        />
                    </div>
                    <DividerLine width={260} />
                    <div className={styles.orRow}>
                        <div className={styles.or}>OR</div>
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[1][0]}
                        />
                        <TradePlus size={5} />
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[1][1]}
                        />
                    </div>
                    <DividerLine width={260} />
                    <div className={styles.orRow}>
                        <div className={styles.or}>OR</div>
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[2][0]}
                        />
                        <TradePlus size={5} />
                        <TargetPlayerCard
                            playerId={trade.playerIdsToTarget[2][1]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function DividerLine({width = 120}: {width?: number}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height="2"
            viewBox="0 0 539 2"
            fill="none"
        >
            <path
                d="M0 0.666748H538.345"
                stroke="white"
                stroke-width="1.33333"
                stroke-miterlimit="10"
                stroke-dasharray="6.61 6.61"
            />
        </svg>
    );
}

function TradeArrow() {
    return (
        <div className={styles.tradeArrow}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14.75"
                height="13.25"
                viewBox="0 0 59 53"
                fill="none"
            >
                <path
                    d="M58.652 26.5546L27.796 -4.57764e-05V15.3773H0V36.576H27.796V52.8213L58.652 26.5546Z"
                    fill="#003049"
                />
            </svg>
        </div>
    );
}

function TradePlus({size = 11.35}: {size?: number}) {
    return (
        <div
            className={styles.tradeArrow}
            style={{width: `${size * 2.2}px`, height: `${size * 2.2}px`}}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 47 47"
                fill="none"
            >
                <path
                    d="M46.884 30.884H31.256V46.512H15.6267V30.884H0V15.6293H15.6267V-3.43323e-05H31.256V15.6293H46.884V30.884Z"
                    fill="#003049"
                />
            </svg>
        </div>
    );
}

function TradePlayerCard({playerId}: {playerId: string}) {
    const playerData = usePlayerData();
    if (!playerData) return null;
    const player = playerData[playerId];

    function getBackgroundColor(pos: string) {
        switch (pos) {
            case QB:
                return '#DB2335';
            case RB:
                return '#00B1FF';
            case WR:
                return '#00FF06';
            case TE:
                return '#FFBC00';
        }
        return 'none';
    }

    if (playerId && isRookiePickId(playerId)) {
        return (
            <div className={styles.targetRookieCard}>
                {rookiePickIdToString(playerId)}
            </div>
        );
    }

    if (playerId === '' || !player) {
        return null;
    }

    function getDisplayName() {
        const longName = `${player.first_name} ${player.last_name}`;

        const shortName = `${player.first_name[0]}. ${player.last_name}`;

        if (longName.length >= 13) {
            return shortName;
        }

        return longName;
    }

    return (
        <div className={styles.tradePlayerCard}>
            <img
                src={
                    playerId === NONE_PLAYER_ID
                        ? nflSilhouette
                        : `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`
                }
                onError={({currentTarget}) => {
                    currentTarget.onerror = null;
                    currentTarget.src =
                        'https://sleepercdn.com/images/v2/icons/player_default.webp';
                }}
                className={styles.largeHeadshot}
            />
            <div className={styles.tradeAwayPlayerName}>{getDisplayName()}</div>
            <div className={styles.tradeAwayInfo}>
                <div
                    className={styles.tradeAwayPosition}
                    style={{
                        backgroundColor: getBackgroundColor(player.position),
                    }}
                >
                    {player.position}
                </div>
                <div className={styles.tradeAwayTeam}>—</div>
                <div className={styles.tradeAwayTeam}>{player.team}</div>
            </div>
        </div>
    );
}

export function rookiePickIdToString(rookiePickId: string) {
    if (!isRookiePickId(rookiePickId)) {
        throw new Error(
            `Expected rookie pick ID to begin with 'RP-', instead got '${rookiePickId}'`
        );
    }
    if (rookiePickId.substring(3, 9) === 'FIRST-') {
        return `${rookiePickId.substring(9)} 1st Round`;
    }
    return `${rookiePickId.substring(3)} Rookie Picks`;
}

function TargetPlayerCard({playerId}: {playerId: string}) {
    const playerData = usePlayerData();
    if (!playerData) return null;
    const player = playerData[playerId];

    function getDisplayName() {
        const longName = `${player.first_name} ${player.last_name}`;

        const shortName = `${player.first_name[0]}. ${player.last_name}`;

        if (longName.length >= 13) {
            return shortName;
        }

        return longName;
    }

    function getBackgroundColor(pos: string) {
        switch (pos) {
            case QB:
                return '#DB2335';
            case RB:
                return '#00B1FF';
            case WR:
                return '#00FF06';
            case TE:
                return '#FFBC00';
        }
        return 'none';
    }

    if (isRookiePickId(playerId)) {
        return (
            <div className={styles.targetRookieCard}>
                {rookiePickIdToString(playerId)}
            </div>
        );
    }

    if (playerId === '' || !player) {
        return null;
    }

    return (
        <div className={styles.targetPlayerCard}>
            <img
                src={
                    playerId === NONE_PLAYER_ID
                        ? nflSilhouette
                        : `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`
                }
                onError={({currentTarget}) => {
                    currentTarget.onerror = null;
                    currentTarget.src =
                        'https://sleepercdn.com/images/v2/icons/player_default.webp';
                }}
                className={styles.mediumHeadshot}
            />
            <div className={styles.targetInfo}>
                <div className={styles.targetPlayerName}>
                    {getDisplayName()}
                </div>
                <div className={styles.targetPlayerInfo}>
                    <div
                        className={styles.targetPosition}
                        style={{
                            backgroundColor: getBackgroundColor(
                                player.position
                            ),
                        }}
                    >
                        {player.position}
                    </div>
                    <div className={styles.targetTeam}>—</div>
                    <div className={styles.targetTeam}>{player.team}</div>
                </div>
            </div>
        </div>
    );
}

export function TradePartners({
    tradePartners,
    style,
}: {
    tradePartners: (User | undefined)[];
    style?: CSSProperties;
}) {
    return (
        <div className={styles.tradePartners} style={style}>
            {tradePartners.map((tp, idx) => (
                <div key={idx} className={styles.tradePartner}>
                    {getDisplayName(tp)}
                </div>
            ))}
        </div>
    );
}
