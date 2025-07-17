import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Card, Link, Container, Typography, Stack } from '@mui/material';
import AuthLayout from '../layouts/AuthLayout';
import Page from '@/components/Page';
import { RegisterForm } from '@/components/authentication/register';
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

const Register = (): JSX.Element => {
    const { enqueueSnackbar } = useSnackbar();

    const handleRegisterSuccess = () => {
        enqueueSnackbar('Registration successful!', {
            variant: 'success',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            },
            autoHideDuration: 3000
        });
    };

    const handleRegisterError = (error: string) => {
        enqueueSnackbar(error || 'Registration failed. Please try again.', {
            variant: 'error',
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
            },
            autoHideDuration: 5000
        });
    };

    return (
        <RootStyle>
            <AuthLayout>
                Already have an account?&nbsp;
                <Link
                    underline="none"
                    variant="subtitle2"
                    component={RouterLink}
                    to="/login"
                    sx={{ fontWeight: 'bold' }}
                >
                    Login
                </Link>
            </AuthLayout>

            <Container>
                <ContentStyle>
                    <Stack sx={{ mb: 5 }}>
                        <Typography
                            variant="h4"
                            gutterBottom
                            align="center"
                            sx={{ fontWeight: 'bold' }}
                        >
                            REGISTER
                        </Typography>
                    </Stack>
                    <RegisterForm onSuccess={handleRegisterSuccess} onError={handleRegisterError} />
                </ContentStyle>
            </Container>
        </RootStyle>
    );
};

export default Register;
