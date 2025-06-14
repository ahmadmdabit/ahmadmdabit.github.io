import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { HeadButton } from '../components/HeadButton';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import { portfolioItems } from '../data/portfolioItems';
import styled from '@emotion/styled';
import Box, { type BoxProps } from '@mui/material/Box';
import ImgSD from './../../public/SD.png';
import ImgTR from './../../public/TR.png';
import ImgPersonalPhotoCircle from './../../public/PersonalPhoto.png';
import ImgPersonalPhoto from './../../public/data/Personal-Photo.jpg';
import ImgDP203 from './../../public/data/Certificate_DP-203.png';
import ImgAPlus from './../../public/data/Certificate_A+.jpg';
import { css } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';


const theme = createTheme({
    palette: {
        primary: {
            main: '#198754',
        },
        secondary: {
            main: '#176F28',
        },
        background: {
            default: '#F5F5F5',
        },
        text: {
            primary: '#000000',
            secondary: '#4F4F4F',
        },
    },
});

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

const hoverEffect = css`
  &:hover {
    transform: scale(1.05);
  }
`;

const StyledImageBoxIcon = styled((props: BoxProps<'img'>) => (
    <Box component="img" {...props} />
))({
    borderRadius: '0.6rem',
    backgroundColor: 'rgba(255, 255, 255, 1.0)',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.8)',
    },
});

const StyledImageBox = styled((props: BoxProps<'img'>) => (
    <Box component="img" {...props} />
))({
    borderRadius: '2rem',
    border: '0.5rem solid rgba(0, 0, 0, 1.0)',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.3s',
    transitionTimingFunction: 'ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.8)',
    },
});

const StyledTypography = styled(Typography)`
  text-align: center;
  letter-spacing: 2px;
  font-weight: bold;
  color:rgb(25, 135, 43);
`;

const StyledGridItem = styled(Grid)`
  display: flex;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  ${hoverEffect}
`;



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
        <ThemeProvider theme={theme}>
            <GradientBox gradientBg={gradientBg}>
                <StyledPaper paperBg={paperBg}>
                    <Grid container justifyContent="center" alignItems="center" spacing={80}>
                        <StyledGridItem size={{ xs: 6, sm: 4 }}>
                            <StyledImageBoxIcon height={56} width={56} src={ImgSD} alt="SD" />
                        </StyledGridItem>
                        <StyledGridItem size={{ xs: 6, sm: 4 }}>
                            <StyledImageBoxIcon height={56} width={56} src={ImgTR} alt="TR" />
                        </StyledGridItem>
                    </Grid>
                    <StyledTypography variant="h3" gutterBottom>
                        Ahmet Fatihoğlu
                    </StyledTypography>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        Senior Software Developer
                    </Typography>
                    <Box component="img" height={128} width={128} borderRadius={'50%'} src={ImgPersonalPhotoCircle} alt={import.meta.env.VITE_APP_NAME} />
                    <StyledDivider />
                    <StyledGridContainer container spacing={3} justifyContent="center" alignItems="center">
                        {portfolioItems.map((item: PortfolioItemType) => (
                            <StyledGridItem size={{ xs: 12, sm: 10, md: 8 }} key={item.id}>
                                <HeadButton {...item} />
                            </StyledGridItem>
                        ))}
                    </StyledGridContainer>
                    <StyledImageBox height={'20rem'} width={'auto'} margin={'1.5rem 0 0 0'} src={ImgPersonalPhoto} alt={import.meta.env.VITE_APP_NAME} />
                    <StyledImageBox height={'auto'} width={'100%'} margin={'1.5rem'} src={ImgDP203} alt={dp203Title} />
                    <StyledImageBox height={'auto'} width={'100%'} margin={'1.5rem'} src={ImgAPlus} alt={aPlusTitle} />
                </StyledPaper>
            </GradientBox>
        </ThemeProvider>
    );
};

export default Portfolio;