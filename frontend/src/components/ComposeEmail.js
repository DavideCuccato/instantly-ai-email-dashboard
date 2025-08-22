import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
  Menu,
  Alert,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';

const ComposeEmail = ({ open, onClose, onSend }) => {
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [assistantType, setAssistantType] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (field) => (event) => {
    setEmailData({ ...emailData, [field]: event.target.value });
  };

  const handleSend = async () => {
    if (!emailData.to || !emailData.subject) {
      alert('Please fill in To and Subject fields');
      return;
    }
    
    await onSend(emailData);
    handleClose();
  };

  const handleClose = () => {
    setEmailData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: ''
    });
    setAiPrompt('');
    setAssistantType(null);
    setWordCount(null);
    setError(null);
    onClose();
  };

  const handleAiClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAiMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setAssistantType(null);
    setWordCount(null);
    
    try {
      const response = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          to: emailData.to 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              
              if (data.error) {
                throw new Error(data.error);
              }
              
              if (data.assistant_type) {
                setAssistantType(data.assistant_type);
              }
              
              if (data.wordCount !== undefined) {
                setWordCount(data.wordCount);
              }
              
              if ((data.type === 'subject' || data.type === 'final') && data.subject !== undefined) {
                setEmailData(prev => ({ ...prev, subject: data.subject }));
              }
              
              if ((data.type === 'body' || data.type === 'final') && data.body !== undefined) {
                setEmailData(prev => ({ ...prev, body: data.body }));
              }
            } catch (e) {
              if (e.message && e.message !== 'Unexpected end of JSON input') {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setError(error.message || 'Failed to generate email');
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '70vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">New Message</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          {assistantType && (
            <Box sx={{ px: 2, pt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                Generated by:
              </Typography>
              <Chip 
                label={assistantType === 'sales' ? 'Sales Assistant' : 'Follow-up Assistant'} 
                size="small" 
                color={assistantType === 'sales' ? 'primary' : 'secondary'}
                variant="outlined"
              />
              {wordCount !== null && (
                <>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Word count:
                  </Typography>
                  <Chip 
                    label={`${wordCount} words`} 
                    size="small" 
                    color={wordCount <= 40 ? 'success' : 'warning'}
                    variant="outlined"
                  />
                  {assistantType === 'sales' && wordCount <= 40 && (
                    <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                      ✓ Under 40-word limit
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              placeholder="To"
              variant="standard"
              value={emailData.to}
              onChange={handleInputChange('to')}
              sx={{ mb: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              placeholder="CC"
              variant="standard"
              value={emailData.cc}
              onChange={handleInputChange('cc')}
              sx={{ mb: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              placeholder="BCC"
              variant="standard"
              value={emailData.bcc}
              onChange={handleInputChange('bcc')}
              sx={{ mb: 1 }}
              InputProps={{ disableUnderline: true }}
            />
            <TextField
              fullWidth
              placeholder="Subject"
              variant="standard"
              value={emailData.subject}
              onChange={handleInputChange('subject')}
              InputProps={{ disableUnderline: true }}
              sx={{ fontWeight: 500 }}
            />
          </Box>
          
          <Box sx={{ p: 2, position: 'relative', minHeight: '300px' }}>
            <TextField
              fullWidth
              multiline
              placeholder="Compose email"
              variant="standard"
              value={emailData.body}
              onChange={handleInputChange('body')}
              InputProps={{ 
                disableUnderline: true,
                sx: { fontSize: '14px' }
              }}
              minRows={10}
              disabled={isGenerating}
            />
            
            {isGenerating && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)'
              }}>
                <CircularProgress size={40} />
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}>
          <Tooltip title="Generate with AI">
            <Button
              startIcon={<AutoAwesomeIcon />}
              onClick={handleAiClick}
              disabled={isGenerating}
              variant="outlined"
              size="small"
            >
              AI
            </Button>
          </Tooltip>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              variant="contained"
              startIcon={<SendIcon />}
              disabled={isGenerating}
            >
              Send
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAiMenuClose}
        disableAutoFocusItem
      >
        <Box sx={{ p: 2, width: 400 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Describe what the email should be about:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., Meeting request for Tuesday, Follow up on our discussion, Sales pitch for our new product..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            autoFocus
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleAiMenuClose} size="small">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                handleAiMenuClose();
                handleAiGenerate();
              }}
              variant="contained"
              size="small"
              disabled={!aiPrompt.trim()}
            >
              Generate
            </Button>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default ComposeEmail;