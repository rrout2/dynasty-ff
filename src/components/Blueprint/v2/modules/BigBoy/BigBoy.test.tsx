import {render, waitFor} from '@testing-library/react';
import BigBoy from './BigBoy';
import {Roster} from '../../../../../sleeper-api/sleeper-api';
import {HashRouter, Route, Routes} from 'react-router-dom';
import {
    BUYS,
    CORNERSTONES,
    HOLDS,
    PLUS_MAP,
    SELLS,
} from '../../../../../consts/urlParams';
import userEvent from '@testing-library/user-event';
const ROSTER = {
    players: [
        '10235',
        '11620',
        '11629',
        '11631',
        '1479',
        '2133',
        '2216',
        '2374',
        '3225',
        '4037',
        '4137',
        '421',
        '5001',
        '5248',
        '5870',
        '5947',
        '6770',
        '6813',
        '6845',
        '7547',
        '7670',
        '8130',
    ],
} as Roster;

const NUM_ROSTERS = 10;
const TEAM_NAME = 'test Team Name';

const DEFAULT_URL_PARAMS =
    'cornerstones=6770-7547-11631-11620' +
    '&sells=6770-7547-11631&' +
    'buys=10229-5849-4866-10859-11565-11638' +
    '&plusMap=T-F-F-F-F-F' +
    '&holds=6770-7547' +
    '&holdComments=comment+1-comment+2' +
    '&risers=6770-7547-11631' +
    '&fallers=11620-8130-6813' +
    '&riserValues=30-20-10' +
    '&fallerValues=10-20-30' +
    '&posGrades=7-5-5-7-7-10' +
    '&qbRank=9th' +
    '&rbRank=4th' +
    '&wrRank=4th' +
    '&teRank=4th' +
    '&archetype=FUTURE+VALUE' +
    '&otherSettings=extra+settings' +
    '&rookieComments=comment+1-comment+2' +
    '&suggestions=suggestion+1-suggestion+2-suggestion+3-suggestion+4-suggestion+5-suggestion+6';

function wrappedRender(component: JSX.Element) {
    return render(
        <HashRouter basename="/">
            <Routes>
                <Route path="/" element={component} />
            </Routes>
        </HashRouter>
    );
}
describe('BigBoy v2', () => {
    it('can toggle preview', async () => {
        const {getByText, getByLabelText, getAllByText} = await wrappedRender(
            <BigBoy
                roster={ROSTER}
                numRosters={NUM_ROSTERS}
                teamName={TEAM_NAME}
                qbRank={0}
                rbRank={0}
                wrRank={0}
                teRank={0}
                isSuperFlex={true}
                myPicks={[]}
            />
        );
        expect(getAllByText(TEAM_NAME)).toHaveLength(1);
        expect(getByLabelText('Show Preview')).not.toBeChecked();
        await userEvent.click(getByText('Show Preview'));

        expect(getByLabelText('Show Preview')).toBeChecked();
        expect(getAllByText(TEAM_NAME)).toHaveLength(2);
    });

    describe('Settings', () => {
        it('renders settings', async () => {
            const {container} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );
            const settingTiles = container.querySelectorAll('.settingTile');

            expect(settingTiles).toHaveLength(9);
            expect(settingTiles[0]).toHaveTextContent(`${NUM_ROSTERS}`);
        });

        it('can add other settings', async () => {
            const {getByLabelText, container} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );
            const otherSettingsInput = getByLabelText('Other Settings');
            expect(otherSettingsInput).toHaveValue('');
            await userEvent.type(otherSettingsInput, 'test settings content');
            expect(otherSettingsInput).toHaveValue('test settings content');
            expect(
                container.querySelectorAll('.otherSettings')[0]
            ).toHaveTextContent('test settings content');
        });
    });

    it('renders RosterGraphic', async () => {
        const {container} = await wrappedRender(
            <BigBoy
                roster={ROSTER}
                numRosters={NUM_ROSTERS}
                teamName={TEAM_NAME}
                qbRank={0}
                rbRank={0}
                wrRank={0}
                teRank={0}
                isSuperFlex={true}
                myPicks={[]}
            />
        );
        const rosterGraphic = container.querySelector('.rosterGraphic');

        expect(rosterGraphic).toBeInTheDocument();
        expect(rosterGraphic).toHaveTextContent(/rome odunze/i);
        expect(rosterGraphic).toHaveTextContent(/joe burrow/i);
        expect(rosterGraphic).toHaveTextContent(/zack moss/i);
        expect(rosterGraphic).toHaveTextContent(/trey mcbride/i);
    });

    describe('RisersFallers', () => {
        it('renders', async () => {
            const {container} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );
            const risersFallersGraphic = container.querySelector(
                '.risersFallersGraphic'
            );

            expect(risersFallersGraphic).toBeInTheDocument();
            expect(risersFallersGraphic).toHaveTextContent(/J. Taylor/i);
        });
    });

    describe('Saving/Loading', () => {
        it('can save', async () => {
            const {getByText} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );
            expect(window.location.href).not.toContain(CORNERSTONES);

            const saveButton = getByText('Save');
            expect(saveButton).toBeInTheDocument();
            await userEvent.click(saveButton);

            expect(window.location.href).toContain(
                `${CORNERSTONES}=6770-7547-8130-6813`
            );
            expect(window.location.href).toContain(`${SELLS}=6770-7547-8130`);
            expect(window.location.href).toContain(
                `${BUYS}=10229-5849-4866-10859-11565-11638`
            );
            expect(window.location.href).toContain(`${PLUS_MAP}=F-F-F-F-F-F`);
            expect(window.location.href).toContain(`${HOLDS}=6770-7547`);
        });

        it('can update and save', async () => {
            const {getByText, getAllByLabelText} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );

            // Find the first "plus?" switch and ensure it is present in the document
            const plusSwitch = getAllByLabelText('plus?')[0];
            expect(plusSwitch).toBeInTheDocument();

            // Simulate a user clicking the "plus?" switch
            await userEvent.click(plusSwitch);

            // Find the "Save" button and simulate a click to save changes
            const saveButton = getByText('Save');
            await userEvent.click(saveButton);

            expect(window.location.href).toContain(`${PLUS_MAP}=T-F-F-F-F-F`);
        });

        it('can load from url', async () => {
            mockSearchParams();
            const {container} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );

            await waitFor(() => {
                const suggestedMovesGraphic = container.querySelector(
                    '.suggestedMovesGraphic'
                );
                expect(suggestedMovesGraphic).toHaveTextContent(
                    /Rashee Rice \(\+\)/gm
                );
            });

            await waitFor(() => {
                const rosterGraphic = container.querySelector('.rosterGraphic');
                expect(rosterGraphic).toHaveTextContent(/9th \/ 10/gm);
            });

            await waitFor(() => {
                expect(container).toHaveTextContent(/extra settings/gm);
            });
        });

        it('can clear url saved data', async () => {
            mockSearchParams();
            const {getByText} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );

            expect(window.location.href).toContain(CORNERSTONES);

            const clearButton = getByText('Clear');
            await userEvent.click(clearButton);

            expect(window.location.href).not.toContain(CORNERSTONES);
        });

        it('can save rookie pick buys', async () => {
            const YEAR = '2025';
            const {getAllByLabelText, getByText, findByText} =
                await wrappedRender(
                    <BigBoy
                        roster={ROSTER}
                        numRosters={NUM_ROSTERS}
                        teamName={TEAM_NAME}
                        qbRank={0}
                        rbRank={0}
                        wrRank={0}
                        teRank={0}
                        isSuperFlex={true}
                        myPicks={[]}
                    />
                );

            const buyInputs = getAllByLabelText('Buy');
            expect(buyInputs).toHaveLength(6);
            await selectAutocompleteOption(
                buyInputs[0],
                `${YEAR} Rookie Picks`
            );

            expect(
                await findByText(`${YEAR} Rookie Picks`)
            ).toBeInTheDocument();

            const saveButton = getByText('Save');
            await userEvent.click(saveButton);
            expect(window.location.href).toContain(`${BUYS}=RP-${YEAR}`);
        });

        it('can load rookie pick buys', async () => {
            const YEAR = '2025';
            mockSearchParams(DEFAULT_URL_PARAMS.replace('11565', `RP-${YEAR}`));
            const {container} = await wrappedRender(
                <BigBoy
                    roster={ROSTER}
                    numRosters={NUM_ROSTERS}
                    teamName={TEAM_NAME}
                    qbRank={0}
                    rbRank={0}
                    wrRank={0}
                    teRank={0}
                    isSuperFlex={true}
                    myPicks={[]}
                />
            );
            await waitFor(() => {
                expect(container).toHaveTextContent(`${YEAR} Rookie Picks`);
            });
        });
    });
});

const selectAutocompleteOption = async (
    inputElement: HTMLElement,
    optionText: string
) => {
    // Open dropdown
    await userEvent.click(inputElement);
    await userEvent.clear(inputElement);
    await userEvent.type(inputElement, optionText);
    await userEvent.keyboard('{Enter}');
};

export function mockSearchParams(paramsString = DEFAULT_URL_PARAMS) {
    const {pathname} = window.location;
    const url = paramsString ? `${pathname}#/?${paramsString}` : pathname;
    window.history.pushState({}, '', url);
}
