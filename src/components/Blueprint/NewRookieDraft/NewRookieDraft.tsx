import styles from './NewRookieDraft.module.css';
import {newRookieBg} from '../../../consts/images';
import {
    ValueArchetype,
    RosterArchetype,
} from '../BlueprintModule/BlueprintModule';
import {CSSProperties, useEffect, useState} from 'react';
import {QB, RB, TE, WR} from '../../../consts/fantasy';
import {getPositionalOrder} from '../infinite/BuySellHold/BuySellHold';
import {FinalPickData} from '../../../sleeper-api/picks';

type NewRookieDraftProps = {
    teamName: string;
    numTeams: number;
    valueArchetype: ValueArchetype;
    rosterArchetype: RosterArchetype;
    qbGrade: number;
    rbGrade: number;
    wrGrade: number;
    teGrade: number;
    myPicks: FinalPickData[];
};

function getFontSize(teamName: string) {
    if (teamName.length >= 24) return '35px';
    if (teamName.length >= 20) return '40px';
    return '50px';
}

export default function NewRookieDraft({
    teamName,
    numTeams,
    valueArchetype,
    rosterArchetype,
    qbGrade,
    rbGrade,
    wrGrade,
    teGrade,
    myPicks,
}: NewRookieDraftProps) {
    const [teamNeed, setTeamNeed] = useState<('QB' | 'RB' | 'WR' | 'TE')[]>([]);
    useEffect(
        () =>
            setTeamNeed(
                getPositionalOrder({
                    qbGrade,
                    rbGrade,
                    wrGrade,
                    teGrade,
                })
            ),
        [qbGrade, rbGrade, wrGrade, teGrade]
    );

    return (
        <div className={styles.fullBlueprint}>
            <div
                className={styles.teamName}
                style={{fontSize: getFontSize(teamName)}}
            >
                {teamName}
            </div>
            <div className={styles.valueArchetype}>{valueArchetype}</div>
            <div className={styles.rosterArchetype}>{rosterArchetype}</div>
            <div className={styles.teamNeedSection}>
                {teamNeed.map((pos, idx) => (
                    <TeamNeedCard
                        key={idx}
                        position={pos}
                        grade={
                            pos === QB
                                ? qbGrade
                                : pos === RB
                                ? rbGrade
                                : pos === WR
                                ? wrGrade
                                : teGrade
                        }
                        rank={idx + 1}
                    />
                ))}
            </div>
            <div className={styles.pickTitles}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <div key={idx} className={styles.pickTitle}>
                        {`Pick ${pick.round}.${pick.slot < 10 ? '0' : ''}${
                            pick.slot
                        }`}
                    </div>
                ))}
            </div>
            <div className={styles.pickProfiles}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <PickProfile
                        key={idx}
                        tier={idx + 1}
                        zScore={idx * 1.25 + 1.1}
                        historicalRank={idx + 1}
                        marketValue={'CORRECTLY VALUED'}
                        domainVerdict={'SELL'}
                    />
                ))}
            </div>
            <img src={newRookieBg} className={styles.backgroundImg} />
        </div>
    );
}

function TeamNeedCard({
    position,
    grade,
    rank,
    style,
}: {
    position: string;
    grade: number;
    rank: number;
    style?: CSSProperties;
}) {
    function getBackground() {
        switch (position) {
            case QB:
                return 'linear-gradient(180deg, #DB2335 0%, #75131C 100%)';
            case RB:
                return 'linear-gradient(180deg, #00B1FF 0%, #006A99 100%)';
            case WR:
                return 'linear-gradient(180deg, #1AE069 0%, #0E7A39 100%)';
            case TE:
                return 'linear-gradient(180deg, #EABA10 0%, #846909 100%)';
        }
        return 'none';
    }
    return (
        <div
            className={styles.teamNeedCard}
            style={{...style, background: getBackground()}}
        >
            <div className={styles.rank}>{rank}</div>
            <div className={styles.position}>{position}</div>
            <div className={styles.grade}>{grade}/10</div>
        </div>
    );
}

type PickProfileProps = {
    tier: number;
    zScore: number;
    historicalRank: number;
    marketValue: 'CORRECTLY VALUED' | 'OVERVALUED' | 'UNDERVALUED';
    domainVerdict: 'BUY' | 'HOLD' | 'SELL';
};

function PickProfile({
    tier,
    zScore,
    historicalRank,
    marketValue,
    domainVerdict,
}: PickProfileProps) {
    function getColorFromVerdict() {
        switch (domainVerdict) {
            case 'BUY':
                return '#1AE069';
            case 'HOLD':
                return '#EABA10';
            case 'SELL':
                return '#DB2335';
        }
    }
    function getColorFromMarketValue() {
        switch (marketValue) {
            case 'UNDERVALUED':
                return '#1AE069';
            case 'CORRECTLY VALUED':
                return '#EABA10';
            case 'OVERVALUED':
                return '#DB2335';
        }
    }
    function getRankSuffix() {
        const abs = Math.abs(historicalRank);
        const lastTwo = abs % 100;
        const lastOne = abs % 10;

        if (lastTwo >= 11 && lastTwo <= 13) return 'th';

        switch (lastOne) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    }
    function getColorFromTier() {
        switch (tier) {
            case 1:
                return '#CD00FF';
            case 2:
                return '#00B1FF';
            case 3:
                return '#1AE069';
            case 4:
                return '#EABA10';
            case 5:
                return '#FF4200';
            case 6:
                return '#DB2335';
            default:
                return '#D9D9D9';
        }
    }

    return (
        <div className={styles.pickProfile}>
            <div>
                Tier:{' '}
                <span
                    className={styles.tier}
                    style={{color: getColorFromTier()}}
                >
                    {tier}
                </span>
            </div>
            <div>
                Bakery Z-Score: <span className={styles.zScore}>{zScore}</span>
            </div>
            <div>
                Historical Rank{' '}
                <span className={styles.lastTenClasses}>(Last 10 Classes)</span>
                :{' '}
                <span className={styles.rank}>
                    {historicalRank}
                    {getRankSuffix()}
                </span>
            </div>
            <div>
                Market Value:{' '}
                <span
                    className={styles.marketValue}
                    style={{color: getColorFromMarketValue()}}
                >
                    {marketValue}
                </span>
            </div>
            <div>
                Domain Verdict:{' '}
                <span
                    className={styles.domainVerdict}
                    style={{color: getColorFromVerdict()}}
                >
                    {domainVerdict}
                </span>
            </div>
        </div>
    );
}
