import React, { useState, useEffect } from 'react'
import { useStoryStore } from '../stores/storyStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Target,
  Users,
  Zap,
  RefreshCw,
  Lightbulb
} from 'lucide-react'
import { AIService } from '../services/aiService'

export const AnalysisDashboard: React.FC = () => {
  const { currentProject, isAnalyzing, setIsAnalyzing, updateStoryHealth } = useStoryStore()
  const [analysis, setAnalysis] = useState<{
    analysis: string
    recommendations: string[]
    strengths: string[]
    weaknesses: string[]
  } | null>(null)

  useEffect(() => {
    if (currentProject) {
      updateStoryHealth()
    }
  }, [currentProject, updateStoryHealth])

  const handleAnalyzeStory = async () => {
    if (!currentProject) return

    setIsAnalyzing(true)
    try {
      const result = await AIService.analyzeStoryHealth(
        currentProject.premise,
        currentProject.characters,
        currentProject.scenes
      )
      setAnalysis(result)
    } catch (error) {
      console.error('Error analyzing story:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Story to Analyze</h3>
          <p className="text-gray-400">Create a story first to access the analysis dashboard</p>
        </div>
      </div>
    )
  }

  const healthMetrics = [
    {
      name: 'Premise Clarity',
      value: currentProject.health.premiseClarity,
      icon: Target,
      description: 'How clearly the story proves its central premise'
    },
    {
      name: 'Structural Integrity',
      value: currentProject.health.structuralIntegrity,
      icon: BarChart3,
      description: 'Adherence to narrative frameworks and pacing'
    },
    {
      name: 'Character Depth',
      value: currentProject.health.characterDepth,
      icon: Users,
      description: 'Three-dimensional character development'
    },
    {
      name: 'Pacing Effectiveness',
      value: currentProject.health.pacingEffectiveness,
      icon: Zap,
      description: 'Rhythm and momentum of story progression'
    },
    {
      name: 'Conflict Power',
      value: currentProject.health.conflictPower,
      icon: TrendingUp,
      description: 'Strength and escalation of dramatic conflict'
    },
    {
      name: 'Thematic Unity',
      value: currentProject.health.thematicUnity,
      icon: Brain,
      description: 'Coherence of philosophical and thematic elements'
    }
  ]

  const frameworkScores = [
    { name: 'Egri (Premise-Driven)', value: currentProject.frameworks.egri, color: 'bg-blue-500' },
    { name: 'Aristotle (Classical)', value: currentProject.frameworks.aristotle, color: 'bg-green-500' },
    { name: 'Save the Cat!', value: currentProject.frameworks.saveTheCat, color: 'bg-yellow-500' },
    { name: 'Hero\'s Journey', value: currentProject.frameworks.heroJourney, color: 'bg-purple-500' }
  ]

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-400'
    if (value >= 60) return 'text-yellow-400'
    if (value >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getHealthStatus = (value: number) => {
    if (value >= 80) return { icon: CheckCircle, text: 'Excellent', color: 'text-green-400' }
    if (value >= 60) return { icon: TrendingUp, text: 'Good', color: 'text-yellow-400' }
    if (value >= 40) return { icon: AlertTriangle, text: 'Needs Work', color: 'text-orange-400' }
    return { icon: AlertTriangle, text: 'Critical', color: 'text-red-400' }
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Story Analysis Dashboard</h2>
            <p className="text-gray-400">
              Real-time analysis of your story's health across all narrative frameworks
            </p>
          </div>
          <Button onClick={handleAnalyzeStory} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Deep Analysis
              </>
            )}
          </Button>
        </div>

        {/* Overall Health Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              Overall Story Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getHealthColor(currentProject.health.overall)}`}>
                  {Math.round(currentProject.health.overall)}%
                </div>
                <div className="text-sm text-gray-400">Overall Score</div>
              </div>
              <div className="flex-1">
                <Progress value={currentProject.health.overall} className="h-3" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Critical</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="text-center">
                {(() => {
                  const status = getHealthStatus(currentProject.health.overall)
                  const StatusIcon = status.icon
                  return (
                    <div className={status.color}>
                      <StatusIcon className="w-8 h-8 mx-auto mb-1" />
                      <div className="text-sm">{status.text}</div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon
            const status = getHealthStatus(metric.value)
            const StatusIcon = status.icon

            return (
              <Card key={metric.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      {metric.name}
                    </div>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getHealthColor(metric.value)}`}>
                        {Math.round(metric.value)}%
                      </span>
                      <Badge variant="secondary" className={status.color}>
                        {status.text}
                      </Badge>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <p className="text-xs text-gray-400">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Framework Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Framework Compliance</CardTitle>
            <p className="text-gray-400 text-sm">
              How well your story aligns with major narrative frameworks
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frameworkScores.map((framework) => (
                <div key={framework.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{framework.name}</div>
                  <div className="flex-1">
                    <Progress value={framework.value} className="h-2" />
                  </div>
                  <div className="w-12 text-right text-sm font-medium">
                    {Math.round(framework.value)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300">{analysis.analysis}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Specific Actions:</h4>
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Story Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Story Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {currentProject.characters.length}
                </div>
                <div className="text-sm text-gray-400">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {currentProject.scenes.length}
                </div>
                <div className="text-sm text-gray-400">Scenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {currentProject.structure.acts}
                </div>
                <div className="text-sm text-gray-400">Acts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {currentProject.structure.format.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400">Format</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalysisDashboard