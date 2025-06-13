import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { HeadButton } from '../components/HeadButton';
import imgGitHub from '../assets/github.png';
import imgLinkedIn from '../assets/linkedin.png';
import imgLocation from '../assets/location.png';
import imgMail from '../assets/mail.png';
import imgMC from '../assets/mc.png';
import imgPhone from '../assets/telephone.png';
import imgWhatsApp from '../assets/whatsapp.png';
import type { PortfolioItemType } from '../types/Portfolio.Types';
import './Portfolio.css';

export const Portfolio: React.FC = () => {

    const portfolioItems = [
        {
            id: 1,
            title: 'Çekmeköy, İstanbul, Türkiye',
            description: '',
            url: 'https://bit.ly/AF-Adrs',
            image: <img src={imgLocation} alt="Çekmeköy, İstanbul, Türkiye" className="head-button-icon" />,
        },
        {
            id: 2,
            title: '(+90) 543 838 09 42',
            description: '',
            url: 'tel:00905438380942',
            image: <img src={imgPhone} alt="Phone" className="head-button-icon" />,
        },
        {
            id: 3,
            title: '(+90) 543 838 09 42',
            description: '',
            url: 'https://wa.me/905438380942',
            image: <img src={imgWhatsApp} alt="WhatsApp" className="head-button-icon" />,
        },
        {
            id: 4,
            title: 'ahmet.fatihoglu.89@gmail.com',
            description: '',
            url: 'mailto:ahmet.fatihoglu.89@gmail.com',
            image: <img src={imgMail} alt="Email" className="head-button-icon" />,
        },
        {
            id: 5,
            title: 'GitHub Profile',
            description: '',
            url: 'https://bit.ly/AF-GtHb',
            image: <img src={imgGitHub} alt="GitHub" className="head-button-icon" />,
        },
        {
            id: 6,
            title: 'Linkedin Profile',
            description: '',
            url: 'https://bit.ly/AF-Lnkdn',
            image: <img src={imgLinkedIn} alt="LinkedIn" className="head-button-icon" />,
        },
        {
            id: 7,
            title: 'Microsoft Certified',
            description: 'Azure Data Engineer Associate - 2023',
            url: 'https://bit.ly/AF-DP203',
            image: <img src={imgMC} alt="Microsoft Certified" className="head-button-icon" />,
        }
    ];
    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h3" color='success' gutterBottom>
                Ahmet Fatihoğlu
            </Typography>
            <Typography variant="h5" color='success' gutterBottom>
                Senior Software Developer
            </Typography>

            <Grid container>
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