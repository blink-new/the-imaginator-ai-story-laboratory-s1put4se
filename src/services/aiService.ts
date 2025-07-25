import blink from '../lib/blink'
import { Premise, Character, Scene, DecisionPoint, DecisionOption } from '../types/story'

export class AIService {
  
  // Generate premise options from initial concept
  static async generatePremiseOptions(concept: string): Promise<DecisionPoint> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `As The Imaginator's AI story engine, analyze this concept and generate 5 compelling premise options following Lajos Egri's format: "[Human trait/choice/belief] leads to [inevitable consequence]"

Concept: "${concept}"

For each premise, provide:
1. The premise statement
2. Philosophical analysis of why this matters
3. Dramatic potential (conflict opportunities)
4. Examples from literature/film
5. Unique angle that makes it fresh

Format as JSON with this structure:
{
  "options": [
    {
      "id": "premise_1",
      "title": "Premise Statement",
      "description": "Deep analysis of the premise",
      "impact": {
        "premise": 95,
        "character": 85,
        "structure": 90,
        "theme": 88
      },
      "analysis": "Why this premise creates powerful story potential",
      "examples": ["Example 1", "Example 2"]
    }
  ]
}`,
        model: 'gpt-4o-mini'
      })

      const parsed = JSON.parse(text)
      
      return {
        id: `decision_${Date.now()}`,
        type: 'premise_selection',
        context: `Premise selection for concept: ${concept}`,
        options: parsed.options,
        recommendation: "Choose the premise that resonates most deeply with your vision and offers the richest conflict potential."
      }
    } catch (error) {
      console.error('Error generating premise options:', error)
      // Fallback options
      return {
        id: `decision_${Date.now()}`,
        type: 'premise_selection',
        context: `Premise selection for concept: ${concept}`,
        options: [
          {
            id: 'premise_1',
            title: 'Compassion leads to redemption',
            description: 'A story exploring how genuine empathy can transform both giver and receiver',
            impact: { premise: 90, character: 85, structure: 80, theme: 95 },
            analysis: 'This premise offers rich character development opportunities and universal appeal',
            examples: ['Les Misérables', 'A Christmas Carol']
          },
          {
            id: 'premise_2',
            title: 'Obsession leads to destruction',
            description: 'A cautionary tale about the dangers of single-minded pursuit',
            impact: { premise: 95, character: 90, structure: 85, theme: 88 },
            analysis: 'Creates natural escalation and tragic arc with clear stakes',
            examples: ['Moby Dick', 'Black Swan']
          }
        ]
      }
    }
  }

  // Generate character configurations based on selected premise
  static async generateCharacterOptions(premise: Premise): Promise<DecisionPoint> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `As The Imaginator's character architect, create 4 different character constellation approaches for this premise: "${premise.statement}"

Each approach should include:
1. Protagonist design (3-dimensional Egrian character)
2. Antagonist design (perfect opposition)
3. Supporting cast (2-3 key characters)
4. Relationship dynamics
5. How this configuration proves the premise

Format as JSON with character details including physiology, sociology, and psychology dimensions.`,
        model: 'gpt-4o-mini'
      })

      const parsed = JSON.parse(text)
      
      return {
        id: `decision_${Date.now()}`,
        type: 'character_configuration',
        context: `Character configuration for premise: ${premise.statement}`,
        options: parsed.options || []
      }
    } catch (error) {
      console.error('Error generating character options:', error)
      return {
        id: `decision_${Date.now()}`,
        type: 'character_configuration',
        context: `Character configuration for premise: ${premise.statement}`,
        options: []
      }
    }
  }

  // Generate scene content with Trinity View perspectives
  static async generateScene(
    premise: Premise,
    characters: Character[],
    sceneContext: string,
    position: number
  ): Promise<Scene> {
    try {
      const protagonist = characters.find(c => c.role === 'protagonist')
      const antagonist = characters.find(c => c.role === 'antagonist')

      const { text } = await blink.ai.generateText({
        prompt: `As The Imaginator's scene generator, create a scene that advances the premise: "${premise.statement}"

Context: ${sceneContext}
Position: Scene ${position}
Characters: ${characters.map(c => `${c.name} (${c.role})`).join(', ')}

Generate:
1. Objective narrative (what actually happens)
2. Protagonist's perspective (how ${protagonist?.name} experiences/interprets events)
3. Antagonist's perspective (how ${antagonist?.name} experiences/interprets events)
4. Framework beat analysis (Save the Cat, Hero's Journey, Aristotle)
5. Premise advancement score (1-10)
6. Conflict level (1-10)

Format as JSON with the scene structure.`,
        model: 'gpt-4o-mini'
      })

      const parsed = JSON.parse(text)
      
      return {
        id: `scene_${Date.now()}`,
        title: parsed.title || `Scene ${position}`,
        content: parsed.content || '',
        position,
        frameworkBeats: parsed.frameworkBeats || {},
        premiseAdvancement: parsed.premiseAdvancement || 5,
        conflictLevel: parsed.conflictLevel || 5,
        characterDevelopments: parsed.characterDevelopments || {},
        perspectives: {
          objective: parsed.perspectives?.objective || parsed.content || '',
          protagonist: parsed.perspectives?.protagonist || '',
          antagonist: parsed.perspectives?.antagonist || ''
        }
      }
    } catch (error) {
      console.error('Error generating scene:', error)
      return {
        id: `scene_${Date.now()}`,
        title: `Scene ${position}`,
        content: 'Scene content will be generated here...',
        position,
        frameworkBeats: {},
        premiseAdvancement: 5,
        conflictLevel: 5,
        characterDevelopments: {},
        perspectives: {
          objective: 'Objective view of the scene...',
          protagonist: 'How the protagonist experiences this scene...',
          antagonist: 'How the antagonist interprets these events...'
        }
      }
    }
  }

  // Analyze story health and provide recommendations
  static async analyzeStoryHealth(
    premise: Premise,
    characters: Character[],
    scenes: Scene[]
  ): Promise<{
    analysis: string
    recommendations: string[]
    strengths: string[]
    weaknesses: string[]
  }> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `As The Imaginator's philosophical analysis engine, analyze this story's health:

Premise: "${premise.statement}"
Characters: ${characters.length} (${characters.map(c => c.role).join(', ')})
Scenes: ${scenes.length}

Analyze:
1. Premise clarity and proof progression
2. Character dimensional depth
3. Structural integrity
4. Thematic coherence
5. Conflict escalation

Provide specific recommendations for improvement and identify both strengths and weaknesses.

Format as JSON with analysis, recommendations, strengths, and weaknesses arrays.`,
        model: 'gpt-4o-mini'
      })

      return JSON.parse(text)
    } catch (error) {
      console.error('Error analyzing story health:', error)
      return {
        analysis: 'Story analysis will be generated here...',
        recommendations: ['Continue developing the premise', 'Add more character depth'],
        strengths: ['Strong concept', 'Clear vision'],
        weaknesses: ['Needs more development', 'Requires deeper analysis']
      }
    }
  }

  // Export story to different formats
  static async exportStory(
    premise: Premise,
    characters: Character[],
    scenes: Scene[],
    format: 'screenplay' | 'novel' | 'stage_play' | 'tv_series' | 'game'
  ): Promise<string> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `As The Imaginator's multi-format export engine, convert this story to ${format} format:

Premise: "${premise.statement}"
Characters: ${characters.map(c => `${c.name} (${c.role}): ${c.psychology.motivation}`).join('\n')}

Scenes:
${scenes.map(s => `Scene ${s.position}: ${s.title}\n${s.content}`).join('\n\n')}

Format according to industry standards for ${format}. Include proper formatting, structure, and professional presentation.`,
        model: 'gpt-4o-mini'
      })

      return text
    } catch (error) {
      console.error('Error exporting story:', error)
      return `Export to ${format} format will be generated here...`
    }
  }
}

export default AIService