"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  CircularProgress,
} from "@mui/material"
import { motion } from "framer-motion"
import {
  IconPlus,
  IconQuestionMark,
  IconUsers,
  IconChartBar,
  IconEye,
  IconShare,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Simple session hook
function useSession() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Session check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading }
}

export default function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalStudents: 0,
    totalAttempts: 0,
  })
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    topic: "",
    difficulty: "medium",
    questionCount: 10,
  })
  const [generating, setGenerating] = useState(false)
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/auth/login?role=teacher")
      return
    }
    if (user) {
      fetchQuizzes()
      fetchStats()
    }
  }, [user, loading, router])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      const data = await response.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const data = await response.json()
      setStats(data.stats || stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleCreateQuiz = async () => {
    if (!newQuiz.title || !newQuiz.topic) {
      alert("Please fill in all required fields")
      return
    }

    setGenerating(true)
    try {
      const response = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuiz),
      })

      if (response.ok) {
        const data = await response.json()
        setCreateDialogOpen(false)
        setNewQuiz({
          title: "",
          topic: "",
          difficulty: "medium",
          questionCount: 10,
        })
        // Redirect to the quiz preview page
        router.push(`/quiz/create/${data.quizId}`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error creating quiz:", error)
      alert("Failed to create quiz. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

   const handleDeleteQuiz = async (quizId) => {
    try {
      await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      })
      fetchQuizzes()
    } catch (error) {
      console.error("Error deleting quiz:", error)
    }
  }

  const copyQuizLink = (quizId) => {
    const link = `${window.location.origin}/quiz/${quizId}`
    navigator.clipboard.writeText(link)
    alert("Quiz link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: "white" }} />
            <Typography variant="h6" sx={{ color: "white", mt: 2 }}>
              Loading dashboard...
            </Typography>
          </Box>
        </Container>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="dashboard-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: "bold",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Teacher Dashboard
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.9)" }}>
              Welcome, {user.name}!
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconQuestionMark size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.totalQuizzes}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Total Quizzes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconUsers size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.totalStudents}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Students Reached
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <IconChartBar size={40} color="white" />
                    <Box ml={2}>
                      <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
                        {stats.totalAttempts}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                        Quiz Attempts
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quizzes List */}
          <Paper
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              p: 3,
              borderRadius: 2,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
                Your Quizzes
              </Typography>
              <Box>
                <Button
                  component={Link}
                  href="/quiz/upload"
                  variant="outlined"
                  startIcon={<IconUpload />}
                  sx={{
                    mr: 2,
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Upload Content
                </Button>
                <Button
                  variant="contained"
                  startIcon={<IconPlus />}
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                    },
                  }}
                >
                  Create Quiz
                </Button>
              </Box>
            </Box>

            <List>
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ color: "white" }}>
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                            Topic: {quiz.topic} • Difficulty: {quiz.difficulty}
                          </Typography>
                          <Box mt={1}>
                            <Chip
                              label={`${quiz.questions?.length || 0} Questions`}
                              size="small"
                              sx={{ mr: 1, backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                            />
                            <Chip
                              label={`${quiz.attempts || 0} Attempts`}
                              size="small"
                              sx={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
                            />
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => router.push(`/quiz/create/${quiz.id}`)} sx={{ color: "white" }}>
                        <IconEye />
                      </IconButton>
                      <IconButton onClick={() => copyQuizLink(quiz.id)} sx={{ color: "white" }}>
                        <IconShare />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteQuiz(quiz.id)} sx={{ color: "white" }}>
                        <IconTrash />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Paper>
        </motion.div>

        {/* Create Quiz Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Quiz Title"
              value={newQuiz.title}
              onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Topic"
              value={newQuiz.topic}
              onChange={(e) => setNewQuiz({ ...newQuiz, topic: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={newQuiz.difficulty}
                onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Number of Questions"
              type="number"
              value={newQuiz.questionCount}
              onChange={(e) => setNewQuiz({ ...newQuiz, questionCount: Number.parseInt(e.target.value) })}
              margin="normal"
              inputProps={{ min: 5, max: 50 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuiz} variant="contained" disabled={generating}>
              {generating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Generating...
                </>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  )
}
