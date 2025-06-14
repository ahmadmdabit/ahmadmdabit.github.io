import React from 'react';
import { Button, Typography, type TypographyProps } from '@mui/material';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import styled from '@emotion/styled';

const StyledButton = styled(Button)({
    width: '100%',
    marginBottom: '0rem',
    textTransform: 'none',
    justifyContent: 'flex-start',
    padding: '1rem',
    borderRadius: '1rem',
    fontSize: '1.3rem',
});

const StyledTypographyDiv = styled((props: TypographyProps<'div'>) => (
    <Typography component="div" {...props} />
))({
    flexGrow: 1,
    fontSize: '1.3rem !important',
    textTransform: 'none',
});


const StyledTypography = styled(Typography)({
    fontSize: '1.3rem !important',
    textTransform: 'none',
});

export const HeadButton: React.FC<PortfolioItemType> = (item: PortfolioItemType) => {
    const handleClick = () => {
        window.open(item.url, '_blank');
    };

    return (
        <StyledButton
            variant="contained"
            color="success"
            startIcon={item.image}
            onClick={handleClick}
        >
            <StyledTypographyDiv variant="h6" color="text.primary">
                <StyledTypography display="block" fontWeight={"bold"}>{item.title}</StyledTypography>
                {item.description && (
                    <StyledTypography display="block" fontWeight={"normal"}>{item.description}</StyledTypography>
                )}
            </StyledTypographyDiv>
        </StyledButton>
    );
}
