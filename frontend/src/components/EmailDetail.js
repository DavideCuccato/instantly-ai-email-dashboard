import React from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import ForwardIcon from "@mui/icons-material/Forward";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const EmailDetail = ({ email, onDelete }) => {
  if (!email) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select an email to view
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        overflow: "auto",
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, flex: 1, mr: 2 }}>
            {email.subject || "No Subject"}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" color="default">
              <ReplyIcon />
            </IconButton>
            <IconButton size="small" color="default">
              <ForwardIcon />
            </IconButton>
            <IconButton
              size="small"
              color="default"
              onClick={() => onDelete(email.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
              To:
            </Typography>
            <Chip
              label={email.to}
              size="small"
              variant="outlined"
              sx={{ borderRadius: "4px" }}
            />
          </Box>

          {email.cc && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                CC:
              </Typography>
              <Chip
                label={email.cc}
                size="small"
                variant="outlined"
                sx={{ borderRadius: "4px" }}
              />
            </Box>
          )}

          {email.bcc && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>
                BCC:
              </Typography>
              <Chip
                label={email.bcc}
                size="small"
                variant="outlined"
                sx={{ borderRadius: "4px" }}
              />
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {formatDate(email.created_at)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 1,
            minHeight: "300px",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {email.body || "No content"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmailDetail;
