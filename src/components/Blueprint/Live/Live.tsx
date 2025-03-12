import {useState} from 'react';
import styles from './Live.module.css';
import {
    blankLive,
    dualEliteQb,
    eliteQbTe,
    eliteValue,
    futureValue,
    hardRebuild,
    oneYearReload,
    rbHeavy,
    wellRounded,
    wrFactory,
} from '../../../consts/images';
import {Archetype} from '../v1/modules/BigBoy/BigBoy';
import {
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
    Button,
} from '@mui/material';

export const ARCHETYPE_TO_IMAGE: Map<Archetype, string> = new Map([
    [Archetype.DualEliteQB, dualEliteQb],
    [Archetype.EliteQBTE, eliteQbTe],
    [Archetype.EliteValue, eliteValue],
    [Archetype.FutureValue, futureValue],
    [Archetype.HardRebuild, hardRebuild],
    [Archetype.OneYearReload, oneYearReload],
    [Archetype.RBHeavy, rbHeavy],
    [Archetype.WellRounded, wellRounded],
    [Archetype.WRFactory, wrFactory],
]);

export default function Live() {
    const [archetype, setArchetype] = useState<Archetype | ''>('');
    const [qbGrade, setQbGrade] = useState(0);
    const [rbGrade, setRbGrade] = useState(0);
    const [wrGrade, setWrGrade] = useState(0);
    const [teGrade, setTeGrade] = useState(0);
    const [outlooks, setOutlooks] = useState<string[]>(['', '', '']);
    return (
        <div className={styles.container}>
            <LiveInputs
                archetype={archetype}
                setArchetype={setArchetype}
                qbGrade={qbGrade}
                setQbGrade={setQbGrade}
                rbGrade={rbGrade}
                setRbGrade={setRbGrade}
                wrGrade={wrGrade}
                setWrGrade={setWrGrade}
                teGrade={teGrade}
                setTeGrade={setTeGrade}
                outlooks={outlooks}
                setOutlooks={setOutlooks}
            />
            <div className={styles.liveBlueprint}>
                <PositionalGrade
                    position={'QB'}
                    grade={qbGrade}
                    className={styles.qb}
                />
                <PositionalGrade
                    position={'RB'}
                    grade={rbGrade}
                    className={styles.rb}
                />
                <PositionalGrade
                    position={'WR'}
                    grade={wrGrade}
                    className={styles.wr}
                />
                <PositionalGrade
                    position={'TE'}
                    grade={teGrade}
                    className={styles.te}
                />
                {outlooks.map((outlook, idx) => (
                    <Outlook
                        key={idx}
                        outlook={outlook}
                        className={styles[`year${idx + 1}`]}
                    />
                ))}
                {archetype && (
                    <img
                        src={ARCHETYPE_TO_IMAGE.get(archetype)}
                        className={styles.archetype}
                    />
                )}
                <img src={blankLive} />
            </div>
        </div>
    );
}

type PositionalGradeProps = {
    position: string;
    grade: number;
    className?: string;
};

function PositionalGrade({position, grade, className}: PositionalGradeProps) {
    return (
        <div className={`${styles.positionalGrade} ${className || ''}`}>
            <div>{position}</div>
            <div>{grade}/10</div>
        </div>
    );
}

type OutlookProps = {
    outlook: string;
    className?: string;
};

export function Outlook({outlook, className}: OutlookProps) {
    return (
        <div className={`${styles.outlook} ${className || ''}`}>{outlook}</div>
    );
}

type LiveInputsProps = {
    archetype: Archetype | '';
    setArchetype: (archetype: Archetype | '') => void;
    qbGrade: number;
    setQbGrade: (qbGrade: number) => void;
    rbGrade: number;
    setRbGrade: (rbGrade: number) => void;
    wrGrade: number;
    setWrGrade: (wrGrade: number) => void;
    teGrade: number;
    setTeGrade: (teGrade: number) => void;
    outlooks: string[];
    setOutlooks: (outlooks: string[]) => void;
};

function LiveInputs({
    archetype,
    setArchetype,
    qbGrade,
    setQbGrade,
    rbGrade,
    setRbGrade,
    wrGrade,
    setWrGrade,
    teGrade,
    setTeGrade,
    outlooks,
    setOutlooks,
}: LiveInputsProps) {
    function reset() {
        setQbGrade(0);
        setRbGrade(0);
        setWrGrade(0);
        setTeGrade(0);
        setOutlooks(['', '', '']);
        setArchetype('');
    }
    return (
        <div className={styles.inputs}>
            <FormControl className={styles.formControlInput}>
                <InputLabel>Archetype</InputLabel>
                <Select
                    value={archetype}
                    label="Archetype"
                    onChange={(event: SelectChangeEvent) => {
                        setArchetype(event.target.value as Archetype);
                    }}
                >
                    <MenuItem value={''} key={''}>
                        Choose an Archetype:
                    </MenuItem>
                    {Object.values(Archetype).map((arch, idx) => (
                        <MenuItem value={arch} key={idx}>
                            {arch}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <GradeInput position={'QB'} grade={qbGrade} setGrade={setQbGrade} />
            <GradeInput position={'RB'} grade={rbGrade} setGrade={setRbGrade} />
            <GradeInput position={'WR'} grade={wrGrade} setGrade={setWrGrade} />
            <GradeInput position={'TE'} grade={teGrade} setGrade={setTeGrade} />
            {outlooks.map((_, idx) => (
                <FormControl key={idx} className={styles.formControlInput}>
                    <InputLabel>Year {idx + 1}</InputLabel>
                    <Select
                        label={`Year ${idx + 1}`}
                        value={outlooks[idx]}
                        onChange={(event: SelectChangeEvent) => {
                            const newOutlooks = outlooks.slice();
                            newOutlooks[idx] = event.target.value;
                            setOutlooks(newOutlooks);
                        }}
                    >
                        <MenuItem value={''} key={''}>
                            Choose an outlook:
                        </MenuItem>
                        <MenuItem value={'CONTEND'} key={'CONTEND'}>
                            {'CONTEND'}
                        </MenuItem>
                        <MenuItem value={'REBUILD'} key={'REBUILD'}>
                            {'REBUILD'}
                        </MenuItem>

                        <MenuItem value={'RELOAD'} key={'RELOAD'}>
                            {'RELOAD'}
                        </MenuItem>
                    </Select>
                </FormControl>
            ))}
            <Button onClick={reset} variant="outlined">
                Reset
            </Button>
        </div>
    );
}

type GradeInputProps = {
    position: string;
    grade: number;
    setGrade: (grade: number) => void;
};

function GradeInput({position, grade, setGrade}: GradeInputProps) {
    return (
        <FormControl className={styles.formControlInput}>
            <InputLabel>{`${position} Grade`}</InputLabel>
            <Select
                value={grade.toString()}
                label={`${position} Grade`}
                onChange={(event: SelectChangeEvent) => {
                    setGrade(event.target.value as unknown as number);
                }}
            >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((grade, idx) => (
                    <MenuItem value={grade} key={idx}>
                        {grade}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
