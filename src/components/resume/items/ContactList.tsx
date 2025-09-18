import { memo } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PublicIcon from "@mui/icons-material/Public";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import type { ContactInfo } from "@/types/Resume.types";

interface ContactListProps {
  contact: ContactInfo;
}

export const ContactList: React.FC<ContactListProps> = memo(({ contact }) => {
  const contactItems = [
    { icon: <EmailIcon />, text: contact.email, href: `mailto:${contact.email}` },
    { icon: <HomeIcon />, text: contact.address, href: "" },
    { icon: <PublicIcon />, text: contact.website, href: contact.website },
    { icon: <GitHubIcon />, text: contact.github, href: contact.github },
    { icon: <LinkedInIcon />, text: contact.linkedin, href: contact.linkedin },
  ];

  return (
    <List>
      {contactItems.map((item, index) => (
        <ListItem key={index} disableGutters sx={{ pb: 0 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={
              item.href ? (
                <Link href={item.href} target="_blank" rel="noopener noreferrer" color="inherit">
                  {item.text}
                </Link>
              ) : (
                item.text
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
});