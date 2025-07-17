import React from 'react';
import { Box, Grid, Container, Typography } from '@mui/material';
import Page from '@/components/Page';
import {
    AppNewUsers,
    AppBugReports,
    AppItemOrders,
    AppWeeklySales
} from '@/components/_dashboard/app';
import { decodeToken, getAuthToken, isValidToken } from '@/setting/utils/tokenUtils';

const DashboardApp = (): JSX.Element => {
    const token = getAuthToken();

    const username = React.useMemo(() => {
        if (!token || !isValidToken(token)) {
            return '';
        }

        try {
            const decodedToken = decodeToken(token);
            return decodedToken?.username || '';
        } catch (error) {
            console.error('Error decoding token:', error);
            return '';
        }
    }, [token]);

    return (
        <Page title="Dashboard | Minimal-UI">
            <Container maxWidth="xl">
                <Box sx={{ pb: 5 }}>
                    <Typography variant="h4" component="div">
                        Welcome back {}
                        {username && (
                            <Typography
                                component="span"
                                variant="h4"
                                sx={{ fontWeight: 'bold', display: 'inline' }}
                            >
                                {username}
                            </Typography>
                        )}
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <AppWeeklySales />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <AppNewUsers />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <AppItemOrders />
                    </Grid>
                    {/* <Grid item xs={12} sm={6} md={3}>
                        <AppBugReports />
                    </Grid> */}
                </Grid>
            </Container>
        </Page>
    );
};

export default DashboardApp;
