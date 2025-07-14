import { Card, CardContent, CardHeader, CardProps, Typography, Box } from '@mui/material'
import { ReactNode } from 'react'

interface GameCardProps extends CardProps {
  title?: string
  subtitle?: string
  headerAction?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

export const GameCard = ({ 
  title, 
  subtitle, 
  headerAction, 
  footer, 
  children, 
  ...props 
}: GameCardProps) => {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
        ...props.sx,
      }}
      {...props}
    >
      {title && (
        <CardHeader
          title={
            <Typography variant="h6" component="h2" fontWeight="bold">
              {title}
            </Typography>
          }
          subheader={subtitle}
          action={headerAction}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '& .MuiCardHeader-subheader': {
              color: 'primary.contrastText',
              opacity: 0.8,
            },
          }}
        />
      )}
      <CardContent sx={{ p: 2 }}>
        {children}
      </CardContent>
      {footer && (
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderTop: 1, borderColor: 'grey.200' }}>
          {footer}
        </Box>
      )}
    </Card>
  )
} 