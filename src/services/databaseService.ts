import blink from '../lib/blink'
import { StoryProject, Character, Scene, DecisionPoint } from '../types/story'

export class DatabaseService {
  
  // Save story project to database
  static async saveStory(project: StoryProject): Promise<void> {
    try {
      const user = await blink.auth.me()
      
      // Save main story record
      await blink.db.stories.create({
        id: project.id,
        title: project.title,
        premiseStatement: project.premise.statement,
        premiseTrait: project.premise.trait,
        premiseConsequence: project.premise.consequence,
        premiseStrength: project.premise.strength,
        premiseProvability: project.premise.provability,
        premiseConflictPotential: project.premise.conflictPotential,
        premisePhilosophicalDepth: project.premise.philosophicalDepth,
        structureFormat: project.structure.format,
        structureActs: project.structure.acts,
        structureTotalScenes: project.structure.totalScenes,
        healthPremiseClarity: project.health.premiseClarity,
        healthStructuralIntegrity: project.health.structuralIntegrity,
        healthCharacterDepth: project.health.characterDepth,
        healthPacingEffectiveness: project.health.pacingEffectiveness,
        healthConflictPower: project.health.conflictPower,
        healthThematicUnity: project.health.thematicUnity,
        healthOverall: project.health.overall,
        frameworksEgri: project.frameworks.egri,
        frameworksAristotle: project.frameworks.aristotle,
        frameworksSaveCat: project.frameworks.saveTheCat,
        frameworksHeroJourney: project.frameworks.heroJourney,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        userId: user.id
      })

      // Save characters
      for (const character of project.characters) {
        await blink.db.characters.create({
          id: character.id,
          storyId: project.id,
          name: character.name,
          role: character.role,
          physiologyAge: character.physiology.age,
          physiologyAppearance: character.physiology.appearance,
          physiologyDistinguishingFeatures: JSON.stringify(character.physiology.distinguishingFeatures),
          sociologyBackground: character.sociology.background,
          sociologyOccupation: character.sociology.occupation,
          sociologyEducation: character.sociology.education,
          sociologyRelationships: JSON.stringify(character.sociology.relationships),
          psychologyMotivation: character.psychology.motivation,
          psychologyFears: JSON.stringify(character.psychology.fears),
          psychologyFlaws: JSON.stringify(character.psychology.flaws),
          psychologyStrengths: JSON.stringify(character.psychology.strengths),
          psychologyMoralCode: character.psychology.moralCode,
          premise: character.premise,
          userId: user.id
        })
      }

      // Save scenes
      for (const scene of project.scenes) {
        await blink.db.scenes.create({
          id: scene.id,
          storyId: project.id,
          title: scene.title,
          content: scene.content,
          position: scene.position,
          frameworkBeatsSaveCat: scene.frameworkBeats.saveTheCat || '',
          frameworkBeatsHeroJourney: scene.frameworkBeats.heroJourney || '',
          frameworkBeatsAristotle: scene.frameworkBeats.aristotle || '',
          frameworkBeatsEgri: scene.frameworkBeats.egri || '',
          premiseAdvancement: scene.premiseAdvancement,
          conflictLevel: scene.conflictLevel,
          characterDevelopments: JSON.stringify(scene.characterDevelopments),
          perspectiveObjective: scene.perspectives.objective,
          perspectiveProtagonist: scene.perspectives.protagonist,
          perspectiveAntagonist: scene.perspectives.antagonist,
          userId: user.id
        })
      }
    } catch (error) {
      console.error('Error saving story:', error)
      throw error
    }
  }

  // Load story project from database
  static async loadStory(storyId: string): Promise<StoryProject | null> {
    try {
      const user = await blink.auth.me()
      
      // Load main story record
      const stories = await blink.db.stories.list({
        where: { 
          AND: [
            { id: storyId },
            { userId: user.id }
          ]
        }
      })

      if (stories.length === 0) return null
      const story = stories[0]

      // Load characters
      const characters = await blink.db.characters.list({
        where: { 
          AND: [
            { storyId: storyId },
            { userId: user.id }
          ]
        }
      })

      // Load scenes
      const scenes = await blink.db.scenes.list({
        where: { 
          AND: [
            { storyId: storyId },
            { userId: user.id }
          ]
        },
        orderBy: { position: 'asc' }
      })

      // Reconstruct story project
      const project: StoryProject = {
        id: story.id,
        title: story.title,
        premise: {
          id: `premise_${story.id}`,
          statement: story.premiseStatement || '',
          trait: story.premiseTrait || '',
          consequence: story.premiseConsequence || '',
          strength: story.premiseStrength || 0,
          provability: story.premiseProvability || 0,
          conflictPotential: story.premiseConflictPotential || 0,
          philosophicalDepth: story.premisePhilosophicalDepth || 0,
          examples: []
        },
        characters: characters.map(char => ({
          id: char.id,
          name: char.name,
          role: char.role as any,
          physiology: {
            age: char.physiologyAge || 0,
            appearance: char.physiologyAppearance || '',
            distinguishingFeatures: JSON.parse(char.physiologyDistinguishingFeatures || '[]')
          },
          sociology: {
            background: char.sociologyBackground || '',
            occupation: char.sociologyOccupation || '',
            education: char.sociologyEducation || '',
            relationships: JSON.parse(char.sociologyRelationships || '[]')
          },
          psychology: {
            motivation: char.psychologyMotivation || '',
            fears: JSON.parse(char.psychologyFears || '[]'),
            flaws: JSON.parse(char.psychologyFlaws || '[]'),
            strengths: JSON.parse(char.psychologyStrengths || '[]'),
            moralCode: char.psychologyMoralCode || ''
          },
          premise: char.premise || ''
        })),
        scenes: scenes.map(scene => ({
          id: scene.id,
          title: scene.title,
          content: scene.content || '',
          position: scene.position,
          frameworkBeats: {
            saveTheCat: scene.frameworkBeatsSaveCat,
            heroJourney: scene.frameworkBeatsHeroJourney,
            aristotle: scene.frameworkBeatsAristotle,
            egri: scene.frameworkBeatsEgri
          },
          premiseAdvancement: scene.premiseAdvancement || 0,
          conflictLevel: scene.conflictLevel || 0,
          characterDevelopments: JSON.parse(scene.characterDevelopments || '{}'),
          perspectives: {
            objective: scene.perspectiveObjective || '',
            protagonist: scene.perspectiveProtagonist || '',
            antagonist: scene.perspectiveAntagonist || ''
          }
        })),
        structure: {
          format: story.structureFormat as any || 'screenplay',
          acts: story.structureActs || 3,
          totalScenes: story.structureTotalScenes || 0
        },
        health: {
          premiseClarity: story.healthPremiseClarity || 0,
          structuralIntegrity: story.healthStructuralIntegrity || 0,
          characterDepth: story.healthCharacterDepth || 0,
          pacingEffectiveness: story.healthPacingEffectiveness || 0,
          conflictPower: story.healthConflictPower || 0,
          thematicUnity: story.healthThematicUnity || 0,
          overall: story.healthOverall || 0
        },
        frameworks: {
          egri: story.frameworksEgri || 0,
          aristotle: story.frameworksAristotle || 0,
          saveTheCat: story.frameworksSaveCat || 0,
          heroJourney: story.frameworksHeroJourney || 0
        },
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt),
        userId: story.userId
      }

      return project
    } catch (error) {
      console.error('Error loading story:', error)
      return null
    }
  }

  // List all user stories
  static async listUserStories(): Promise<StoryProject[]> {
    try {
      const user = await blink.auth.me()
      
      const stories = await blink.db.stories.list({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' }
      })

      return stories.map(story => ({
        id: story.id,
        title: story.title,
        premise: {
          id: `premise_${story.id}`,
          statement: story.premiseStatement || '',
          trait: story.premiseTrait || '',
          consequence: story.premiseConsequence || '',
          strength: story.premiseStrength || 0,
          provability: story.premiseProvability || 0,
          conflictPotential: story.premiseConflictPotential || 0,
          philosophicalDepth: story.premisePhilosophicalDepth || 0,
          examples: []
        },
        characters: [],
        scenes: [],
        structure: {
          format: story.structureFormat as any || 'screenplay',
          acts: story.structureActs || 3,
          totalScenes: story.structureTotalScenes || 0
        },
        health: {
          premiseClarity: story.healthPremiseClarity || 0,
          structuralIntegrity: story.healthStructuralIntegrity || 0,
          characterDepth: story.healthCharacterDepth || 0,
          pacingEffectiveness: story.healthPacingEffectiveness || 0,
          conflictPower: story.healthConflictPower || 0,
          thematicUnity: story.healthThematicUnity || 0,
          overall: story.healthOverall || 0
        },
        frameworks: {
          egri: story.frameworksEgri || 0,
          aristotle: story.frameworksAristotle || 0,
          saveTheCat: story.frameworksSaveCat || 0,
          heroJourney: story.frameworksHeroJourney || 0
        },
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt),
        userId: story.userId
      }))
    } catch (error) {
      console.error('Error listing stories:', error)
      return []
    }
  }

  // Save decision to history
  static async saveDecision(storyId: string, decision: DecisionPoint, chosenOption: any): Promise<void> {
    try {
      const user = await blink.auth.me()
      
      await blink.db.decisionHistory.create({
        id: `decision_${Date.now()}`,
        storyId,
        decisionType: decision.type,
        context: decision.context,
        chosenOptionId: chosenOption.id,
        chosenOptionTitle: chosenOption.title,
        chosenOptionDescription: chosenOption.description,
        impactPremise: chosenOption.impact?.premise || 0,
        impactCharacter: chosenOption.impact?.character || 0,
        impactStructure: chosenOption.impact?.structure || 0,
        impactTheme: chosenOption.impact?.theme || 0,
        userId: user.id
      })
    } catch (error) {
      console.error('Error saving decision:', error)
    }
  }

  // Delete story
  static async deleteStory(storyId: string): Promise<void> {
    try {
      const user = await blink.auth.me()
      
      // Delete main story record (cascades to characters and scenes)
      await blink.db.stories.delete(storyId)
    } catch (error) {
      console.error('Error deleting story:', error)
      throw error
    }
  }
}

export default DatabaseService