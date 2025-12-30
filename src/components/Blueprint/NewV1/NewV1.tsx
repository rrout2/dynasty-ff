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
                production={true}
                style={{left: '565px', top: '125px'}}
            />
            <ProductionValueShare
                share={valueShare}
                leagueRank={valueShareRank}
                production={false}
                style={{left: '565px', top: '215px'}}
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
                        .filter(p => p && p.position === pos)
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
    production,
    style,
    live = false,
}: {
    share: string;
    leagueRank: number;
    production: boolean;
    style?: CSSProperties;
    live?: boolean;
}) {
    return (
        <div className={styles.productionValueShare} style={style}>
            <div className={styles.productionValueShareNumber}>
                {production ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="19"
                        viewBox="0 0 79 79"
                        fill="none"
                    >
                        <path
                            d="M56.1015 39.4956C56.1015 30.4356 48.7517 23.0921 39.6865 23.0921C30.6202 23.0921 23.2715 30.4356 23.2715 39.4956C23.2715 48.5555 30.6202 55.899 39.6865 55.899C48.7517 55.899 56.1015 48.5555 56.1015 39.4956ZM35.7856 0.184563C37.4336 -0.0515137 41.6449 -0.051506 43.3249 0.129829C45.1943 0.331688 47.0341 1.87932 47.591 3.65732C48.5406 6.68755 46.7773 9.92878 49.8039 12.1071C56.1997 16.7112 58.1524 4.00516 65.0663 9.36196C66.2943 10.3131 70.5729 14.6412 71.0169 15.922C73.1522 22.0805 63.7001 22.9632 66.9414 29.0157C69.564 33.9107 76.7518 28.8105 78.571 34.6166C79.153 36.471 79.1656 42.885 78.4683 44.6813C76.2428 50.4099 68.764 44.8866 66.6001 50.6597C64.4591 56.3711 73.0324 56.9836 70.9769 63.0292C70.5261 64.3533 66.1082 68.9255 64.8654 69.839C63.6636 70.7217 62.2564 71.0411 60.7796 70.8472C56.9518 70.342 55.2718 63.5094 50.055 66.7244C46.1461 69.133 48.8361 73.4965 47.1619 76.3397C46.3927 77.6455 44.8382 78.6971 43.3249 78.8613C41.6917 79.0392 37.3458 79.0597 35.7502 78.8419C34.3602 78.6537 32.703 77.3924 32.105 76.1287C30.5746 72.8978 33.1607 67.7428 28.2886 66.2066C23.5728 64.7183 22.7294 69.685 19.3056 70.6465C17.5708 71.1346 16.029 70.8996 14.6046 69.8344C13.6117 69.0897 8.81038 64.2119 8.44745 63.2756C6.09528 57.2105 15.8441 55.7131 12.4887 50.0119C10.4207 46.4992 7.0026 48.2293 3.81615 47.4013C1.98326 46.9246 0.338674 44.9744 0.134385 43.0846C-0.0447952 41.4344 -0.0447952 37.5568 0.134385 35.9065C0.291882 34.4581 1.22088 33.0428 2.40553 32.2307C5.20394 30.3125 10.2587 33.0986 12.4876 28.9793C15.2358 23.8984 8.9131 22.3531 8.23061 18.7971C7.96926 17.4365 8.13589 15.9391 8.95875 14.7906C9.7371 13.706 14.6948 8.9263 15.7893 8.49634C22.1793 5.98616 23.3628 16.0862 29.4116 12.2667C32.8206 10.1147 30.8485 6.675 31.8357 3.61854C32.3789 1.93633 34.0018 0.440033 35.7856 0.184563Z"
                            fill="white"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="19"
                        height="25"
                        viewBox="0 0 74 90"
                        fill="none"
                    >
                        <path
                            d="M73.0723 88.4972L72.457 89.132H0.615234L0 88.4972V53.7706L0.615234 53.1339H14.3682V83.2023H19.7041V66.4757L20.3203 65.839H33.6621V83.2023H39.4102V40.006H53.3682V83.2023H59.1143V27.3019H73.0723V88.4972ZM63.0752 0.717896C70.3896 -2.74744 76.5916 7.17283 70.7715 12.5499C67.9778 15.1305 64.7604 14.6503 61.7295 13.0695C61.4145 12.9048 61.0386 12.9314 60.7402 13.1261L53.9756 17.5538C53.7095 17.7278 53.5277 18.0199 53.501 18.3458C53.4298 19.239 53.5708 20.8026 53.4395 21.6271C52.9904 24.4547 49.9116 27.266 47.1826 27.4376C45.9056 27.5186 44.6661 26.4667 43.5371 27.42L33.3643 40.9288C33.1371 41.2304 33.072 41.6354 33.209 41.9904C38.1039 54.6874 19.3497 57.5546 20.4531 44.4435C20.4921 43.9912 20.2563 43.557 19.8555 43.3761C17.5708 42.3518 13.4026 38.2275 12.0215 38.6417C11.0973 38.9189 10.4556 39.9167 8.94238 40.129C2.3917 41.0511 -1.67894 33.4806 2.5 28.3331C6.68787 23.1742 14.1795 26.308 14.8008 32.7452C14.882 33.5837 14.039 34.2007 14.8428 35.3234C15.2136 35.8418 22.2256 40.2254 22.7812 40.1779C23.4672 40.1171 24.4881 39.115 25.6982 38.9318C27.0376 38.7288 28.437 39.0357 29.7842 38.8781C30.0726 38.8444 30.3362 38.6918 30.5088 38.4493L40.46 24.4435C40.6802 24.1327 40.7265 23.7202 40.5674 23.3712C37.277 16.1209 44.5294 10.361 51.0322 14.2257C51.3551 14.4182 51.7552 14.4027 52.0703 14.1974L58.5303 9.97571C58.8075 9.79481 58.9833 9.48636 59.0078 9.14661C59.2405 5.7737 59.6891 2.322 63.0752 0.717896ZM27.2559 42.6906C23.1883 42.8483 23.1883 48.9324 27.2559 49.089C28.9517 49.089 30.3271 47.6563 30.3271 45.8898C30.3271 44.1234 28.9517 42.6906 27.2559 42.6906ZM7.80078 29.8458C3.72562 30.0026 3.72671 36.0963 7.80078 36.2531C9.49997 36.2531 10.876 34.8178 10.876 33.049C10.8759 31.279 9.49995 29.8458 7.80078 29.8458ZM46.6729 16.922C42.6088 17.0787 42.6099 23.1561 46.6729 23.3116C48.3676 23.3116 49.7402 21.8817 49.7402 20.1163C49.7402 18.3522 48.3675 16.922 46.6729 16.922ZM66.0469 4.04797C61.9637 4.20456 61.9648 10.3094 66.0469 10.4659C67.7482 10.4658 69.1279 9.02917 69.1279 7.25696C69.1279 5.48476 67.7482 4.04809 66.0469 4.04797Z"
                            fill="white"
                        />
                    </svg>
                )}

                {share}
            </div>
            <div
                className={styles.leagueRank}
                style={{marginRight: live ? 0 : '0px'}}
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
            <div
                className={styles.tradeType}
                style={{fontSize: trade.move === Move.DOWNTIER ? '30px' : ''}}
            >
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
    if (rookiePickId.substring(0, 3) === 'RP-') {
        return `${rookiePickId.substring(3)} Rookie Picks`;
    }
    return rookiePickId;
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
