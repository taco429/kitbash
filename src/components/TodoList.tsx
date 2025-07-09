import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Box,
  Chip,
  Divider,
} from '@mui/material'
import { Add, Delete, Clear } from '@mui/icons-material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { addTodo, toggleTodo, deleteTodo, clearCompleted } from '../store/todoSlice'

export const TodoList = () => {
  const todos = useAppSelector((state) => state.todos.todos)
  const dispatch = useAppDispatch()
  const [newTodo, setNewTodo] = useState('')

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      dispatch(addTodo(newTodo.trim()))
      setNewTodo('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const activeCount = todos.length - completedCount

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Todo List Demo
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Add new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={handleAddTodo}
            startIcon={<Add />}
            disabled={!newTodo.trim()}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
          <Chip 
            label={`Active: ${activeCount}`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`Completed: ${completedCount}`} 
            color="success" 
            variant="outlined" 
          />
          {completedCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={() => dispatch(clearCompleted())}
              startIcon={<Clear />}
            >
              Clear Completed
            </Button>
          )}
        </Box>

        <Divider />

        <List>
          {todos.map((todo) => (
            <ListItem key={todo.id} dense>
              <Checkbox
                checked={todo.completed}
                onChange={() => dispatch(toggleTodo(todo.id))}
                color="primary"
              />
              <ListItemText
                primary={todo.text}
                sx={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  opacity: todo.completed ? 0.6 : 1,
                }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => dispatch(deleteTodo(todo.id))}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {todos.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No todos yet. Add one above to get started!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
} 