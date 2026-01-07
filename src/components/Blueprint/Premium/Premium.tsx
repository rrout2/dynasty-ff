import styles from './Premium.module.css';
import {premiumAssets, premiumBkg} from '../../../consts/images';
import {Player, User} from '../../../sleeper-api/sleeper-api';
import {
    ValueArchetype,
    RosterArchetype,
    OutlookOption,
    FullMove,
    DraftStrategyLabel,
} from '../BlueprintModule/BlueprintModule';
import {
    DraftCapitalNotes,
    IsSuperFlex,
    NumTeams,
    OverallGrade,
    PositionalGradeDisc,
    Ppr,
    ProductionValueShare,
    Roster,
    RosterArchetypeComponent,
    RosterGrades,
    Tep,
    TopPriorities,
    TradePartners,
    TradeStrategyItem,
    TwoYearOutlook,
    ValueArchetypeComponent,
} from '../NewV1/NewV1';
import {CSSProperties, useEffect, useState} from 'react';
import {QB, RB, TE, WR} from '../../../consts/fantasy';
import {
    DomainTrueRank,
    PowerRank,
    ThreeFactorGrades,
    useAdpData,
} from '../../../hooks/hooks';
import {logoImage} from '../shared/Utilities';

function getFontSize(teamName: string) {
    if (teamName.length >= 24) return '32px';
    if (teamName.length >= 20) return '38px';
    return '50px';
}

function camelCaseToTitleCase(str: string) {
    const spaced = str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/JAG/g, 'JAG-');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function getArchetypeBackground(archetype: string) {
    switch (archetype.toLowerCase()) {
        case 'cornerstone':
            return 'linear-gradient(180deg, #CD00FF 0%, #7B0099 100%)';
        case 'foundational':
            return 'linear-gradient(180deg, #00B1FF 0%, #006A99 100%)';
        case 'productivevet':
            return 'linear-gradient(180deg, #1A5AFF 0%, #0E008D 99.98%)';
        case 'mainstay':
            return 'linear-gradient(180deg, #1AE069 0%, #0E7A39 100%)';
        case 'upsideshot':
            return 'linear-gradient(180deg, #007410 0%, #003A09 99.98%)';
        case 'shorttermleaguewinner':
            return 'linear-gradient(180deg, #EABA10 0%, #846909 100%)';
        case 'shorttermproduction':
            return 'linear-gradient(180deg, #EA9A19 0%, #FF4200 100%)';
        case 'serviceable':
            return 'linear-gradient(180deg, #DB2335 0%, #75131C 99.98%)';
        case 'jaginsurance':
            return 'linear-gradient(180deg, #736357 0%, #1E1209 100%)';
        case 'jagdevelopmental':
            return 'linear-gradient(180deg, #ACACAC 0%, #464646 99.98%)';
        case 'replaceable':
            return 'linear-gradient(180deg, #333 0%, #040C11 99.98%)';
    }
    return 'none';
}

type ValueProportion = {
    qb: number;
    rb: number;
    wr: number;
    te: number;
};

type PremiumProps = {
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
    draftStrategy: DraftStrategyLabel[];
    domainTrueRanks: DomainTrueRank[];
    threeFactorGrades: ThreeFactorGrades;
    leaguePowerRanks: PowerRank[];
    qbValueSharePercent: number;
    rbValueSharePercent: number;
    wrValueSharePercent: number;
    teValueSharePercent: number;
    percentile: string;
    buildPercentage: string;
    valueProportion: ValueProportion;
};

export default function Premium({
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
    draftStrategy,
    domainTrueRanks,
    threeFactorGrades,
    leaguePowerRanks,
    qbValueSharePercent,
    rbValueSharePercent,
    wrValueSharePercent,
    teValueSharePercent,
    percentile,
    buildPercentage,
    valueProportion,
}: PremiumProps) {
    const [startingQbAge, setStartingQbAge] = useState(0);
    const [startingRbAge, setStartingRbAge] = useState(0);
    const [startingWrAge, setStartingWrAge] = useState(0);
    const [startingTeAge, setStartingTeAge] = useState(0);
    useEffect(() => {
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
    }, [rosterPlayers, getStartingPosition]);

    return (
        <div className={`exportableClassPremium ${styles.fullBlueprint}`}>
            <img src={premiumAssets} className={styles.assets} />
            <img src={premiumBkg} className={styles.backgroundImg} />
            <div
                className={styles.teamName}
                style={{fontSize: getFontSize(teamName)}}
            >
                <div className={styles.teamNameText}>{teamName}</div>
            </div>
            <NumTeams
                numTeams={numTeams}
                style={{left: '504px', top: '32px'}}
            />
            <IsSuperFlex
                isSuperFlex={isSuperFlex}
                style={{left: '568px', top: '32px'}}
            />
            <Ppr ppr={ppr} style={{left: '632px', top: '32px'}} />
            <Tep tep={tep} style={{left: '696px', top: '32px'}} />
            <Age age={startingQbAge} style={{left: '1215px', top: '36px'}} />
            <Age age={startingRbAge} style={{left: '1285.5px', top: '36px'}} />
            <Age age={startingWrAge} style={{left: '1356px', top: '36px'}} />
            <Age age={startingTeAge} style={{left: '1426px', top: '36px'}} />
            <ValueArchetypeComponent
                valueArchetype={valueArchetype}
                style={{left: '90px', top: '140px', fontSize: '40px'}}
            />
            <RosterArchetypeComponent
                rosterArchetype={rosterArchetype}
                style={{left: '430px', top: '140px', fontSize: '40px'}}
            />
            <ProductionValueShare
                share={productionShare}
                leagueRank={productionShareRank}
                style={{
                    left: '765px',
                    top: '360px',
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left',
                    width: '152px',
                }}
                production={true}
            />
            <ProductionValueShare
                share={valueShare}
                leagueRank={valueShareRank}
                style={{
                    left: '765px',
                    top: '437px',
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left',
                    width: '152px',
                }}
                production={false}
            />
            <TwoYearOutlook
                twoYearOutlook={twoYearOutlook}
                style={{
                    left: '768px',
                    top: '102px',
                    transform: 'scale(1.25)',
                    transformOrigin: 'top left',
                }}
            />
            <OverallGrade
                overallGrade={overallGrade}
                style={{
                    left: '1116px',
                    top: '209px',
                    transform: 'scale(0.55)',
                    transformOrigin: 'top left',
                }}
            />
            <RosterGrades
                qbGrade={qbGrade}
                rbGrade={rbGrade}
                wrGrade={wrGrade}
                teGrade={teGrade}
                style={{
                    left: '198px',
                    top: '221px',
                    transform: 'scale(1.395)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={qbGrade}
                color={'#DB2335'}
                style={{
                    left: '772px',
                    top: '203px',
                    transform: 'scale(0.96)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={rbGrade}
                color={'#00B1FF'}
                style={{
                    left: '836px',
                    top: '203px',
                    transform: 'scale(0.96)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={wrGrade}
                color={'#1AE069'}
                style={{
                    left: '900px',
                    top: '203px',
                    transform: 'scale(0.96)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={teGrade}
                color={'#FFBC00'}
                style={{
                    left: '964px',
                    top: '203px',
                    transform: 'scale(0.96)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={benchGrade}
                color={'#CD00FF'}
                style={{
                    left: '1028px',
                    top: '203px',
                    transform: 'scale(0.96)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={draftCapitalScore}
                color={'#FF4200'}
                style={{
                    left: '166px',
                    top: '561px',
                    transform: 'scale(0.96)',
                    transformOrigin: 'top left',
                }}
            />
            <Roster
                rosterPlayers={rosterPlayers}
                getStartingPosition={getStartingPosition}
                style={{
                    left: '77px',
                    top: '249px',
                    transform: 'scale(1.395)',
                    transformOrigin: 'top left',
                }}
            />
            <DraftCapitalNotes
                labelColor="#CD00FF"
                year={2026}
                notes={draftCapitalNotes.get(2026) || ''}
                style={{left: '85px', top: '630px'}}
            />
            <DraftCapitalNotes
                labelColor="#F05A28"
                year={2027}
                notes={draftCapitalNotes.get(2027) || ''}
                style={{left: '85px', top: '670px'}}
            />
            <TopPriorities
                topPriorities={topPriorities}
                style={{
                    left: '130px',
                    top: '798px',
                    transform: 'scale(0.88)',
                    transformOrigin: 'top left',
                }}
            />
            <TradePartners
                tradePartners={tradePartners}
                style={{
                    right: '755px',
                    bottom: '477px',
                    transform: 'scale(0.95)',
                    transformOrigin: 'bottom right',
                    gap: '30px',
                }}
            />
            <TradeStrategyItem
                trade={tradeStrategy[0]}
                style={{left: '280px', top: '578px', width: '420px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[1]}
                style={{left: '280px', top: '725px', width: '420px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[2]}
                style={{left: '280px', top: '872px', width: '420px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[3]}
                style={{left: '700px', top: '578px', width: '420px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[4]}
                style={{left: '700px', top: '725px', width: '420px'}}
            />
            <TradeStrategyItem
                trade={tradeStrategy[5]}
                style={{left: '700px', top: '872px', width: '420px'}}
            />
            <DraftStrategyItem
                labelColor="#CD00FF"
                draftStrategyLabel={draftStrategy[0]}
                year={2026}
                outlook={twoYearOutlook[0]}
                draftCapitalNotes={draftCapitalNotes}
                style={{left: '1560px', top: '311px'}}
            />
            <DraftStrategyItem
                labelColor="rgb(240, 90, 40)"
                draftStrategyLabel={draftStrategy[1]}
                year={2027}
                outlook={twoYearOutlook[1]}
                draftCapitalNotes={draftCapitalNotes}
                style={{left: '1560px', top: '438px'}}
            />
            <TrueRanks
                domainTrueRanks={domainTrueRanks}
                style={{
                    left: '1163px',
                    top: '649px',
                }}
            />
            <ThreeFactorAnalysis
                threeFactorGrades={threeFactorGrades}
                style={{
                    top: '144px',
                    left: '1227px',
                }}
            />
            <RosterMakeUp
                domainTrueRanks={domainTrueRanks}
                style={{
                    top: '334px',
                    left: '1337px',
                }}
            />
            <LeaguePowerRanks
                leaguePowerRanks={leaguePowerRanks}
                teamName={teamName}
                style={{
                    top: '44px',
                    left: '1511px',
                }}
            />
            <div
                className={styles.posValueShare}
                style={{top: '284px', left: '775px'}}
            >
                {qbValueSharePercent}%
            </div>
            <div
                className={styles.posValueShare}
                style={{top: '284px', left: '841px'}}
            >
                {rbValueSharePercent}%
            </div>
            <div
                className={styles.posValueShare}
                style={{top: '284px', left: '906px'}}
            >
                {wrValueSharePercent}%
            </div>
            <div
                className={styles.posValueShare}
                style={{top: '284px', left: '970px'}}
            >
                {teValueSharePercent}%
            </div>
            <div
                className={styles.percentile}
                style={{top: '340px', left: '920px'}}
            >
                {percentile}
            </div>
            <div
                className={styles.percentile}
                style={{top: '422px', left: '920px'}}
            >
                {buildPercentage}
            </div>
            <ValueProportionChart
                valueProportion={valueProportion}
                style={{top: '320px', left: '1090px'}}
            />
        </div>
    );
}

function ValueProportionChart({
    valueProportion,
    style,
}: {
    valueProportion: ValueProportion;
    style?: CSSProperties;
}) {
    const data = [
        {label: 'QB', value: valueProportion.qb},
        {label: 'RB', value: valueProportion.rb},
        {label: 'WR', value: valueProportion.wr},
        {label: 'TE', value: valueProportion.te},
    ];

    // Calculate the angles for each slice
    let currentAngle = 0;
    const slices = data.map(item => {
        const angle = (item.value / 100) * 360;
        const startAngle = currentAngle;
        currentAngle += angle;
        return {...item, startAngle, angle};
    });

    // Function to create SVG path for pie slice
    const createSlicePath = (startAngle: number, angle: number) => {
        const radius = 150;
        const centerX = 150;
        const centerY = 150;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (startAngle + angle - 90) * (Math.PI / 180);

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    // Function to calculate label position
    const getLabelPosition = (startAngle: number, angle: number) => {
        const radius = 110;
        const centerX = 150;
        const centerY = 150;
        const midAngle = (startAngle + angle / 2 - 90) * (Math.PI / 180);

        return {
            x: centerX + radius * Math.cos(midAngle),
            y: centerY + radius * Math.sin(midAngle),
        };
    };

    return (
        <div className={styles.valueProportionChart} style={style}>
            <svg width="300" height="300" viewBox="0 0 400 400">
                <defs>
                    <linearGradient
                        id="gradient-rb"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop stop-color="#007DB4" />
                        <stop offset="1" stop-color="#00B1FF" />
                    </linearGradient>
                    <linearGradient
                        id="gradient-wr"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop stop-color="#00FF06" />
                        <stop offset="1" stop-color="#015C03" />
                    </linearGradient>
                    <linearGradient
                        id="gradient-qb"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop stop-color="#C4001E" />
                        <stop offset="1" stop-color="#E31837" />
                    </linearGradient>
                    <linearGradient
                        id="gradient-te"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                    >
                        <stop stop-color="#D57C00" />
                        <stop offset="0.533654" stop-color="#EABA10" />
                    </linearGradient>
                </defs>
                {/* Pie slices */}
                {slices.map((slice, index) => (
                    <path
                        key={index}
                        d={createSlicePath(slice.startAngle, slice.angle)}
                        fill={`url(#gradient-${slice.label.toLowerCase()})`}
                        stroke="#1e293b"
                        strokeWidth="3px"
                    />
                ))}

                {/* Labels */}
                {slices.map((slice, index) => {
                    const pos = getLabelPosition(slice.startAngle, slice.angle);
                    return (
                        <g key={`label-${index}`}>
                            <text
                                x={pos.x}
                                y={pos.y - 8}
                                textAnchor="middle"
                                fill="white"
                                fontSize="24"
                                style={{
                                    fontFamily: 'Prohibition',
                                }}
                            >
                                {slice.label}
                            </text>
                            <text
                                x={pos.x}
                                y={pos.y + 15}
                                textAnchor="middle"
                                fill="white"
                                fontSize="24"
                                fontFamily="Acumin Pro Condensed"
                            >
                                {slice.value}%
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function LeaguePowerRanks({
    leaguePowerRanks,
    teamName,
    style,
}: {
    leaguePowerRanks: PowerRank[];
    teamName: string;
    style?: CSSProperties;
}) {
    const col1 = leaguePowerRanks.slice(0, leaguePowerRanks.length / 2);
    const col2 = leaguePowerRanks.slice(
        leaguePowerRanks.length / 2,
        leaguePowerRanks.length
    );
    function getCellStyle(powerRank: PowerRank): CSSProperties {
        const base = {
            borderColor: isMatch(powerRank) ? '#00FF06' : '',
            color: powerRank.teamName === teamName ? '#00FF06' : '',
        };
        if (powerRank.overallRank === 1) {
            return {
                ...base,
                borderColor: '#FFAA00',
                color: '#FFAA00',
                backgroundColor: 'rgba(255, 170, 0, 0.10)',
            };
        }
        if (powerRank.overallRank === 2) {
            return {
                ...base,
                borderColor: '#D7D7D7',
                color: '#D7D7D7',
                backgroundColor: 'rgba(255, 170, 0, 0)',
            };
        }
        if (powerRank.overallRank === 3) {
            return {
                ...base,
                borderColor: '#C07C24',
                color: '#C07C24',
                backgroundColor: 'gba(194, 123, 30, 0.10)',
            };
        }
        return base;
    }
    function isMatch(powerRank: PowerRank) {
        return powerRank.teamName === teamName;
    }
    return (
        <div className={styles.leaguePowerRanks} style={style}>
            <div className={styles.trophyColumn}>
                <div className={styles.trophyWrapper}>
                    <GoldTrophy />
                </div>
                <div className={styles.trophyWrapper}>
                    <SilverTrophy />
                </div>
                <div className={styles.trophyWrapper}>
                    <BronzeTrophy />
                </div>
                {col1
                    .filter((_, idx) => idx > 2)
                    .map((_, idx) => (
                        <div key={idx} className={styles.trophyWrapper} />
                    ))}
            </div>
            <div className={styles.powerRankColumn}>
                {col1.map((powerRank, idx) => (
                    <div className={styles.powerRankRow}>
                        <div
                            key={idx}
                            className={styles.powerRankCard}
                            style={getCellStyle(powerRank)}
                        >
                            {powerRank.overallRank}. {powerRank.teamName}
                        </div>
                        {!!isMatch(powerRank) && <GreenArrow />}
                    </div>
                ))}
            </div>
            <div className={styles.powerRankColumn}>
                {col2.map((powerRank, idx) => (
                    <div className={styles.powerRankRow}>
                        <div
                            key={idx}
                            className={styles.powerRankCard}
                            style={getCellStyle(powerRank)}
                        >
                            {powerRank.overallRank}. {powerRank.teamName}
                        </div>
                        {!!isMatch(powerRank) && <GreenArrow />}
                    </div>
                ))}
            </div>
        </div>
    );
}

const GreenArrow = ({}: {}) => (
    <svg
        className={styles.greenArrow}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 55 64"
        fill="none"
    >
        <path
            d="M-1.59547e-06 31.61L54.75 5.8642e-05L54.75 63.2199L-1.59547e-06 31.61Z"
            fill="#00FF06"
        />
    </svg>
);

const GoldTrophy = ({}: {}) => (
    <svg
        className={styles.trophy}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 46 55"
        fill="none"
    >
        <path
            d="M10.1729 0.00866699L35.8857 0.0389404C38.0373 0.37549 38.4915 2.35585 38.5859 3.83484C38.8347 3.82568 39.0817 3.81861 39.2959 3.80945C41.2832 3.74079 42.2138 3.72274 42.792 3.83484C43.4163 3.95389 45.4481 4.56949 45.2822 7.54578C44.9735 13.3083 41.931 21.1818 35.9785 24.8427C35.6675 25.0327 35.2411 25.2294 34.7988 25.4218C34.5155 25.5454 34.2209 25.6578 34.0273 25.7928C34.0177 25.8392 33.6468 26.4771 33.4258 26.8593C33.0826 27.4499 32.7369 28.0314 32.4766 28.3749C31.1612 30.1102 29.5903 31.5229 27.8857 32.5028C27.7245 33.3795 27.6717 34.2245 27.7246 35.0692H33.041C34.2158 35.0692 35.7704 36.6148 35.7705 37.7802V42.9686H36.0615C37.6186 42.9688 38.7353 44.5754 38.915 45.6903C39.1039 46.8921 39.0486 49.8862 38.9473 50.9305C38.7077 53.3963 37.13 54.0054 36.4619 54.1542L36.248 54.203L8.86914 54.1639L8.50098 54.0126C7.6878 53.6783 6.68053 52.9341 6.48242 51.288C6.35574 50.1844 6.31897 46.8859 6.50781 45.6952C6.68058 44.5825 7.79584 42.9686 9.3623 42.9686H10.2881V37.7802C10.2882 36.5142 11.7395 35.0693 13.0156 35.0692H18.001C18.0447 34.307 18.0077 33.5402 17.8926 32.7391C15.1305 31.2693 13.3126 29.0067 12.0088 27.1385C11.866 26.9347 11.661 26.5614 11.4561 26.1678C11.3755 26.0145 11.2928 25.852 11.2168 25.7147C11.0717 25.6552 10.8665 25.5752 10.6592 25.4882C10.1547 25.2775 9.64743 25.0555 9.32031 24.8632C2.90972 21.0833 0.914325 13.1806 0.354492 9.95691L0.299805 9.65222C-0.00426521 8.00157 -0.211585 6.54314 0.364258 5.44421C0.412634 5.35721 1.26979 3.79382 2.68652 3.79382H6.74707C6.73325 3.35883 6.74051 2.90234 6.83496 2.46277C7.13461 1.04583 8.71484 -0.112535 10.1729 0.00866699Z"
            fill="url(#paint0_linear_12_17572)"
        />
        <defs>
            <linearGradient
                id="paint0_linear_12_17572"
                x1="0"
                y1="27.1014"
                x2="45.2919"
                y2="27.1014"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#FFAA00" />
                <stop offset="0.163462" stop-color="#FFE790" />
                <stop offset="0.394231" stop-color="#FFAA00" />
                <stop offset="0.567308" stop-color="#FFEBA4" />
                <stop offset="0.764423" stop-color="#C27B1E" />
                <stop offset="1" stop-color="#EABA10" />
            </linearGradient>
        </defs>
    </svg>
);

const SilverTrophy = ({}: {}) => (
    <svg
        className={styles.trophy}
        xmlns="http://www.w3.org/2000/svg"
        width="46"
        height="55"
        viewBox="0 0 46 55"
        fill="none"
    >
        <path
            d="M10.1729 0.00866699L35.8857 0.0389404C38.0373 0.37549 38.4915 2.35585 38.5859 3.83484C38.8347 3.82568 39.0817 3.81861 39.2959 3.80945C41.2832 3.74079 42.2138 3.72274 42.792 3.83484C43.4163 3.95389 45.4481 4.56949 45.2822 7.54578C44.9735 13.3083 41.931 21.1818 35.9785 24.8427C35.6675 25.0327 35.2411 25.2294 34.7988 25.4218C34.5155 25.5454 34.2209 25.6578 34.0273 25.7928C34.0177 25.8392 33.6468 26.4771 33.4258 26.8593C33.0826 27.4499 32.7369 28.0314 32.4766 28.3749C31.1612 30.1102 29.5903 31.5229 27.8857 32.5028C27.7245 33.3795 27.6717 34.2245 27.7246 35.0692H33.041C34.2158 35.0692 35.7704 36.6148 35.7705 37.7802V42.9686H36.0615C37.6186 42.9688 38.7353 44.5754 38.915 45.6903C39.1039 46.8921 39.0486 49.8862 38.9473 50.9305C38.7077 53.3963 37.13 54.0054 36.4619 54.1542L36.248 54.203L8.86914 54.1639L8.50098 54.0126C7.6878 53.6783 6.68053 52.9341 6.48242 51.288C6.35574 50.1844 6.31897 46.8859 6.50781 45.6952C6.68058 44.5825 7.79584 42.9686 9.3623 42.9686H10.2881V37.7802C10.2882 36.5142 11.7395 35.0693 13.0156 35.0692H18.001C18.0447 34.307 18.0077 33.5402 17.8926 32.7391C15.1305 31.2693 13.3126 29.0067 12.0088 27.1385C11.866 26.9347 11.661 26.5614 11.4561 26.1678C11.3755 26.0145 11.2928 25.852 11.2168 25.7147C11.0717 25.6552 10.8665 25.5752 10.6592 25.4882C10.1547 25.2775 9.64743 25.0555 9.32031 24.8632C2.90972 21.0833 0.914325 13.1806 0.354492 9.95691L0.299805 9.65222C-0.00426521 8.00157 -0.211585 6.54314 0.364258 5.44421C0.412634 5.35721 1.26979 3.79382 2.68652 3.79382H6.74707C6.73325 3.35883 6.74051 2.90234 6.83496 2.46277C7.13461 1.04583 8.71484 -0.112535 10.1729 0.00866699Z"
            fill="url(#paint0_linear_60_18626)"
        />
        <defs>
            <linearGradient
                id="paint0_linear_60_18626"
                x1="0"
                y1="27.1014"
                x2="45.2919"
                y2="27.1014"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#8A8A8A" />
                <stop offset="0.197115" stop-color="#FCFCFC" />
                <stop offset="0.360577" stop-color="#8A8A8A" />
                <stop offset="0.5625" stop-color="white" />
                <stop offset="0.817308" stop-color="#525252" />
                <stop offset="0.995192" stop-color="white" />
            </linearGradient>
        </defs>
    </svg>
);

const BronzeTrophy = ({}: {}) => (
    <svg
        className={styles.trophy}
        xmlns="http://www.w3.org/2000/svg"
        width="46"
        height="55"
        viewBox="0 0 46 55"
        fill="none"
    >
        <path
            d="M10.1729 0.00866699L35.8857 0.0389404C38.0373 0.37549 38.4915 2.35585 38.5859 3.83484C38.8347 3.82568 39.0817 3.81861 39.2959 3.80945C41.2832 3.74079 42.2138 3.72274 42.792 3.83484C43.4163 3.95389 45.4481 4.56949 45.2822 7.54578C44.9735 13.3083 41.931 21.1818 35.9785 24.8427C35.6675 25.0327 35.2411 25.2294 34.7988 25.4218C34.5155 25.5454 34.2209 25.6578 34.0273 25.7928C34.0177 25.8392 33.6468 26.4771 33.4258 26.8593C33.0826 27.4499 32.7369 28.0314 32.4766 28.3749C31.1612 30.1102 29.5903 31.5229 27.8857 32.5028C27.7245 33.3795 27.6717 34.2245 27.7246 35.0692H33.041C34.2158 35.0692 35.7704 36.6148 35.7705 37.7802V42.9686H36.0615C37.6186 42.9688 38.7353 44.5754 38.915 45.6903C39.1039 46.8921 39.0486 49.8862 38.9473 50.9305C38.7077 53.3963 37.13 54.0054 36.4619 54.1542L36.248 54.203L8.86914 54.1639L8.50098 54.0126C7.6878 53.6783 6.68053 52.9341 6.48242 51.288C6.35574 50.1844 6.31897 46.8859 6.50781 45.6952C6.68058 44.5825 7.79584 42.9686 9.3623 42.9686H10.2881V37.7802C10.2882 36.5142 11.7395 35.0693 13.0156 35.0692H18.001C18.0447 34.307 18.0077 33.5402 17.8926 32.7391C15.1305 31.2693 13.3126 29.0067 12.0088 27.1385C11.866 26.9347 11.661 26.5614 11.4561 26.1678C11.3755 26.0145 11.2928 25.852 11.2168 25.7147C11.0717 25.6552 10.8665 25.5752 10.6592 25.4882C10.1547 25.2775 9.64743 25.0555 9.32031 24.8632C2.90972 21.0833 0.914325 13.1806 0.354492 9.95691L0.299805 9.65222C-0.00426521 8.00157 -0.211585 6.54314 0.364258 5.44421C0.412634 5.35721 1.26979 3.79382 2.68652 3.79382H6.74707C6.73325 3.35883 6.74051 2.90234 6.83496 2.46277C7.13461 1.04583 8.71484 -0.112535 10.1729 0.00866699Z"
            fill="url(#paint0_linear_60_18628)"
        />
        <defs>
            <linearGradient
                id="paint0_linear_60_18628"
                x1="45.2919"
                y1="27.1014"
                x2="0"
                y2="27.1014"
                gradientUnits="userSpaceOnUse"
            >
                <stop stop-color="#C27B1E" />
                <stop offset="0.158654" stop-color="#FFE6C5" />
                <stop offset="0.375" stop-color="#C27B1E" />
                <stop offset="0.596154" stop-color="#FDC537" />
                <stop offset="0.802885" stop-color="#7B4D12" />
                <stop offset="0.995192" stop-color="#C27B1E" />
            </linearGradient>
        </defs>
    </svg>
);

function RosterMakeUp({
    domainTrueRanks,
    style,
}: {
    domainTrueRanks: DomainTrueRank[];
    style?: CSSProperties;
}) {
    const [makeup, setMakeup] = useState(new Map<string, number>());
    useEffect(() => {
        const makeup = new Map<string, number>();
        for (const dtr of domainTrueRanks) {
            const archetype = dtr.dynastyAssetCategory;
            const count = (makeup.get(archetype) || 0) + 1;
            makeup.set(archetype, count);
        }
        setMakeup(new Map(makeup));
    }, [domainTrueRanks]);

    function getFontColor(archetype: string) {
        switch (archetype.toLowerCase()) {
            case 'cornerstone':
            case 'foundational':
            case 'mainstay':
            case 'shorttermleaguewinner':
            case 'shorttermproduction':
                return '#07223F';
        }
        return 'white';
    }

    return (
        <div className={styles.rosterMakeup} style={style}>
            
            {Array.from(makeup)
                .sort((a, b) => b[1] - a[1])
                .map(([archetype, count]) => (
                    <div key={archetype} className={styles.archetypeRow}>
                        <div
                            className={styles.archetypeCard}
                            style={{
                                background: getArchetypeBackground(archetype),
                                color: getFontColor(archetype),
                                fontSize: '9.5px',
                                paddingTop: '4px',
                                width: '105px',
                            }}
                        >
                            {camelCaseToTitleCase(archetype)}
                        </div>
                        <div className={styles.archPercent}>
                            {((100 * count) / domainTrueRanks.length).toFixed(
                                1
                            )}
                            %
                        </div>
                    </div>
                ))}
        </div>
    );
}

function ThreeFactorAnalysis({
    threeFactorGrades,
    style,
}: {
    threeFactorGrades: ThreeFactorGrades;
    style?: CSSProperties;
}) {
    function getFontColor(score: number) {
        if (score >= 8) {
            return '#00FF06';
        }
        if (score >= 6) {
            return '#80CD82';
        }
        if (score >= 4) {
            return '#FFAA00';
        }
        return '#E31837';
    }
    const avgInsulationScore =
        (threeFactorGrades.qbInsulationScoreGrade +
            threeFactorGrades.rbInsulationScoreGrade +
            threeFactorGrades.wrInsulationScoreGrade +
            threeFactorGrades.teInsulationScoreGrade) /
        4;
    const avgProductionScore =
        (threeFactorGrades.qbProductionScoreGrade +
            threeFactorGrades.rbProductionScoreGrade +
            threeFactorGrades.wrProductionScoreGrade +
            threeFactorGrades.teProductionScoreGrade) /
        4;
    const avgSituationalScore =
        (threeFactorGrades.qbSituationalScoreGrade +
            threeFactorGrades.rbSituationalScoreGrade +
            threeFactorGrades.wrSituationalScoreGrade +
            threeFactorGrades.teSituationalScoreGrade) /
        4;
    return (
        <div className={styles.threeFactorAnalysis} style={style}>
            <div className={styles.threeFactorRow}>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        width: '77px',
                        color: getFontColor(
                            threeFactorGrades.qbInsulationScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.qbInsulationScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.qbProductionScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.qbProductionScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.qbSituationalScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.qbSituationalScoreGrade}
                </div>
            </div>
            <div className={styles.threeFactorRow}>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        width: '77px',
                        color: getFontColor(
                            threeFactorGrades.rbInsulationScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.rbInsulationScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.rbProductionScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.rbProductionScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.rbSituationalScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.rbSituationalScoreGrade}
                </div>
            </div>
            <div className={styles.threeFactorRow}>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        width: '77px',
                        color: getFontColor(
                            threeFactorGrades.wrInsulationScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.wrInsulationScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.wrProductionScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.wrProductionScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.wrSituationalScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.wrSituationalScoreGrade}
                </div>
            </div>
            <div className={styles.threeFactorRow}>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        width: '77px',
                        color: getFontColor(
                            threeFactorGrades.teInsulationScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.teInsulationScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.teProductionScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.teProductionScoreGrade}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        color: getFontColor(
                            threeFactorGrades.teSituationalScoreGrade
                        ),
                    }}
                >
                    {threeFactorGrades.teSituationalScoreGrade}
                </div>
            </div>
            <div className={styles.threeFactorRow} style={{paddingTop: '4px'}}>
                <div
                    className={styles.threeFactorCell}
                    style={{
                        width: '77px',
                        color: getFontColor(avgInsulationScore),
                    }}
                >
                    {avgInsulationScore.toFixed(1)}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{color: getFontColor(avgProductionScore)}}
                >
                    {avgProductionScore.toFixed(1)}
                </div>
                <div
                    className={styles.threeFactorCell}
                    style={{color: getFontColor(avgSituationalScore)}}
                >
                    {avgSituationalScore.toFixed(1)}
                </div>
            </div>
        </div>
    );
}

function TrueRanks({
    domainTrueRanks,
    style,
}: {
    domainTrueRanks: DomainTrueRank[];
    style?: CSSProperties;
}) {
    const {sortNamesByAdp} = useAdpData();
    const top20DomainTrueRanks = new Set(
        domainTrueRanks
            .sort((a, b) => sortNamesByAdp(a.playerName, b.playerName))
            .slice(0, 20)
    );
    return (
        <div className={styles.trueRanks} style={style}>
            {domainTrueRanks
                .filter(dtr => top20DomainTrueRanks.has(dtr))
                .map((dtr, idx) => (
                    <TrueRankRow key={idx} domainTrueRank={dtr} idx={idx} />
                ))}
        </div>
    );
}

function TrueRankRow({
    domainTrueRank,
    idx,
}: {
    domainTrueRank: DomainTrueRank;
    idx: number;
}) {
    return (
        <div className={styles.trueRankRow}>
            <div className={styles.playerName}>
                {idx + 1}. {domainTrueRank.playerName}
            </div>
            <PosTeamCard
                position={domainTrueRank.nflPosition}
                team={domainTrueRank.teamAbbreviation}
            />
            <Score score={domainTrueRank.insulationScore} />
            <Score score={domainTrueRank.productionScore} />
            <Score score={domainTrueRank.situationalScore} />
            <ArchetypeCard archetype={domainTrueRank.dynastyAssetCategory} />
            <div className={styles.compositePosRank}>
                {domainTrueRank.compositePosRank}
            </div>
        </div>
    );
}

function PosTeamCard({position, team}: {position: string; team: string}) {
    function getBackgroundColor() {
        switch (position) {
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
    function getFontColor() {
        switch (position) {
            case QB:
            case RB:
                return 'white';
            case WR:
            case TE:
                return 'black';
        }
        return 'none';
    }
    return (
        <div
            className={styles.posTeamCard}
            style={{backgroundColor: getBackgroundColor()}}
        >
            <div
                className={styles.posTeamCardPosition}
                style={{color: getFontColor()}}
            >
                {position}
            </div>
            {logoImage(team, styles.teamLogo)}
        </div>
    );
}

function Score({score}: {score: number}) {
    function getFontColor() {
        if (score > 80) {
            return '#00FF06';
        }
        if (score > 60) {
            return '#80CD82';
        }
        if (score > 40) {
            return '#FFAA00';
        }
        return '#E31837';
    }
    return (
        <div className={styles.score} style={{color: getFontColor()}}>
            {(score / 10).toFixed(1)}
        </div>
    );
}

function ArchetypeCard({archetype}: {archetype: string}) {
    function getBackground() {
        return getArchetypeBackground(archetype);
    }

    function getFontColor() {
        switch (archetype.toLowerCase()) {
            case 'cornerstone':
            case 'foundational':
            case 'mainstay':
            case 'shorttermleaguewinner':
            case 'shorttermproduction':
                return '#07223F';
        }
        return 'white';
    }

    function isLong() {
        return camelCaseToTitleCase(archetype).length > 18;
    }

    return (
        <div
            className={styles.archetypeCard}
            style={{
                background: getBackground(),
                color: getFontColor(),
                fontSize: '8px',
                paddingTop: '1px',
            }}
        >
            {camelCaseToTitleCase(archetype)}
        </div>
    );
}

function Age({age, style}: {age: number; style?: CSSProperties}) {
    return (
        <div className={styles.age} style={style}>
            {age}
        </div>
    );
}

function DraftStrategyItem({
    draftStrategyLabel,
    year,
    outlook,
    draftCapitalNotes,
    labelColor,
    style,
}: {
    draftStrategyLabel: DraftStrategyLabel;
    year: number;
    draftCapitalNotes: Map<number, string>;
    outlook: OutlookOption;
    labelColor: string;
    style?: CSSProperties;
}) {
    function getStrategyText() {
        if (draftStrategyLabel === DraftStrategyLabel.None) {
            return 'no draft strategy set';
        }
        switch (outlook) {
            case OutlookOption.Contend:
                if (year === 2026) {
                    switch (draftStrategyLabel) {
                        case DraftStrategyLabel.Deficient:
                            return 'Don\'t plan on targeting any picks unless you get an early to mid 1st for "cheap"';
                        case DraftStrategyLabel.Adequate:
                            return "Don't invest in anymore picks unless you get one in the 1.02-1.06 range";
                        case DraftStrategyLabel.Surplus:
                            return 'Consider using one or two of your 1sts for a premier RB or WR option';
                        case DraftStrategyLabel.Overload:
                            return 'Use your expected late 1sts to move up for an earlier pick or a proven player';
                    }
                }
                if (year === 2027) {
                    switch (draftStrategyLabel) {
                        case DraftStrategyLabel.Deficient:
                            return "Don't trade away anymore future 1sts beyond this year for now";
                        case DraftStrategyLabel.Adequate:
                        case DraftStrategyLabel.Surplus:
                            return 'Hold your picks at least until midseason in case you need a production push';
                        case DraftStrategyLabel.Overload:
                            return 'Feel free to move one or two of your picks to get some positional upgrades';
                    }
                }
                return 'unexpected year';
            case OutlookOption.Rebuild:
            case OutlookOption.Reload:
                if (year === 2026) {
                    switch (draftStrategyLabel) {
                        case DraftStrategyLabel.Deficient:
                            return 'See if you can get any pick from the 1.02-1.05 for a fair price or even discount';
                        case DraftStrategyLabel.Adequate:
                            return "Don't invest in anymore picks that aren't in the 1.02-1.06 range";
                        case DraftStrategyLabel.Surplus:
                            return 'Look into moving one or two picks for a young asset with high value upside';
                        case DraftStrategyLabel.Overload:
                            return 'Use your expected late 1sts to move up for an earlier pick or a proven player';
                    }
                }
                if (year === 2027) {
                    switch (draftStrategyLabel) {
                        case DraftStrategyLabel.Deficient:
                            return 'Try getting some picks at a discount before they gain value later this year';
                        case DraftStrategyLabel.Adequate:
                            return 'Hold your current picks & feel free to target more at a discount while you can';
                        case DraftStrategyLabel.Surplus:
                        case DraftStrategyLabel.Overload:
                            return 'Hold all your 1sts at least until next offseason when they reach peak value';
                    }
                }
                return 'unexpected year';
        }
    }

    return (
        <div className={styles.draftStrategyItem} style={style}>
            <div
                className={styles.draftStrategyYear}
                style={{color: labelColor}}
            >
                {year}
            </div>
            <div className={styles.draftStrategyPicks}>
                {draftCapitalNotes.get(year)}
            </div>
            <div
                className={styles.draftStrategyLabel}
                style={{color: labelColor}}
            >
                {draftStrategyLabel}
            </div>
            <div className={styles.draftStrategyText}>{getStrategyText()}</div>
        </div>
    );
}
