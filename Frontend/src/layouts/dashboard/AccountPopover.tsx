import { Icon } from '@iconify/react';
import React, { useRef, useState, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import homeFill from '@iconify/icons-eva/home-fill';
import personFill from '@iconify/icons-eva/person-fill';
import settings2Fill from '@iconify/icons-eva/settings-2-fill';
import { alpha } from '@mui/material/styles';
import { Button, Box, Divider, MenuItem, Typography, Avatar, IconButton } from '@mui/material';
import MenuPopover from '@/components/MenuPopover';
import {
    decodeToken,
    clearAuthToken,
    getAuthToken,
    isValidToken
} from '@/setting/utils/tokenUtils';

interface MenuOption {
    label: string;
    icon: any;
    linkTo: string;
}

const DEFAULT_MENU_OPTIONS: MenuOption[] = [
    {
        label: 'Home',
        icon: homeFill,
        linkTo: '/'
    },
    {
        label: 'Profile',
        icon: personFill,
        linkTo: '/profile'
    }
];

const ADMIN_MENU_OPTION: MenuOption = {
    label: 'Settings',
    icon: settings2Fill,
    linkTo: '/admin/settings'
};

const AccountPopover = (): JSX.Element => {
    const anchorRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = getAuthToken();

    const getMenuOptions = (role?: string): MenuOption[] => {
        const options = [...DEFAULT_MENU_OPTIONS];
        if (role === 'admin') {
            options.push(ADMIN_MENU_OPTION);
        }
        return options;
    };

    const user = useMemo(() => {
        if (!token || !isValidToken(token)) {
            return {
                username: 'Guest',
                role: 'User'
            };
        }

        try {
            const decodedToken = decodeToken(token);
            return {
                username: decodedToken?.username || 'User',
                role: decodedToken?.role || 'User',
                photoURL: decodedToken?.picture
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return {
                username: 'User',
                role: 'User'
            };
        }
    }, [token]);

    const menuOptions = getMenuOptions(user.role);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            clearAuthToken();
            navigate('/login', { replace: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IconButton
                ref={anchorRef}
                onClick={handleOpen}
                aria-label="Account menu"
                aria-controls="account-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{
                    padding: 0,
                    width: 44,
                    height: 44,
                    ...(open && {
                        '&:before': {
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            position: 'absolute',
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
                        }
                    })
                }}
            >
                <Avatar
                    src={user.photoURL}
                    alt={`${user.username}'s profile`}
                    imgProps={{ referrerPolicy: 'no-referrer' }}
                />
            </IconButton>

            <MenuPopover
                open={open}
                onClose={handleClose}
                anchorEl={anchorRef.current}
                sx={{ width: 220 }}
            >
                <Box sx={{ my: 1.5, px: 2.5 }}>
                    <Typography variant="subtitle1" noWrap>
                        {user.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                        {user.role}
                    </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                {menuOptions.map((option) => (
                    <MenuItem
                        key={option.label}
                        to={option.linkTo}
                        component={RouterLink}
                        onClick={handleClose}
                        sx={{ typography: 'body2', py: 1, px: 2.5 }}
                    >
                        <Box
                            component={Icon}
                            icon={option.icon}
                            sx={{
                                mr: 2,
                                width: 24,
                                height: 24
                            }}
                        />
                        {option.label}
                    </MenuItem>
                ))}

                <Box sx={{ p: 2, pt: 1.5 }}>
                    <Button
                        fullWidth
                        color="inherit"
                        variant="outlined"
                        onClick={handleLogout}
                        disabled={loading}
                    >
                        {loading ? 'Logging out...' : 'Logout'}
                    </Button>
                </Box>
            </MenuPopover>
        </>
    );
};

export default AccountPopover;
