import React, { useState } from 'react'
import { useStoryStore } from '../stores/storyStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { 
  Lightbulb, 
  Users, 
  FileText, 
  Target,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle
} from 'lucide-react'
import { AIService } from '../services/aiService'
import { DatabaseService } from '../services/databaseService'
import { DecisionOption } from '../types/story'

export const DecisionTree: React.FC = () => {
  const { 
    currentProject,
    currentDecision,
    isGenerating,
    setCurrentDecision,
    setIsGenerating,
    updatePremise,
    addCharacter,
    addScene,
    updateStoryHealth
  } = useStoryStore()

  const [conceptInput, setConceptInput] = useState('')
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null)

  const handleStartNewStory = async () => {
    if (!conceptInput.trim()) return

    setIsGenerating(true)
    try {
      const decision = await AIService.generatePremiseOptions(conceptInput)
      setCurrentDecision(decision)
    } catch (error) {
      console.error('Error generating premise options:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectOption = async (option: DecisionOption) => {
    if (!currentProject || !currentDecision) return

    setSelectedOption(option)
    setIsGenerating(true)

    try {
      // Save decision to history
      await DatabaseService.saveDecision(currentProject.id, currentDecision, option)

      if (currentDecision.type === 'premise_selection') {
        // Update premise
        const premise = {
          id: option.id,
          statement: option.title,
          trait: option.title.split(' leads to ')[0] || '',
          consequence: option.title.split(' leads to ')[1] || '',
          strength: option.impact.premise / 20,
          provability: option.impact.structure / 20,
          conflictPotential: option.impact.character / 20,
          philosophicalDepth: option.impact.theme / 20,
          examples: option.examples
        }
        updatePremise(premise)

        // Generate character options
        const characterDecision = await AIService.generateCharacterOptions(premise)
        setCurrentDecision(characterDecision)
      } else if (currentDecision.type === 'character_configuration') {
        // Add characters (simplified for demo)
        const protagonist = {
          id: `char_${Date.now()}_protagonist`,
          name: 'Alex Morgan',
          role: 'protagonist' as const,
          physiology: {
            age: 32,
            appearance: 'Athletic build, determined eyes',
            distinguishingFeatures: ['Scar on left hand', 'Always wears a silver watch']
          },
          sociology: {
            background: 'Middle-class upbringing',
            occupation: 'Detective',
            education: 'Criminal Justice degree',
            relationships: ['Partner Sarah', 'Mentor Captain Rodriguez']
          },
          psychology: {
            motivation: 'Seeking justice for the innocent',
            fears: ['Failing those who depend on them', 'Losing control'],
            flaws: ['Overly trusting', 'Stubborn'],
            strengths: ['Empathetic', 'Persistent', 'Intuitive'],
            moralCode: 'Everyone deserves protection'
          },
          premise: currentProject.premise.statement
        }

        const antagonist = {
          id: `char_${Date.now()}_antagonist`,
          name: 'Marcus Vale',
          role: 'antagonist' as const,
          physiology: {
            age: 45,
            appearance: 'Imposing presence, cold eyes',
            distinguishingFeatures: ['Expensive suits', 'Calculating smile']
          },
          sociology: {
            background: 'Wealthy family',
            occupation: 'Corporate Executive',
            education: 'MBA from prestigious university',
            relationships: ['Board members', 'Political connections']
          },
          psychology: {
            motivation: 'Maintaining power and control',
            fears: ['Exposure', 'Loss of status'],
            flaws: ['Arrogant', 'Ruthless'],
            strengths: ['Strategic mind', 'Charismatic', 'Resourceful'],
            moralCode: 'Success justifies any means'
          },
          premise: `The opposite of ${currentProject.premise.statement}`
        }

        addCharacter(protagonist)
        addCharacter(antagonist)

        // Generate first scene
        const scene = await AIService.generateScene(
          currentProject.premise,
          [protagonist, antagonist],
          'Opening scene that establishes the world and introduces the protagonist',
          1
        )
        addScene(scene)

        updateStoryHealth()
        setCurrentDecision(null)
      }

      // Save project
      await DatabaseService.saveStory(currentProject)
    } catch (error) {
      console.error('Error processing decision:', error)
    } finally {
      setIsGenerating(false)
      setSelectedOption(null)
    }
  }

  const getDecisionIcon = (type: string) => {
    switch (type) {
      case 'premise_selection': return Lightbulb
      case 'character_configuration': return Users
      case 'scene_choice': return FileText
      case 'plot_structure': return Target
      default: return Brain
    }
  }

  const getImpactColor = (value: number) => {
    if (value >= 90) return 'text-green-400'
    if (value >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Initial concept input
  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <Lightbulb className="w-8 h-8 text-yellow-400" />
              Begin Your Story Journey
            </CardTitle>
            <p className="text-gray-400 mt-2">
              Describe your story concept and let The Imaginator guide you through 
              the creative process with AI-powered decision trees.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Story Concept
              </label>
              <Textarea
                placeholder="Describe your story idea, theme, or concept. For example: 'A story about redemption in a corrupt city' or 'What happens when artificial intelligence gains consciousness?'"
                value={conceptInput}
                onChange={(e) => setConceptInput(e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={handleStartNewStory}
              disabled={!conceptInput.trim() || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Premise Options...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Story Premises
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Decision point interface
  if (currentDecision) {
    const DecisionIcon = getDecisionIcon(currentDecision.type)
    
    return (
      <div className="h-full p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Decision Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DecisionIcon className="w-6 h-6 text-blue-400" />
                {currentDecision.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardTitle>
              <p className="text-gray-400">{currentDecision.context}</p>
              {currentDecision.recommendation && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Recommendation:</strong> {currentDecision.recommendation}
                  </p>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currentDecision.options.map((option) => (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedOption?.id === option.id 
                    ? 'ring-2 ring-blue-500 bg-blue-500/10' 
                    : 'hover:bg-gray-800/50'
                }`}
                onClick={() => !isGenerating && handleSelectOption(option)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                  <p className="text-gray-400 text-sm">{option.description}</p>
                </CardHeader>
                <CardContent>
                  {/* Impact Metrics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Premise Strength</span>
                      <div className="flex items-center gap-2">
                        <Progress value={option.impact.premise} className="w-20" />
                        <span className={`text-sm font-medium ${getImpactColor(option.impact.premise)}`}>
                          {option.impact.premise}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Character Potential</span>
                      <div className="flex items-center gap-2">
                        <Progress value={option.impact.character} className="w-20" />
                        <span className={`text-sm font-medium ${getImpactColor(option.impact.character)}`}>
                          {option.impact.character}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Structural Integrity</span>
                      <div className="flex items-center gap-2">
                        <Progress value={option.impact.structure} className="w-20" />
                        <span className={`text-sm font-medium ${getImpactColor(option.impact.structure)}`}>
                          {option.impact.structure}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Thematic Depth</span>
                      <div className="flex items-center gap-2">
                        <Progress value={option.impact.theme} className="w-20" />
                        <span className={`text-sm font-medium ${getImpactColor(option.impact.theme)}`}>
                          {option.impact.theme}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="text-sm text-gray-300 mb-4">
                    {option.analysis}
                  </div>

                  {/* Examples */}
                  {option.examples.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Literary Examples:</h4>
                      <div className="flex flex-wrap gap-2">
                        {option.examples.map((example, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selection State */}
                  {selectedOption?.id === option.id && isGenerating && (
                    <div className="mt-4 flex items-center justify-center p-4 bg-blue-500/10 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2" />
                      <span className="text-blue-300 text-sm">Processing your choice...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // No active decision
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Story Foundation Complete</h3>
        <p className="text-gray-400 mb-6">
          Your story premise and characters are established. 
          Switch to Trinity View to see your story come to life.
        </p>
        <Button onClick={() => setCurrentDecision(null)}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Continue Story Development
        </Button>
      </div>
    </div>
  )
}

export default DecisionTree