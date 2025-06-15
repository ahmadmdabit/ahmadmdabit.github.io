import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from "react-i18next";
import styled from '@emotion/styled';

const StyledDiv = styled('div')({
    position: 'absolute',
    top: '2.3rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#2e7d32',
    borderRadius: '0.5rem',
});

const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();
    const [currentLocale, setCurrentLocale] = React.useState(i18n.language);

    const handleChange = (e: SelectChangeEvent) => {
        setCurrentLocale(e.target.value);
        i18n.changeLanguage(e.target.value);
    };

    return (
        <StyledDiv>
            <Select color='success' size='small'
                value={currentLocale}
                onChange={handleChange}
            >
                <MenuItem value="tr">{t('portfolio.turkish')}</MenuItem>
                <MenuItem value="en">{t('portfolio.english')}</MenuItem>
            </Select>
        </StyledDiv>
    );
};

export default LanguageSwitcher;
