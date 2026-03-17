import styles from './NewRookieDraft.module.css';
import {
    cornerstoneCategory,
    foundationalCategory,
    jagDevelopmentalCategory,
    jagInsuranceCategory,
    mainstayCategory,
    newRookieBg,
    newRookieCardMap,
    oneQb10TeamCliffMap,
    oneQb12TeamCliffMap,
    oneQb14TeamCliffMap,
    oneQb8TeamCliffMap,
    productiveVetCategory,
    replaceableCategory,
    serviceableCategory,
    sf10TeamCliffMap,
    sf12TeamCliffMap,
    sf14TeamCliffMap,
    sf8TeamCliffMap,
    shortTermLeagueWinnersCategory,
    shortTermProductionCategory,
    upsidePremierCategory,
    upsideShotCategory,
} from '../../../consts/images';
import {
    ValueArchetype,
    RosterArchetype,
} from '../BlueprintModule/BlueprintModule';
import {CSSProperties, useEffect, useState} from 'react';
import {QB, RB, TE, WR} from '../../../consts/fantasy';
import {getPositionalOrder} from '../infinite/BuySellHold/BuySellHold';
import {FinalPickData} from '../../../sleeper-api/picks';
import {PlayerCard} from '../NewV1/NewV1';
import {
    PickProfile as Pick,
    RosterPlayer,
    usePlayerData,
} from '../../../hooks/hooks';
import {Player} from '../../../sleeper-api/sleeper-api';

type NewRookieDraftProps = {
    teamName: string;
    numTeams: number;
    valueArchetype: ValueArchetype;
    rosterArchetype: RosterArchetype;
    myPicks: Pick[];
    strategyName: string;
    strategyStatement: string;
    isSuperFlex: boolean;
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
    myPicks,
    strategyName,
    strategyStatement,
    isSuperFlex,
}: NewRookieDraftProps) {
    const playerData = usePlayerData();
    if (!playerData) return <></>;

    function getCliffMap() {
        if (isSuperFlex) {
            switch (numTeams) {
                case 8:
                    return sf8TeamCliffMap;
                case 10:
                    return sf10TeamCliffMap;
                case 12:
                    return sf12TeamCliffMap;
                case 14:
                    return sf14TeamCliffMap;
            }
        } else {
            switch (numTeams) {
                case 8:
                    return oneQb8TeamCliffMap;
                case 10:
                    return oneQb10TeamCliffMap;
                case 12:
                    return oneQb12TeamCliffMap;
                case 14:
                    return oneQb14TeamCliffMap;
            }
        }
        return '';
    }
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
            <div className={styles.pickTitles}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <div key={idx} className={styles.pickTitle}>
                        {`Pick ${pick.round}.${
                            pick.pickNumber < 10 ? '0' : ''
                        }${pick.pickNumber}`}
                    </div>
                ))}
            </div>
            <div className={styles.pickProfiles}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <PickProfile key={idx} pick={pick} />
                ))}
            </div>
            <div className={styles.targetCards}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <div key={idx} className={styles.targetCardRow}>
                        {pick.targets.map((target, idx) =>
                            newRookieCardMap.has(target.playerName) ? (
                                <img
                                    key={idx}
                                    src={
                                        newRookieCardMap.get(target.playerName)!
                                    }
                                    className={styles.targetCard}
                                />
                            ) : (
                                <div key={idx} className={styles.targetCard}>
                                    {target.playerName} is missing rookie card
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.autoAcceptRejectColumn}>
                {myPicks.slice(0, 4).map((pick, idx) => (
                    <AutoAcceptReject
                        key={idx}
                        autoAcceptPlayer={
                            playerData[pick.autoAcceptPlayerSleeperId]
                        }
                        autoRejectPlayer={
                            playerData[pick.autoRejectPlayerSleeperId]
                        }
                    />
                ))}
            </div>
            <div className={styles.rookieDraftStrategySection}>
                <RookieDraftStrategy
                    strategyName={strategyName}
                    strategyStatement={strategyStatement}
                />
            </div>
            <img src={getCliffMap()} className={styles.cliffMap} />
            <img src={newRookieBg} className={styles.backgroundImg} />
        </div>
    );
}

function AutoAcceptReject({
    autoAcceptPlayer,
    autoRejectPlayer,
}: {
    autoAcceptPlayer: Player;
    autoRejectPlayer: Player;
}) {
    return (
        <div className={styles.autoAcceptReject}>
            <PlayerCard
                player={autoAcceptPlayer}
                getStartingPosition={() => autoAcceptPlayer.position}
                hideAdp
            />
            <PlayerCard
                player={autoRejectPlayer}
                getStartingPosition={() => autoRejectPlayer.position}
                hideAdp
            />
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
    pick: Pick;
};

function PickProfile({pick}: PickProfileProps) {
    function getPlayerCategoryImg() {
        switch (pick.projectedPlayerCategory) {
            case 'Cornerstone':
                return cornerstoneCategory;
            case 'Foundational':
                return foundationalCategory;
            case 'JAGDevelopmental':
                return jagDevelopmentalCategory;
            case 'JAGInsurance':
                return jagInsuranceCategory;
            case 'Mainstay':
                return mainstayCategory;
            case 'ProductiveVet':
                return productiveVetCategory;
            case 'Replaceable':
                return replaceableCategory;
            case 'Serviceable':
                return serviceableCategory;
            case 'ShortTermLeagueWinners':
                return shortTermLeagueWinnersCategory;
            case 'ShortTermProduction':
                return shortTermProductionCategory;
            case 'UpsidePremier':
                return upsidePremierCategory;
            case 'UpsideShot':
                return upsideShotCategory;
        }
        return '';
    }

    function getColorFromMarketValue() {
        switch (pick.marketValue.toUpperCase()) {
            case 'UNDERVALUED':
                return '#1AE069';
            case 'CORRECTLYVALUED':
                return '#EABA10';
            case 'OVERVALUED':
                return '#DB2335';
        }
        return '';
    }
    function getMarketValueDisplay() {
        switch (pick.marketValue.toUpperCase()) {
            case 'CORRECTLYVALUED':
                return 'CORRECTLY VALUED';
            default:
                return pick.marketValue.toUpperCase();
        }
    }
    function getRankSuffix() {
        const abs = Math.abs(pick.historicalRank);
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
        switch (pick.tier) {
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
                    {pick.tier}
                </span>
            </div>
            <div>
                Bakery Z-Score:{' '}
                <span className={styles.zScore}>{pick.bakeryZScore}</span>
            </div>
            <div>
                Proj. Player Category:{' '}
                {getPlayerCategoryImg() ? (
                    <img
                        src={getPlayerCategoryImg()}
                        className={styles.playerCategory}
                    />
                ) : (
                    pick.projectedPlayerCategory
                )}
            </div>
            <div>
                Historical Rank{' '}
                <span className={styles.lastTenClasses}>(Last 10 Classes)</span>
                :{' '}
                <span className={styles.rank}>
                    {pick.historicalRank}
                    {getRankSuffix()}
                </span>
            </div>
            <div>
                Market Value:{' '}
                <span
                    className={styles.marketValue}
                    style={{color: getColorFromMarketValue()}}
                >
                    {getMarketValueDisplay()}
                </span>
            </div>
        </div>
    );
}

function RookieDraftStrategy({
    strategyName,
    strategyStatement,
}: {
    strategyName: string;
    strategyStatement: string;
}) {
    return (
        <div className={styles.rookieDraftStrategy}>
            <div className={styles.rookieDraftStrategyTitle}>
                {strategyName}
            </div>
            <div className={styles.rookieDraftStrategyText}>
                {strategyStatement}
            </div>
        </div>
    );
}
