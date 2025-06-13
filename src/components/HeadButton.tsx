import React from 'react';
import { Button, Card, CardHeader, Typography } from '@mui/material';
import type { PortfolioItemType } from '../types/Portfolio.Types';

export const HeadButton: React.FC<PortfolioItemType> = (item: PortfolioItemType) => {

    const handleClick = () => {
        window.open(item.url, '_blank');
    };

    return (
        <div>
            <Button
                variant="contained"
                color="success"
                startIcon={item.image}
                onClick={handleClick}
                sx={{ margin: '16px' }}
            >
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <span style={{"display": "block"}}>{item.title}</span>
                    {item.description}
                </Typography>
            </Button>
        </div>
    );
}
