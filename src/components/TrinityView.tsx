import React from 'react'
import { useStoryStore } from '../stores/storyStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Eye, Brain, Sword, ChevronLeft, ChevronRight } from 'lucide-react'

export const TrinityView: React.FC = () => {
  const { 
    currentProject, 
    activePerspective, 
    currentScene, 
    setActivePerspective, 
    setCurrentScene 
  } = useStoryStore()

  if (!currentProject || currentProject.scenes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No Scenes Generated</h3>
          <p className="text-gray-400">Create your first scene to see the Trinity View in action</p>
        </div>
      </div>
    )
  }

  const scene = currentProject.scenes[currentScene]
  const protagonist = currentProject.characters.find(c => c.role === 'protagonist')
  const antagonist = currentProject.characters.find(c => c.role === 'antagonist')

  const perspectives = [
    {
      id: 'objective' as const,
      title: 'Objective Story Laboratory',
      subtitle: 'The "God\'s Eye View"',
      icon: Eye,
      color: 'bg-blue-500/20 border-blue-500/30',
      content: scene.perspectives.objective
    },
    {
      id: 'protagonist' as const,
      title: `${protagonist?.name || 'Protagonist'}'s Mind`,
      subtitle: 'The Subjective Experience',
      icon: Brain,
      color: 'bg-green-500/20 border-green-500/30',
      content: scene.perspectives.protagonist
    },
    {
      id: 'antagonist' as const,
      title: `${antagonist?.name || 'Antagonist'}'s Mind`,
      subtitle: 'The Counter-Narrative',
      icon: Sword,
      color: 'bg-red-500/20 border-red-500/30',
      content: scene.perspectives.antagonist
    }
  ]

  const activePerspectiveData = perspectives.find(p => p.id === activePerspective)

  return (
    <div className="h-full flex flex-col">
      {/* Scene Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentScene(Math.max(0, currentScene - 1))}
            disabled={currentScene === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <h3 className="font-semibold">{scene.title}</h3>
            <p className="text-sm text-gray-400">
              Scene {currentScene + 1} of {currentProject.scenes.length}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentScene(Math.min(currentProject.scenes.length - 1, currentScene + 1))}
            disabled={currentScene === currentProject.scenes.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Premise: {scene.premiseAdvancement}/10
          </Badge>
          <Badge variant="secondary">
            Conflict: {scene.conflictLevel}/10
          </Badge>
        </div>
      </div>

      {/* Perspective Tabs */}
      <div className="flex border-b border-gray-800">
        {perspectives.map((perspective) => {
          const Icon = perspective.icon
          return (
            <button
              key={perspective.id}
              onClick={() => setActivePerspective(perspective.id)}
              className={`flex-1 p-4 text-left transition-colors ${
                activePerspective === perspective.id
                  ? 'bg-gray-800 border-b-2 border-blue-500'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <div>
                  <h4 className="font-medium">{perspective.title}</h4>
                  <p className="text-sm text-gray-400">{perspective.subtitle}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Perspective Content */}
      <div className="flex-1 p-6">
        {activePerspectiveData && (
          <Card className={`h-full ${activePerspectiveData.color}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <activePerspectiveData.icon className="w-6 h-6" />
                {activePerspectiveData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                {activePerspectiveData.content ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {activePerspectiveData.content}
                  </div>
                ) : (
                  <div className="text-gray-400 italic">
                    This perspective will be generated when the scene is created...
                  </div>
                )}
              </div>

              {/* Framework Analysis */}
              {activePerspective === 'objective' && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="font-semibold mb-4">Framework Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(scene.frameworkBeats).map(([framework, beat]) => (
                      beat && (
                        <div key={framework} className="p-3 bg-gray-800/50 rounded-lg">
                          <h5 className="font-medium capitalize mb-1">
                            {framework.replace(/([A-Z])/g, ' $1').trim()}
                          </h5>
                          <p className="text-sm text-gray-300">{beat}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Character Development */}
              {(activePerspective === 'protagonist' || activePerspective === 'antagonist') && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h4 className="font-semibold mb-4">Character Development</h4>
                  {Object.entries(scene.characterDevelopments).map(([charId, development]) => {
                    const character = currentProject.characters.find(c => c.id === charId)
                    return character && development ? (
                      <div key={charId} className="p-3 bg-gray-800/50 rounded-lg">
                        <h5 className="font-medium mb-1">{character.name}</h5>
                        <p className="text-sm text-gray-300">{development}</p>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TrinityView