import {useLeagueIdFromUrl} from '../../hooks/hooks';
import {IconButton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {useState} from 'react';
import {Menu as MuiMenu, MenuItem} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {LEAGUE_ID, NONE_TEAM_ID, TEAM_ID} from '../../consts/urlParams';

export default function Menu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [leagueId] = useLeagueIdFromUrl();
    const navigate = useNavigate();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClick}>
                <MenuIcon />
            </IconButton>
            <MuiMenu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem
                    onClick={() => {
                        navigate(`../league?${LEAGUE_ID}=${leagueId}`);
                    }}
                >
                    League
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate(
                            `../team?${LEAGUE_ID}=${leagueId}&${TEAM_ID}=${NONE_TEAM_ID}`
                        );
                    }}
                >
                    Team
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate(`../player/search?${LEAGUE_ID}=${leagueId}`);
                    }}
                >
                    Player Search
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate(`../nfl?${LEAGUE_ID}=${leagueId}`);
                    }}
                >
                    NFL Depth Charts
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate(`../transactions?${LEAGUE_ID}=${leagueId}`);
                    }}
                >
                    Transaction Log
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate(`../league?${LEAGUE_ID}=`);
                    }}
                >
                    View New League
                </MenuItem>
            </MuiMenu>
        </>
    );
}
