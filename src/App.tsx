import React, { useEffect, useState } from 'react'
import { useStoryStore } from './stores/storyStore'
import { DatabaseService } from './services/databaseService'
import blink from './lib/blink'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import TrinityView from './components/TrinityView'
import DecisionTree from './components/DecisionTree'
import ExportHub from './components/ExportHub'
import AnalysisDashboard from './components/AnalysisDashboard'
import { 
  Brain, 
  GitBranch, 
  FileText, 
  BarChart3,
  Plus,
  Folder,
  Trash2,
  User,
  LogOut,
  Sparkles
} from 'lucide-react'

function App() {
  const { 
    currentProject, 
    activeView, 
    setActiveView, 
    setCurrentProject,
    createNewProject
  } = useStoryStore()

  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userStories, setUserStories] = useState<any[]>([])
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectTitle, setNewProjectTitle] = useState('')

  // Initialize auth and load user data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
          setUser(state.user)
          setIsLoading(state.isLoading)
          
          if (state.user && !state.isLoading) {
            // Load user stories
            const stories = await DatabaseService.listUserStories()
            setUserStories(stories)
          }
        })
        
        return unsubscribe
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleCreateNewProject = async () => {
    if (!newProjectTitle.trim()) return

    createNewProject(newProjectTitle)
    setShowNewProjectDialog(false)
    setNewProjectTitle('')
    setActiveView('decision')
  }

  const handleLoadProject = async (projectId: string) => {
    const project = await DatabaseService.loadStory(projectId)
    if (project) {
      setCurrentProject(project)
      setActiveView('trinity')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      await DatabaseService.deleteStory(projectId)
      const stories = await DatabaseService.listUserStories()
      setUserStories(stories)
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setActiveView('trinity')
      }
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
    setCurrentProject(null)
    setUserStories([])
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Initializing The Imaginator...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              The Imaginator
            </CardTitle>
            <p className="text-gray-400">AI Story Laboratory</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-gray-300">
              Revolutionary narrative creation where AI becomes the primary writer 
              and you become the Creative Director.
            </p>
            <Button onClick={() => blink.auth.login()} className="w-full" size="lg">
              <User className="w-4 h-4 mr-2" />
              Sign In to Begin
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const navigationItems = [
    {
      id: 'trinity' as const,
      title: 'Trinity View',
      subtitle: 'Three Perspectives',
      icon: Brain,
      description: 'Objective, Protagonist, and Antagonist views'
    },
    {
      id: 'decision' as const,
      title: 'Decision Tree',
      subtitle: 'Creative Choices',
      icon: GitBranch,
      description: 'AI-guided story development decisions'
    },
    {
      id: 'export' as const,
      title: 'Export Hub',
      subtitle: 'Multi-Format',
      icon: FileText,
      description: 'Screenplay, novel, stage play, TV, game'
    },
    {
      id: 'analysis' as const,
      title: 'Analysis',
      subtitle: 'Story Health',
      icon: BarChart3,
      description: 'Framework compliance and recommendations'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">The Imaginator</h1>
                <p className="text-xs text-gray-400">AI Story Laboratory</p>
              </div>
            </div>

            {currentProject && (
              <div className="flex items-center gap-3">
                <div className="w-px h-8 bg-gray-700" />
                <div>
                  <h2 className="font-semibold">{currentProject.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(currentProject.health.overall)}% Health
                    </Badge>
                    <span>{currentProject.scenes.length} Scenes</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* New Project Button */}
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Story
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Story</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Story Title</label>
                    <Input
                      placeholder="Enter your story title..."
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateNewProject()}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNewProject} disabled={!newProjectTitle.trim()}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Story
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-800 bg-gray-900/50 flex flex-col">
          {/* Navigation */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="font-semibold mb-3">Story Laboratory</h3>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-xs text-gray-400">{item.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-8">{item.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Stories */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Stories</h3>
              <Folder className="w-4 h-4 text-gray-400" />
            </div>
            
            {userStories.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No stories yet</p>
                <p className="text-xs text-gray-500">Create your first story to begin</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userStories.map((story) => (
                  <div
                    key={story.id}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      currentProject?.id === story.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800/50'
                    }`}
                    onClick={() => handleLoadProject(story.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{story.title}</h4>
                        <p className="text-xs text-gray-400 truncate">
                          {story.premise.statement || 'No premise set'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(story.health.overall)}%
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(story.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(story.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-950">
          {activeView === 'trinity' && <TrinityView />}
          {activeView === 'decision' && <DecisionTree />}
          {activeView === 'export' && <ExportHub />}
          {activeView === 'analysis' && <AnalysisDashboard />}
        </div>
      </div>
    </div>
  )
}

export default App