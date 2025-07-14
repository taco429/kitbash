import { Box, Typography, Grid, Card, CardContent, IconButton } from '@mui/material'
import { Security, Speed, Whatshot } from '@mui/icons-material'
import { GameCard, GameButton } from '../../shared'

interface TowerType {
  type: string
  name: string
  cost: number
  damage: number
  range: number
  color: string
}

interface TowerSelectorProps {
  towerTypes: TowerType[]
  selectedTowerType: string | null
  money: number
  onTowerSelect: (towerType: any) => void
  onCancelSelection: () => void
}

export const TowerSelector = ({
  towerTypes,
  selectedTowerType,
  money,
  onTowerSelect,
  onCancelSelection
}: TowerSelectorProps) => {
  const getTowerIcon = (type: string) => {
    switch (type) {
      case 'basic':
        return <Security />
      case 'fast':
        return <Speed />
      case 'heavy':
        return <Whatshot />
      default:
        return <Security />
    }
  }

  return (
    <GameCard title="Towers">
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select a tower type and click on the game board to place it
      </Typography>

      <Grid container spacing={1}>
        {towerTypes.map((towerType) => (
          <Grid item xs={12} key={towerType.type}>
            <Card
              variant={selectedTowerType === towerType.type ? "elevation" : "outlined"}
              sx={{
                cursor: money >= towerType.cost ? 'pointer' : 'not-allowed',
                opacity: money >= towerType.cost ? 1 : 0.5,
                border: selectedTowerType === towerType.type ? 2 : 1,
                borderColor: selectedTowerType === towerType.type ? towerType.color : 'divider'
              }}
              onClick={() => money >= towerType.cost && onTowerSelect(towerType.type)}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{ 
                      bgcolor: towerType.color,
                      color: 'white',
                      '&:hover': { bgcolor: towerType.color }
                    }}
                  >
                    {getTowerIcon(towerType.type)}
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {towerType.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${towerType.cost} • DMG: {towerType.damage} • RNG: {towerType.range}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedTowerType && (
        <Box sx={{ mt: 2 }}>
          <GameButton
            variant="secondary"
            onClick={onCancelSelection}
            fullWidth
            size="small"
          >
            Cancel Selection
          </GameButton>
        </Box>
      )}
    </GameCard>
  )
} 