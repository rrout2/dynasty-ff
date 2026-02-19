import styles from './SuggestedMove.module.css';
import {Casino, PushPin, PushPinOutlined} from '@mui/icons-material';
import {IconButton, Tooltip} from '@mui/material';
import axios from 'axios';
import {Dispatch, SetStateAction, useState, useEffect} from 'react';
import {sfIcon} from '../../../../consts/images';
import {
    AZURE_API_URL,
    TradeAsset,
    usePlayerData,
    useSleeperIdMap,
} from '../../../../hooks/hooks';
import {Player} from '../../../../sleeper-api/sleeper-api';
import {rookiePickIdToString} from '../../NewV1/NewV1';
import DomainAutocomplete from '../../shared/DomainAutocomplete';
import DomainDropdown from '../../shared/DomainDropdown';
import {isRookiePickId} from '../../v1/modules/playerstotarget/PlayersToTargetModule';
import {assetToString, Move, shuffle} from '../BlueprintModule';

type SuggestedMoveProps = {
    move: Move;
    setMove: (move: Move) => void;
    playerIdsToTrade: string[];
    setPlayerIdsToTrade: (playerIds: string[]) => void;
    playerIdsToTarget: string[][];
    setPlayerIdsToTarget: Dispatch<SetStateAction<string[][]>>;
    rosterPlayers: Player[];
    moveNumber: number;
    rerollMove: () => void;
    playerIdToAssetKey: Map<string, string>;
    setPlayerIdToAssetKey: Dispatch<SetStateAction<Map<string, string>>>;
    playerIdToDomainValue: Map<string, number>;
    setPlayerIdToDomainValue: Dispatch<SetStateAction<Map<string, number>>>;
    leagueId: string;
    rosterId: number;
    numTeams: number;
};

export default function SuggestedMove({
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
    setPlayerIdToAssetKey,
    playerIdToDomainValue,
    setPlayerIdToDomainValue,
    leagueId,
    rosterId,
    numTeams,
}: SuggestedMoveProps) {
    const playerData = usePlayerData();
    const {getApiIdFromSleeperId} = useSleeperIdMap();

    const [optionsToTrade, setOptionsToTrade] = useState<string[]>([]);
    const [pinnedReturnAssets, setPinnedReturnAssets] =
        useState(playerIdsToTarget.map(row => row.map(() => false)));
    const [loadingAllThree, setLoadingAllThree] = useState(false);
    const [loadingRow, setLoadingRow] = useState(-1);

    function populatePlayerIdMaps(idea: TradeIdea) {
        setPlayerIdToAssetKey(old => {
            const newPlayerIdToAssetKey = new Map<string, string>(old);
            idea.inAssets.forEach(asset => {
                const str = assetToString(asset);
                if (newPlayerIdToAssetKey.has(str)) return;
                newPlayerIdToAssetKey.set(str, asset.assetKey);
            });
            return newPlayerIdToAssetKey;
        });
        setPlayerIdToDomainValue(old => {
            const newPlayerIdToDomainValue = new Map<string, number>(old);
            idea.inAssets.forEach(asset => {
                const str = assetToString(asset);
                if (newPlayerIdToDomainValue.has(str)) return;
                newPlayerIdToDomainValue.set(str, asset.domainValue);
            });
            return newPlayerIdToDomainValue;
        });
    }

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
            return rookiePickIdToString(id, numTeams);
        }
        if (!playerData[id]) return id;
        return !Number.isNaN(+id)
            ? `${playerData[id].first_name} ${playerData[id].last_name}`
            : id;
    }

    function getPrimaryAsset(assetIds: string[]) {
        return (
            '' +
            assetIds.reduce((max, current) => {
                const currentValue = playerIdToDomainValue.get(current) || 0;
                const maxValue = playerIdToDomainValue.get(max) || 0;
                return currentValue > maxValue ? current : max;
            }, assetIds[0])
        );
    }

    // protectedRows === undefined means that this is a standalone move
    // protectedRows === [] means no primary asset checking
    async function newCustomDowntier(rowIdx: number, protectedRows?: number[]) {
        const tradeIdeas = await fetchCustomDowntier({
            leagueId,
            rosterId,
            outAssetKeys: [playerIdToAssetKey.get(playerIdsToTrade[0])!],
            inAssetKeys: playerIdsToTarget[rowIdx]
                .filter((_, idx) => pinnedReturnAssets[rowIdx][idx])
                .map(id => playerIdToAssetKey.get(id)!),
        });
        const ideas = tradeIdeas
            .filter(idea => !!idea)
            .filter(idea => {
                populatePlayerIdMaps(idea);
                const inAssetStrings = idea.inAssets.map(assetToString);
                const targetRow = playerIdsToTarget[rowIdx];
                return !targetRow.every(target =>
                    inAssetStrings.includes(target)
                );
            });
        shuffle(ideas);
        const newPlayerIdsToTarget = [...playerIdsToTarget];

        const existingPrimaryAssets = (
            !protectedRows
                ? newPlayerIdsToTarget
                      .map((row, idx) =>
                          idx !== rowIdx ? getPrimaryAsset(row) : undefined
                      )
                      .slice(0, 3)
                : protectedRows.map(idx =>
                      getPrimaryAsset(newPlayerIdsToTarget[idx])
                  )
        ).filter(asset => asset !== undefined);

        for (let ideaIdx = 0; ideaIdx < ideas.length; ideaIdx++) {
            const playerIds = ideas[ideaIdx].inAssets.map(assetToString);
            const suggestedPrimaryAsset = getPrimaryAsset(playerIds);
            if (existingPrimaryAssets.includes(suggestedPrimaryAsset)) continue;
            if (newPlayerIdsToTarget[rowIdx][0] === playerIds[0]) {
                newPlayerIdsToTarget[rowIdx] = playerIds;
            } else {
                newPlayerIdsToTarget[rowIdx] = [playerIds[1], playerIds[0]];
            }
            break;
        }

        setPlayerIdsToTarget(newPlayerIdsToTarget);
    }

    async function newCustomDowntierAllThree() {
        const protectedRows: number[] = [];
        for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
            if (
                pinnedReturnAssets[rowIdx][0] !==
                pinnedReturnAssets[rowIdx][1]
            ) {
                await newCustomDowntier(rowIdx, protectedRows);
                protectedRows.push(rowIdx);
            } else if (pinnedReturnAssets[rowIdx][0]) {
                protectedRows.push(rowIdx);
            }
        }

        if (protectedRows.length === 3) return;

        const ideas = await fetchCustomDowntier({
            leagueId,
            rosterId,
            outAssetKeys: [playerIdToAssetKey.get(playerIdsToTrade[0])!],
        });
        ideas.forEach(populatePlayerIdMaps);
        shuffle(ideas);
        const newPlayerIdsToTarget = [...playerIdsToTarget];
        let ideaIdx = 0;
        let insertIdx = 0;
        const isAssetAlreadyPlaced = (
            asset: string,
            upToIndex: number
        ): boolean =>
            Array.from({length: upToIndex}, (_, j) => j)
                .concat(protectedRows)
                .some(j => getPrimaryAsset(newPlayerIdsToTarget[j]) === asset);
        while (insertIdx < 3) {
            if (protectedRows.includes(insertIdx)) {
                insertIdx++;
                continue;
            }

            const inAssetIds = ideas[ideaIdx].inAssets.map(assetToString);
            const suggestedPrimaryAsset = getPrimaryAsset(inAssetIds);

            if (isAssetAlreadyPlaced(suggestedPrimaryAsset, insertIdx)) {
                ideaIdx++;
                continue;
            }

            newPlayerIdsToTarget[insertIdx] = inAssetIds;
            ideaIdx++;
            insertIdx++;
        }
        setPlayerIdsToTarget(newPlayerIdsToTarget);
    }

    async function newCustomPivotAllThree() {
        const isAssetPinned = [0, 1, 2].map(idx => pinnedReturnAssets[idx][0]);
        if (isAssetPinned.every(h => h)) return;
        const ideas = await fetchCustomPivot({
            leagueId,
            rosterId,
            outAssetKey: playerIdToAssetKey.get(playerIdsToTrade[0])!,
        });
        ideas.forEach(populatePlayerIdMaps);
        shuffle(ideas);
        const inAssets = ideas
            .map(idea => idea.inAssets.map(assetToString))
            .flat();
        const newPlayerIdsToTarget = [...playerIdsToTarget];
        for (let i = 0; i < 3; i++) {
            if (isAssetPinned[i]) continue;
            newPlayerIdsToTarget[i] = [inAssets[i], ''];
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
                    {move === Move.PIVOT && (
                        <Tooltip
                            title={`Find Pivots for ${getDisplayValueFromId(
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
                                    newCustomPivotAllThree().finally(() => {
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
                            {[0, 1, 2].map(i => (
                                <div className={styles.downtierRow}>
                                    <PinButton
                                        pinCoords={[i, 0]}
                                        pinnedReturnAssets={
                                            pinnedReturnAssets
                                        }
                                        setPinnedReturnAssets={
                                            setPinnedReturnAssets
                                        }
                                    />
                                    <DomainAutocomplete
                                        key={i}
                                        selectedPlayer={playerIdsToTarget[i][0]}
                                        setSelectedPlayer={(player: string) => {
                                            setPlayerIdsToTarget(prev =>
                                                prev.map((entry, j) =>
                                                    j === i
                                                        ? [player, entry[1]]
                                                        : entry
                                                )
                                            );
                                        }}
                                        numTeams={numTeams}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                    {move === Move.DOWNTIER && (
                        <>
                            {[0, 1, 2].map(rowIdx => (
                                <div className={styles.downtierRow}>
                                    <PinButton
                                        pinCoords={[rowIdx, 0]}
                                        pinnedReturnAssets={
                                            pinnedReturnAssets
                                        }
                                        setPinnedReturnAssets={
                                            setPinnedReturnAssets
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
                                            const apiId =
                                                getApiIdFromSleeperId(player);
                                            if (apiId) {
                                                setPlayerIdToAssetKey(old => {
                                                    const newPlayerIdToAssetKey =
                                                        new Map<string, string>(
                                                            old
                                                        );
                                                    newPlayerIdToAssetKey.set(
                                                        player,
                                                        `player:${apiId}`
                                                    );
                                                    return newPlayerIdToAssetKey;
                                                });
                                            }
                                            newPlayerIdsToTarget[rowIdx][0] =
                                                player;
                                            setPlayerIdsToTarget(
                                                newPlayerIdsToTarget
                                            );
                                        }}
                                        numTeams={numTeams}
                                    />
                                    <img
                                        src={sfIcon}
                                        className={styles.icons}
                                        style={{margin: '0', padding: '0'}}
                                    />
                                    <PinButton
                                        pinCoords={[rowIdx, 1]}
                                        pinnedReturnAssets={
                                            pinnedReturnAssets
                                        }
                                        setPinnedReturnAssets={
                                            setPinnedReturnAssets
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
                                            const apiId =
                                                getApiIdFromSleeperId(player);
                                            if (apiId) {
                                                setPlayerIdToAssetKey(old => {
                                                    const newPlayerIdToAssetKey =
                                                        new Map<string, string>(
                                                            old
                                                        );
                                                    newPlayerIdToAssetKey.set(
                                                        player,
                                                        `player:${apiId}`
                                                    );
                                                    return newPlayerIdToAssetKey;
                                                });
                                            }
                                            newPlayerIdsToTarget[rowIdx][1] =
                                                player;
                                            setPlayerIdsToTarget(
                                                newPlayerIdsToTarget
                                            );
                                        }}
                                        numTeams={numTeams}
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
                                            pinnedReturnAssets[
                                                rowIdx
                                            ][0] ===
                                            pinnedReturnAssets[
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
    pinnedReturnAssets: boolean[][];
    setPinnedReturnAssets: (assets: boolean[][]) => void;
    pinCoords: number[];
};

function PinButton({
    pinnedReturnAssets,
    setPinnedReturnAssets,
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
                    ...pinnedReturnAssets,
                ];
                newDowntierPinnedReturnAssets[pinCoords[0]][pinCoords[1]] =
                    !pinnedReturnAssets[pinCoords[0]][pinCoords[1]];
                setPinnedReturnAssets(newDowntierPinnedReturnAssets);
            }}
        >
            {pinnedReturnAssets[pinCoords[0]][pinCoords[1]] ? (
                <PushPin sx={{color: 'white'}} />
            ) : (
                <PushPinOutlined sx={{color: 'white'}} />
            )}
        </IconButton>
    );
}

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
            maxResults: 300,
        },
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    };
    const res = await axios.request(options);
    return res.data as TradeIdea[];
};

const fetchCustomPivot = async ({
    leagueId,
    rosterId,
    outAssetKey,
}: {
    leagueId: string;
    rosterId: number;
    outAssetKey: string;
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
            moveType: 1,
            outAssetKeys: [outAssetKey],
            maxResults: 300,
        },
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    };
    const res = await axios.request(options);
    return res.data as TradeIdea[];
};
