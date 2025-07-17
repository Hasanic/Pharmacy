import React, { useEffect, useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar } from '@mui/material';
import Logo from '@/components/Logo';
import Scrollbar from '@/components/Scrollbar';
import NavSection from '@/components/NavSection';
import { MHidden } from '@/components/@material-extend';
import sidebarConfig from './SidebarConfig';
import { decodeToken, getAuthToken, isValidToken } from '@/setting/utils/tokenUtils';

const DRAWER_WIDTH = 280;

const RootStyle = styled('div')(({ theme }) => ({
    [theme.breakpoints.up('lg')]: {
        flexShrink: 0,
        width: DRAWER_WIDTH
    }
}));

const AccountStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5),
    backgroundColor: theme.palette.grey[200]
}));

interface Props {
    isOpenSidebar?: boolean;
    onCloseSidebar?: () => void;
}

const DashboardSidebar = (props: Props): JSX.Element => {
    const { isOpenSidebar, onCloseSidebar } = props;
    const { pathname } = useLocation();
    const token = getAuthToken();

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

    useEffect(() => {
        if (isOpenSidebar) {
            onCloseSidebar?.();
        }
    }, [pathname]);

    const renderContent = (
        <Scrollbar
            sx={{
                height: '100%',
                '& .simplebar-content': { height: '100%', display: 'flex', flexDirection: 'column' }
            }}
        >
            <Box sx={{ px: 2.5, py: 3 }}>
                <Box component={RouterLink} to="/" sx={{ display: 'inline-flex' }}>
                    <Logo />
                </Box>
            </Box>

            <Box sx={{ mb: 5, mx: 2.5 }}>
                <Link underline="none" component={RouterLink} to="#">
                    <AccountStyle>
                        <Avatar
                            src={user.photoURL}
                            alt={`${user.username}'s profile`}
                            imgProps={{ referrerPolicy: 'no-referrer' }}
                        />
                        <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                                {user.username}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {user.role}
                            </Typography>
                        </Box>
                    </AccountStyle>
                </Link>
            </Box>

            <NavSection navConfig={sidebarConfig} />

            <Box sx={{ flexGrow: 1 }} />
        </Scrollbar>
    );

    return (
        <RootStyle>
            <MHidden width="lgUp">
                <Drawer
                    open={isOpenSidebar}
                    onClose={onCloseSidebar}
                    PaperProps={{
                        sx: { width: DRAWER_WIDTH }
                    }}
                >
                    {renderContent}
                </Drawer>
            </MHidden>

            <MHidden width="lgDown">
                <Drawer
                    open
                    variant="persistent"
                    PaperProps={{
                        sx: {
                            width: DRAWER_WIDTH,
                            bgcolor: 'background.default'
                        }
                    }}
                >
                    {renderContent}
                </Drawer>
            </MHidden>
        </RootStyle>
    );
};

export default DashboardSidebar;
