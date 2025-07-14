import { Card, CardContent, Typography } from '@mui/material'

interface CurrentWordDisplayProps {
  currentWord: string
  currentIndex: number
  totalWords: number
  accentColor?: string
}

export const CurrentWordDisplay = ({
  currentWord,
  currentIndex,
  totalWords,
  accentColor = '#ff5722',
}: CurrentWordDisplayProps) => {
  return (
    <Card elevation={3} sx={{ textAlign: 'center', p: 3, mb: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: accentColor }}>
          Find: {currentWord}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Word {currentIndex + 1} of {totalWords}
        </Typography>
      </CardContent>
    </Card>
  )
} 