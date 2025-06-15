import imgGitHub from '../assets/github.png';
import imgLinkedIn from '../assets/linkedin.png';
import imgLocation from '../assets/location.png';
import imgMail from '../assets/mail.png';
import imgMC from '../assets/mc.png';
import imgPhone from '../assets/telephone.png';
import imgWhatsApp from '../assets/whatsapp.png';
// import imgCV from '../assets/cv.png';
import './portfolioItems.css';


export const portfolioItems = [
    {
        "id": 1,
        "title": "Çekmeköy, İstanbul, Türkiye",
        "description": "",
        "url": "https://bit.ly/AF-Adrs",
        "image": <img src={imgLocation} alt="Çekmeköy, İstanbul, Türkiye" className="head-button-icon" />,
    },
    {
        "id": 2,
        "title": "(+90) 543 838 09 42",
        "description": "",
        "url": "tel:00905438380942",
        "image": <img src={imgPhone} alt="Phone" className="head-button-icon" />,
    },
    {
        "id": 3,
        "title": "(+90) 543 838 09 42",
        "description": "",
        "url": "https://wa.me/905438380942",
        "image": <img src={imgWhatsApp} alt="WhatsApp" className="head-button-icon" />,
    },
    {
        "id": 4,
        "title": "ahmet.fatihoglu.89@gmail.com",
        "description": "",
        "url": "mailto:ahmet.fatihoglu.89@gmail.com",
        "image": <img src={imgMail} alt="Email" className="head-button-icon" />,
    },
    {
        "id": 5,
        "title": "GitHub Profile",
        "description": "",
        "url": "https://bit.ly/AF-GtHb",
        "image": <img src={imgGitHub} alt="GitHub" className="head-button-icon" />,
    },
    {
        "id": 6,
        "title": "Linkedin Profile",
        "description": "",
        "url": "https://bit.ly/AF-Lnkdn",
        "image": <img src={imgLinkedIn} alt="LinkedIn" className="head-button-icon" />,
    },
    {
        "id": 7,
        "title": "Microsoft Certified",
        "description": "Azure Data Engineer Associate - 2023",
        "url": "https://bit.ly/AF-DP203",
        "image": <img src={imgMC} alt="Microsoft Certified" className="head-button-icon" />,
    },
    // {
    //     "id": 8,
    //     "title": "CV",
    //     "description": `English - 13.06.2025 - ATS Compliant`,
    //     "url": `/data/Ahmet-FATIHOGLU_Resume_EN_2025-06-13.pdf`,
    //     "image": <img src={imgCV} alt={`${import.meta.env.VITE_APP_NAME} CV - English - 13.06.2025`} className="head-button-icon" />,
    // }
];