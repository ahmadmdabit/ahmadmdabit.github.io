import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { HeadButton } from '../components/HeadButton';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import './Portfolio.css';
import { portfolioItems } from '../data/portfolioItems';

export const Portfolio: React.FC = () => {
    return (
        <Box sx={{ padding: 2 }} textAlign={'center'} className="portfolio-container">
            <Typography variant="h3" color='success' gutterBottom>
                Ahmet Fatihoğlu
            </Typography>
            <Typography variant="h5" color='success' gutterBottom>
                Senior Software Developer
            </Typography>

            <Grid container className="portfolio-items-container">
                {portfolioItems.map((item: PortfolioItemType) => (
                    <Grid size={12} key={item.id}>
                        <HeadButton {...item} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Portfolio;