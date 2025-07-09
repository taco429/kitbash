import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  ButtonGroup,
  TextField,
  Container
} from '@mui/material'
import { Add, Remove, Refresh } from '@mui/icons-material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { increment, decrement, incrementByAmount, reset } from '../store/counterSlice'

export const CounterPage = () => {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()
  const [incrementAmount, setIncrementAmount] = useState(5)

  const handleIncrementByAmount = () => {
    dispatch(incrementByAmount(incrementAmount))
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Counter Demo
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Demonstrates Redux Toolkit state management with a simple counter
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Typography variant="h1" component="div" color="primary">
              {count}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ButtonGroup variant="contained" size="large">
              <Button
                onClick={() => dispatch(decrement())}
                startIcon={<Remove />}
              >
                Decrement
              </Button>
              <Button
                onClick={() => dispatch(increment())}
                startIcon={<Add />}
              >
                Increment
              </Button>
            </ButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <TextField
              type="number"
              value={incrementAmount}
              onChange={(e) => setIncrementAmount(Number(e.target.value))}
              label="Amount"
              size="small"
              sx={{ width: '120px' }}
            />
            <Button
              variant="outlined"
              onClick={handleIncrementByAmount}
            >
              Add Amount
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => dispatch(reset())}
              startIcon={<Refresh />}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
} 