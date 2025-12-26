import styles from './Premium.module.css';
import {premiumAssets, premiumBkg} from '../../../consts/images';
import {Player, User} from '../../../sleeper-api/sleeper-api';
import {
    ValueArchetype,
    RosterArchetype,
    OutlookOption,
    PriorityOption,
    FullMove,
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
    topPriorities: PriorityOption[];
    tradeStrategy: FullMove[];
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
}: PremiumProps) {
    return (
        <div className={`exportableClassPremium ${styles.fullBlueprint}`}>
            <img src={premiumAssets} className={styles.assets} />
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
            <img src={premiumBkg} className={styles.backgroundImg} />
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
                style={{right: '755px', bottom: '477px',
                    transform: 'scale(0.95)',
                    transformOrigin: 'bottom right', gap: '30px'}}
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
        </div>
    );
}
