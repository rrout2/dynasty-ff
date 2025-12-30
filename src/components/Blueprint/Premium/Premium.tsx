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

function getFontSize(teamName: string) {
    if (teamName.length >= 24) return '32px';
    if (teamName.length >= 20) return '38px';
    return '50px';
}

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
}: PremiumProps) {
    const [startingQbAge, setStartingQbAge] = useState(0);
    const [startingRbAge, setStartingRbAge] = useState(0);
    const [startingWrAge, setStartingWrAge] = useState(0);
    const [startingTeAge, setStartingTeAge] = useState(0);
    useEffect(() => {
        const starters = new Map<string, Player[]>();
        rosterPlayers.forEach(player => {
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
                    left: '800px',
                    top: '360px',
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left',
                }}
                production={true}
            />
            <ProductionValueShare
                share={valueShare}
                leagueRank={valueShareRank}
                style={{
                    left: '810px',
                    top: '437px',
                    transform: 'scale(0.9)',
                    transformOrigin: 'top left',
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
