import {useEffect, useState} from 'react';
import {Roster} from '../../../../sleeper-api/sleeper-api';
import styles from './BuySellHold.module.css';
import {hardBuy, hardSell, softBuy, softSell} from '../../../../consts/images';
import {RosterTier, useRosterTierAndPosGrades} from '../RosterTier/RosterTier';
import {QB, RB, TE, WR} from '../../../../consts/fantasy';
import {
    useAdpData,
    useBuySellData,
    useDisallowedBuysFromUrl,
    usePlayerData,
} from '../../../../hooks/hooks';
import PlayerBar from '../PlayerBar/PlayerBar';

// Only QB buys allowed in 1QB leagues.
const ONE_QB_ALLOWSET = new Set<string>([
    'Josh Allen',
    'Jayden Daniels',
    'Lamar Jackson',
    'Drake Maye',
    'Kyler Murray',
]);

// No TE buys if team has one of these players.
const TE_DISALLOWSET = new Set<string>([
    'Brock Bowers',
    'George Kittle',
    'Trey McBride',
    'TJ Hockenson',
    'Sam LaPorta',
]);

enum BuySellType {
    SoftBuy,
    HardBuy,
    SoftSell,
    HardSell,
    Hold,
}

export type BuySellTileProps = {
    playerId: string;
    type: BuySellType;
};

export function useBuySells(
    isSuperFlex: boolean,
    leagueSize: number,
    roster?: Roster
) {
    const {tier, qbGrade, rbGrade, wrGrade, teGrade} =
        useRosterTierAndPosGrades(isSuperFlex, leagueSize, roster);
    const [buys, setBuys] = useState<BuySellTileProps[]>([]);
    const [sells, setSells] = useState<BuySellTileProps[]>([]);
    const [holds, setHolds] = useState<BuySellTileProps[]>([]);
    const [disallowedBuys] = useDisallowedBuysFromUrl();
    const {
        qbBuys,
        rbBuys,
        wrBuys,
        teBuys,
        sells: allSells,
        holds: allHolds,
    } = useBuySellData();
    const playerData = usePlayerData();
    useEffect(() => {
        if (!roster || tier === RosterTier.Unknown || !playerData) return;
        setBuys(calculateBuys());
        setSells(calculateSells());
        setHolds(calculateHolds());
    }, [
        qbBuys,
        rbBuys,
        wrBuys,
        teBuys,
        qbGrade,
        rbGrade,
        wrGrade,
        teGrade,
        allSells,
        allHolds,
        tier,
        playerData,
    ]);
    const {getAdp} = useAdpData();
    let addedBelow100 = false;

    interface PositionalScores {
        [position: string]: number;
    }

    interface TradeTargets {
        [position: string]: number;
    }

    /**
     * Given a set of position scores and a roster tier, this function will calculate the number of targets to assign to each position.
     * The number of targets is based on the criteria below, and is assigned to the positions in order of highest need (lowest score).
     * - If the score is 8 or higher, assign 0 or 1 target.
     * - If the score is 6 or higher, assign 1 or 2 targets.
     * - If the score is below 6, assign 2 or 3 targets.
     * - Ensure that no more than 1 target is assigned to QB or TE.
     * - If there are remaining targets, assign them to WR.
     * @param scores an object with keys for each position and values of the scores for that position
     * @param tier the tier of the roster
     * @returns an object with the number of targets for each position
     */
    function calculateNumTradeTargets(
        scores: PositionalScores,
        tier: RosterTier
    ): TradeTargets {
        const tradeTargets: TradeTargets = {QB: 0, RB: 0, WR: 0, TE: 0};
        let remainingTargets = 4;

        // Helper function to assign targets to a position
        const assignTargets = (position: string, max: number) => {
            const maxAssignable = Math.min(max, remainingTargets);
            tradeTargets[position] = maxAssignable;
            remainingTargets -= maxAssignable;
        };

        // Sort positions by scores in ascending order of need (lower score = higher need)
        const sortedPositions = Object.entries(scores)
            .sort((a, b) => a[1] - b[1])
            .map(([position]) => position);

        // Assign targets based on the criteria
        for (const position of sortedPositions) {
            const score = scores[position];
            if (remainingTargets === 0) break;
            if (
                position === RB &&
                (tier === RosterTier.Rebuild || tier === RosterTier.Reload)
            ) {
                assignTargets(position, 0);
                continue;
            }

            if (position === TE) {
                const hasEliteTe = roster?.players
                    .map(p => playerData![p])
                    .filter(p => !!p)
                    .find(p =>
                        TE_DISALLOWSET.has(`${p.first_name} ${p.last_name}`)
                    );
                if (hasEliteTe) {
                    assignTargets(position, 0);
                    continue;
                }
            }

            if (score >= 8) {
                assignTargets(position, 1);
            } else if (score >= 6) {
                assignTargets(position, 2);
            } else {
                assignTargets(position, 3);
            }

            // Ensure no more than 1 QB or TE target
            if (
                (position === QB || position === TE) &&
                tradeTargets[position] > 1
            ) {
                remainingTargets += tradeTargets[position] - 1;
                tradeTargets[position] = 1;
            }
        }
        if (remainingTargets > 0) {
            tradeTargets.WR += remainingTargets;
        }

        return tradeTargets;
    }

    function calculateBuys(): BuySellTileProps[] {
        const buys: BuySellTileProps[] = [];
        const {
            QB: qbTargets,
            RB: rbTargets,
            WR: wrTargets,
            TE: teTargets,
        } = calculateNumTradeTargets(
            {QB: qbGrade, RB: rbGrade, WR: wrGrade, TE: teGrade},
            tier
        );
        const gradeOrder = getPositionalOrder({
            qbGrade,
            rbGrade,
            wrGrade,
            teGrade,
        });
        for (const pos of gradeOrder) {
            switch (pos) {
                case QB:
                    buys.push(...calcQbBuys(qbTargets));
                    break;
                case RB:
                    buys.push(...calcRbBuys(rbTargets));
                    break;
                case WR:
                    buys.push(...calcWrBuys(wrTargets));
                    break;
                case TE:
                    buys.push(...calcTeBuys(teTargets));
                    break;
                default:
                    throw new Error('Unknown position ' + pos);
            }
        }
        if (buys.length < 4) {
            buys.push(...calcWrBuys(4 - buys.length, buys));
        }
        return buys;
    }

    function calcQbBuys(numToBuy: number): BuySellTileProps[] {
        if (
            // Only buy QBs if competitive in 1QB leagues
            tier !== RosterTier.Competitive &&
            tier !== RosterTier.Championship &&
            tier !== RosterTier.Elite &&
            !isSuperFlex
        ) {
            return [];
        }
        const toBuy: BuySellTileProps[] = [];
        for (const qbBuy of qbBuys) {
            if (toBuy.length >= numToBuy) {
                break;
            }
            if (roster?.players.includes(qbBuy.player_id)) {
                continue;
            }
            if (!isSuperFlex && !ONE_QB_ALLOWSET.has(qbBuy.name)) {
                continue;
            }
            if (disallowedBuys.includes(qbBuy.player_id)) {
                continue;
            }
            const adp = getAdp(qbBuy.name);
            if (adp > 140) continue;
            if (
                adp > 100 &&
                tier !== RosterTier.Rebuild &&
                tier !== RosterTier.Reload
            ) {
                if (addedBelow100) continue;
                addedBelow100 = true;
            }
            if (tier === RosterTier.Rebuild && adp < 48) {
                continue;
            }
            if (tier === RosterTier.Reload && adp < 36) {
                continue;
            }
            toBuy.push({
                playerId: qbBuy.player_id,
                type:
                    qbBuy.verdict === 'Soft Buy'
                        ? BuySellType.SoftBuy
                        : BuySellType.HardBuy,
            });
        }
        return toBuy;
    }

    function calcRbBuys(numToBuy: number): BuySellTileProps[] {
        if (tier === RosterTier.Rebuild || tier === RosterTier.Reload) {
            return [];
        }
        const toBuy: BuySellTileProps[] = [];
        for (const rbBuy of rbBuys) {
            if (toBuy.length >= numToBuy) {
                break;
            }
            if (roster?.players.includes(rbBuy.player_id)) {
                continue;
            }
            if (disallowedBuys.includes(rbBuy.player_id)) {
                continue;
            }
            const adp = getAdp(rbBuy.name);
            if (adp > 140) continue;
            if (adp > 100) {
                if (addedBelow100) continue;
                addedBelow100 = true;
            }
            toBuy.push({
                playerId: rbBuy.player_id,
                type:
                    rbBuy.verdict === 'Soft Buy'
                        ? BuySellType.SoftBuy
                        : BuySellType.HardBuy,
            });
        }
        return toBuy;
    }

    function calcWrBuys(
        numToBuy: number,
        existingWrBuys?: BuySellTileProps[]
    ): BuySellTileProps[] {
        const secondPass = !!existingWrBuys;
        const toBuy: BuySellTileProps[] = [];
        for (const wrBuy of wrBuys) {
            if (toBuy.length >= numToBuy) {
                break;
            }
            if (roster?.players.includes(wrBuy.player_id)) {
                continue;
            }
            if (tier === RosterTier.Rebuild || tier === RosterTier.Reload) {
                if (wrBuy.age >= 26) {
                    continue;
                }
            }
            if (disallowedBuys.includes(wrBuy.player_id)) {
                continue;
            }
            const adp = getAdp(wrBuy.name);
            if (adp > 140) continue;
            if (
                adp > 100 &&
                tier !== RosterTier.Rebuild &&
                tier !== RosterTier.Reload
            ) {
                if (addedBelow100) continue;
                addedBelow100 = true;
            }
            if (tier === RosterTier.Rebuild && adp < 48 && !secondPass) {
                continue;
            }
            if (tier === RosterTier.Reload && adp < 36 && !secondPass) {
                continue;
            }
            if (
                secondPass &&
                !!existingWrBuys.find(b => b.playerId === wrBuy.player_id)
            ) {
                continue;
            }
            toBuy.push({
                playerId: wrBuy.player_id,
                type:
                    wrBuy.verdict === 'Soft Buy'
                        ? BuySellType.SoftBuy
                        : BuySellType.HardBuy,
            });
        }
        return toBuy;
    }

    function calcTeBuys(numToBuy: number): BuySellTileProps[] {
        const toBuy: BuySellTileProps[] = [];
        for (const teBuy of teBuys) {
            if (toBuy.length >= numToBuy) {
                break;
            }
            if (roster?.players.includes(teBuy.player_id)) {
                continue;
            }
            if (tier === RosterTier.Rebuild || tier === RosterTier.Reload) {
                if (teBuy.age >= 26) {
                    continue;
                }
            }
            if (disallowedBuys.includes(teBuy.player_id)) {
                continue;
            }
            const adp = getAdp(teBuy.name);
            if (adp > 140) continue;
            if (
                adp > 100 &&
                tier !== RosterTier.Rebuild &&
                tier !== RosterTier.Reload
            ) {
                if (addedBelow100) continue;
                addedBelow100 = true;
            }
            if (tier === RosterTier.Rebuild && adp < 48) {
                continue;
            }
            if (tier === RosterTier.Reload && adp < 36) {
                continue;
            }
            toBuy.push({
                playerId: teBuy.player_id,
                type:
                    teBuy.verdict === 'Soft Buy'
                        ? BuySellType.SoftBuy
                        : BuySellType.HardBuy,
            });
        }
        return toBuy;
    }

    function calculateSells(): BuySellTileProps[] {
        if (!roster) return [];
        return allSells
            .filter(sell => roster.players.includes(sell.player_id))
            .filter(s => {
                if (isSuperFlex || s.position !== QB) return true;
                // No QB sells lower than QB12 in 1QB formats
                return s.pos_adp <= 12;
            })
            .slice(0, 2)
            .map(sell => ({
                playerId: sell.player_id,
                type:
                    sell.verdict === 'Soft Sell'
                        ? BuySellType.SoftSell
                        : BuySellType.HardSell,
                reason: sell.explanation,
            }));
    }

    function calculateHolds(): BuySellTileProps[] {
        if (!roster) return [];
        return allHolds
            .filter(
                hold =>
                    roster.players.includes(hold.player_id) &&
                    getAdp(hold.name) < 140
            )
            .slice(0, 2)
            .map(hold => ({
                playerId: hold.player_id,
                type: BuySellType.Hold,
                reason: hold.explanation,
            }));
    }

    return {buys, sells, holds};
}

/**
 * Sorts the positions (QB, RB, WR, TE) in order of worst grade to best.
 * @param grades grades for each position
 * @returns an array of positions, sorted by grade
 */
export function getPositionalOrder(grades: {
    qbGrade: number;
    rbGrade: number;
    wrGrade: number;
    teGrade: number;
}) {
    return Object.entries(grades)
        .sort((a, b) => a[1] - b[1])
        .map(([pos]) => {
            switch (pos) {
                case 'qbGrade':
                    return QB;
                case 'rbGrade':
                    return RB;
                case 'wrGrade':
                    return WR;
                case 'teGrade':
                    return TE;
                default:
                    throw new Error('Unknown position ' + pos);
            }
        });
}

function mapToImgSrc(type: BuySellType) {
    switch (type) {
        case BuySellType.SoftBuy:
            return softBuy;
        case BuySellType.HardBuy:
            return hardBuy;
        case BuySellType.SoftSell:
            return softSell;
        case BuySellType.HardSell:
            return hardSell;
        case BuySellType.Hold:
            throw new Error('Hold should not be mapped to an image');
    }
}

export function BuySellTile({playerId, type}: BuySellTileProps) {
    if (!playerId) return <></>;
    return (
        <div className={styles.buySellTile}>
            {type !== BuySellType.Hold && (
                <img src={mapToImgSrc(type)} className={styles.buySellImage} />
            )}
            <PlayerBar playerId={playerId} />
        </div>
    );
}
