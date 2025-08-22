import React from "react";
import {
  List,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Divider,
  Paper,
} from "@mui/material";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const EmailList = ({ emails, selectedEmail, onSelectEmail }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "auto",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Inbox
        </Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {emails.map((email) => (
          <React.Fragment key={email.id}>
            <ListItemButton
              selected={selectedEmail?.id === email.id}
              onClick={() => onSelectEmail(email)}
              sx={{
                py: 1.5,
                px: 2,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: selectedEmail?.id === email.id ? 600 : 500,
                        color: "text.primary",
                        mr: 1,
                      }}
                    >
                      {truncateText(email.to, 25)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        flexShrink: 0,
                      }}
                    >
                      {formatDate(email.created_at)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: selectedEmail?.id === email.id ? 600 : 500,
                        color: "text.primary",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      {truncateText(email.subject || "No Subject", 40)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                      }}
                    >
                      {truncateText(email.body, 60)}
                    </Typography>
                  </>
                }
                disableTypography
              />
            </ListItemButton>
            <Divider component="li" />
          </React.Fragment>
        ))}
        {emails.length === 0 && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No emails yet
            </Typography>
          </Box>
        )}
      </List>
    </Paper>
  );
};

export default EmailList;
