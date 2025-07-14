import { Button, ButtonProps } from '@mui/material'
import { ReactNode } from 'react'

interface GameButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  icon?: ReactNode
  loading?: boolean
}

export const GameButton = ({ 
  variant = 'primary', 
  icon, 
  loading = false, 
  children, 
  disabled,
  ...props 
}: GameButtonProps) => {
  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return 'primary'
      case 'secondary':
        return 'secondary'
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'primary'
    }
  }

  return (
    <Button
      variant="contained"
      color={getButtonColor()}
      disabled={loading || disabled}
      startIcon={icon}
      sx={{
        minWidth: 120,
        height: 40,
        fontWeight: 'bold',
        borderRadius: 2,
        textTransform: 'none',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 2,
        },
        transition: 'all 0.2s ease-in-out',
        ...props.sx,
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </Button>
  )
} 