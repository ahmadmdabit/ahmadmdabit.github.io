import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { HeadButton } from '../components/HeadButton';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import { portfolioItems } from '../data/portfolioItems';
import styled from '@emotion/styled';

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
    const theme = useTheme();
    const isDark = useMediaQuery('(prefers-color-scheme: dark)');
    const paperBg = isDark
        ? 'rgba(34, 34, 34, 0.95)'
        : 'rgba(255,255,255,0.95)';
    const gradientBg = isDark
        ? 'linear-gradient(180deg,rgb(0, 0, 0) 0%,rgb(15, 88, 0) 100%)'
        : 'linear-gradient(180deg,rgb(255, 255, 255) 0%,rgb(176, 255, 166) 100%)';

    return (
        <GradientBox gradientBg={gradientBg}>
            <StyledPaper paperBg={paperBg}>
                <Typography variant="h3" color="success" fontWeight={700} gutterBottom sx={{ letterSpacing: 2, textAlign: 'center' }}>
                    Ahmet Fatihoğlu
                </Typography>
                <Typography variant="h5" color="success.dark" fontWeight={500} gutterBottom sx={{ textAlign: 'center' }}>
                    Senior Software Developer
                </Typography>
                <StyledDivider />
                <StyledGridContainer container spacing={3} justifyContent="center" alignItems="center">
                    {portfolioItems.map((item: PortfolioItemType) => (
                        <Grid size={{ xs: 12, sm: 10, md: 8 }} key={item.id} display="flex" justifyContent="center">
                            <HeadButton {...item} />
                        </Grid>
                    ))}
                </StyledGridContainer>
            </StyledPaper>
        </GradientBox>
    );
};

export default Portfolio;