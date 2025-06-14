import React from 'react';
import { Button, Typography } from '@mui/material';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import './HeadButton.css';

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
                className='head-button'
            >
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} color='text.primary'>
                    <Typography display="block" fontWeight={'bold'}>{item.title}</Typography>
                    {item.description && (
                        <Typography display="block" fontWeight={'normal'}>{item.description}</Typography>
                    )}
                </Typography>
            </Button>
        </div>
    );
}
