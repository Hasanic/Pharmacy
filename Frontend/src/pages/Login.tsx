import { Link as RouterLink } from 'react-router-dom';
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Card, Stack, Link, Container, Typography } from '@mui/material';
import Page from '@/components/Page';
import { MHidden } from '@/components/@material-extend';
import { LoginForm } from '@/components/authentication/login';
import { LoginPayload } from '@/setting/types/authTypes';
import { useSnackbar } from 'notistack';

const RootStyle = styled(Page)(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex'
    }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: 464,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(12, 0)
}));

const Login = (): JSX.Element => {
    const [auth, setAuth] = useState<LoginPayload>({
        username: '',
        password: ''
    });
    const { enqueueSnackbar } = useSnackbar();

    const handleLoginSuccess = (response: any) => {
        enqueueSnackbar('Login successful', {
            variant: 'success',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            },
            autoHideDuration: 3000
        });
    };

    const handleLoginError = (error: any) => {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        enqueueSnackbar(errorMessage, {
            variant: 'error',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            },
            autoHideDuration: 5000
        });
    };

    return (
        <RootStyle title="Login">
            <Container maxWidth="sm">
                <ContentStyle>
                    <LoginForm
                        setAuth={setAuth}
                        auth={auth}
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                    />

                    {/* Mobile view */}
                    <MHidden width="smUp">
                        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                            Don't have an account?&nbsp;
                            <Link variant="subtitle2" component={RouterLink} to="/register">
                                Register Now
                            </Link>
                        </Typography>
                    </MHidden>

                    {/* Desktop view */}
                    <MHidden width="smDown">
                        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                            Don't have an account?&nbsp;
                            <Link
                                variant="subtitle2"
                                component={RouterLink}
                                to="/register"
                                sx={{ fontWeight: 'bold' }}
                            >
                                Register Now
                            </Link>
                        </Typography>
                    </MHidden>
                </ContentStyle>
            </Container>
        </RootStyle>
    );
};

export default Login;
