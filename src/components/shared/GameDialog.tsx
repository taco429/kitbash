import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogProps, 
  Typography, 
  Box,
  IconButton 
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { ReactNode } from 'react'

interface GameDialogProps extends Omit<DialogProps, 'title'> {
  title?: string
  subtitle?: string
  showCloseButton?: boolean
  actions?: ReactNode
  children: ReactNode
  onClose?: () => void
}

export const GameDialog = ({ 
  title, 
  subtitle, 
  showCloseButton = true, 
  actions, 
  children, 
  onClose,
  ...props 
}: GameDialogProps) => {
  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
      onClose={onClose}
      {...props}
    >
      {title && (
        <DialogTitle 
          sx={{ 
            backgroundColor: 'primary.main', 
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: subtitle ? 1 : 2,
          }}
        >
          <Box>
            <Typography variant="h6" component="h2" fontWeight="bold">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {showCloseButton && onClose && (
            <IconButton
              onClick={onClose}
              sx={{ 
                color: 'primary.contrastText',
                ml: 2,
              }}
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ p: 2, backgroundColor: 'grey.50' }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
} 