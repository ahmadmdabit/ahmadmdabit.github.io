import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { HeadButton } from '../components/HeadButton';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import { portfolioItems } from '../data/portfolioItems';
import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import ImgSD from './../../public/SD.png';
import ImgTR from './../../public/TR.png';
import ImgPersonalPhotoCircle from './../../public/PersonalPhoto.png';
import ImgPersonalPhoto from './../../public/data/Personal-Photo.jpg';
import ImgDP203 from './../../public/data/Certificate_DP-203.png';
import ImgAPlus from './../../public/data/Certificate_A+.jpg';


const GradientBox = styled('div')<{
    gradientBg: string;
}>(({ gradientBg }) => ({
    padding: '2rem 0',
    minHeight: '100vh',
    background: gradientBg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledPaper = styled('div')<{
    paperBg: string;
}>(({ paperBg }) => ({
    boxShadow: '0 8px 32px 0 rgba(31, 135, 54, 0.15)',
    padding: '2rem',
    borderRadius: '2rem',
    maxWidth: 700,
    width: '100%',
    background: paperBg,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const StyledGridContainer = styled(Grid)({
    maxWidth: '50rem',
});

const StyledDivider = styled(Divider)({
    margin: '1rem 0',
    borderColor: 'transparent',
    width: '100%',
});



export const Portfolio: React.FC = () => {
    const isDark = useMediaQuery('(prefers-color-scheme: dark)');
    const paperBg = isDark
        ? 'rgba(34, 34, 34, 0.95)'
        : 'rgba(255,255,255,0.95)';
    const gradientBg = isDark
        ? 'linear-gradient(180deg,rgb(0, 0, 0) 0%,rgb(15, 88, 0) 100%)'
        : 'linear-gradient(180deg,rgb(255, 255, 255) 0%,rgb(176, 255, 166) 100%)';

    const dp203Title = 'Azure Data Engineer Associate (Microsoft) - 2023 ';
    const aPlusTitle = 'A+ (CompTIA) - 2010';

    return (
        <GradientBox gradientBg={gradientBg}>
            <StyledPaper paperBg={paperBg}>
                <Grid container justifyContent="center" alignItems="center" spacing={80}>
                    <Grid size={{ xs: 6, sm: 4 }} display="flex" justifyContent="center">
                        <Box component="img" height={56} width={56} borderRadius={3} bgcolor="white" src={ImgSD} alt="SD" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }} display="flex" justifyContent="center">
                        <Box component="img" height={56} width={56} borderRadius={3} bgcolor="white" src={ImgTR} alt="TR" />
                    </Grid>
                </Grid>
                <Typography variant="h3" color="success" fontWeight={700} gutterBottom sx={{ letterSpacing: 2, textAlign: 'center' }}>
                    Ahmet Fatihoğlu
                </Typography>
                <Typography variant="h5" color="success.dark" fontWeight={500} gutterBottom sx={{ textAlign: 'center' }}>
                    Senior Software Developer
                </Typography>
                <Box component="img" height={128} width={128} borderRadius={'50%'} src={ImgPersonalPhotoCircle} alt={import.meta.env.VITE_APP_NAME} />
                <StyledDivider />
                <StyledGridContainer container spacing={3} justifyContent="center" alignItems="center">
                    {portfolioItems.map((item: PortfolioItemType) => (
                        <Grid size={{ xs: 12, sm: 10, md: 8 }} key={item.id} display="flex" justifyContent="center">
                            <HeadButton {...item} />
                        </Grid>
                    ))}
                </StyledGridContainer>
                <Box component="img" height={'20rem'} width={'auto'} borderRadius={10} border={"0.5rem solid #000000"} margin={'1.5rem'} src={ImgPersonalPhoto} alt={import.meta.env.VITE_APP_NAME} />
                <Box component="img" height={'auto'} width={'100%'} borderRadius={10} border={"0.5rem solid #000000"} margin={'1.5rem'} src={ImgDP203} alt={dp203Title} />
                <Box component="img" height={'auto'} width={'100%'} borderRadius={10} border={"0.5rem solid #000000"} margin={'1.5rem'} src={ImgAPlus} alt={aPlusTitle} />
            </StyledPaper>
        </GradientBox>
    );
};

export default Portfolio;