import React, { useState, useEffect } from "react";
import {
  Box,
  Fab,
  Grid,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmailList from "../components/EmailList";
import EmailDetail from "../components/EmailDetail";
import ComposeEmail from "../components/ComposeEmail";
import axios from "axios";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#007AFF",
    },
    background: {
      default: "#f5f5f7",
      paper: "#ffffff",
    },
    divider: "#e1e1e3",
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default function Home() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${API_URL}/emails`);
      setEmails(response.data);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    }
  };

  const handleSendEmail = async (emailData) => {
    try {
      const response = await axios.post(`${API_URL}/emails`, emailData);
      setEmails([response.data, ...emails]);
      setSelectedEmail(response.data);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email");
    }
  };

  const handleDeleteEmail = async (id) => {
    try {
      await axios.delete(`${API_URL}/emails/${id}`);
      setEmails(emails.filter((email) => email.id !== id));
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error("Failed to delete email:", error);
      alert("Failed to delete email");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Grid container sx={{ flex: 1 }}>
          <Grid item xs={4} sx={{ height: "100vh", overflow: "hidden" }}>
            <EmailList
              emails={emails}
              selectedEmail={selectedEmail}
              onSelectEmail={setSelectedEmail}
            />
          </Grid>
          <Grid item xs={8} sx={{ height: "100vh", overflow: "hidden" }}>
            <EmailDetail email={selectedEmail} onDelete={handleDeleteEmail} />
          </Grid>
        </Grid>

        <Fab
          color="primary"
          aria-label="compose"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "linear-gradient(45deg, #007AFF 30%, #5AC8FA 90%)",
            boxShadow: "0 3px 5px 2px rgba(0, 122, 255, .3)",
            "&:hover": {
              background: "linear-gradient(45deg, #0051D5 30%, #007AFF 90%)",
            },
          }}
          onClick={() => setComposeOpen(true)}
        >
          <EditIcon />
        </Fab>

        <ComposeEmail
          open={composeOpen}
          onClose={() => setComposeOpen(false)}
          onSend={handleSendEmail}
        />
      </Box>
    </ThemeProvider>
  );
}
