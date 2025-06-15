import i18next from 'i18next';
import styled from '@emotion/styled';
import imgGitHub from '../assets/github.png';
import imgLinkedIn from '../assets/linkedin.png';
import imgLocation from '../assets/location.png';
import imgMail from '../assets/mail.png';
import imgMC from '../assets/mc.png';
import imgPhone from '../assets/telephone.png';
import imgWhatsApp from '../assets/whatsapp.png';

const StyledImg = styled('img')({
    width: '3rem',
    height: '3rem',
    verticalAlign: 'middle',
});

export const portfolioItems = () =>[
    {
        "id": 1,
        "title": i18next.t('portfolio.addressTitle'),
        "description": "",
        "url": "https://bit.ly/AF-Adrs",
        "image": <StyledImg src={imgLocation} alt="Çekmeköy, İstanbul, Türkiye" />,
    },
    {
        "id": 2,
        "title": "(+90) 543 838 09 42",
        "description": "",
        "url": "tel:00905438380942",
        "image": <StyledImg src={imgPhone} alt="Phone" />,
    },
    {
        "id": 3,
        "title": "(+90) 543 838 09 42",
        "description": "",
        "url": "https://wa.me/905438380942",
        "image": <StyledImg src={imgWhatsApp} alt="WhatsApp" />,
    },
    {
        "id": 4,
        "title": "ahmet.fatihoglu.89@gmail.com",
        "description": "",
        "url": "mailto:ahmet.fatihoglu.89@gmail.com",
        "image": <StyledImg src={imgMail} alt="Email" />,
    },
    {
        "id": 5,
        "title": i18next.t('portfolio.gitHubProfileTitle'),
        "description": "",
        "url": "https://bit.ly/AF-GtHb",
        "image": <StyledImg src={imgGitHub} alt={i18next.t('portfolio.gitHubProfileTitle')} />,
    },
    {
        "id": 6,
        "title": i18next.t('portfolio.linkedInProfileTitle'),
        "description": "",
        "url": "https://bit.ly/AF-Lnkdn",
        "image": <StyledImg src={imgLinkedIn} alt={i18next.t('portfolio.linkedInProfileTitle')} />,
    },
    {
        "id": 7,
        "title": i18next.t('portfolio.microsoftCertifiedTitle'),
        "description": i18next.t('portfolio.microsoftCertifiedDescription'),
        "url": "https://bit.ly/AF-DP203",
        "image": <StyledImg src={imgMC} alt={i18next.t('portfolio.microsoftCertifiedTitle')} />,
    },
];