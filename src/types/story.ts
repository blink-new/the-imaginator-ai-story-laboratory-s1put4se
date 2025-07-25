export interface Premise {
  id: string
  statement: string
  trait: string
  consequence: string
  strength: number
  provability: number
  conflictPotential: number
  philosophicalDepth: number
  examples: string[]
}

export interface Character {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'mentor' | 'ally' | 'threshold_guardian'
  physiology: {
    age: number
    appearance: string
    distinguishingFeatures: string[]
  }
  sociology: {
    background: string
    occupation: string
    education: string
    relationships: string[]
  }
  psychology: {
    motivation: string
    fears: string[]
    flaws: string[]
    strengths: string[]
    moralCode: string
  }
  premise: string
}

export interface Scene {
  id: string
  title: string
  content: string
  position: number
  frameworkBeats: {
    saveTheCat?: string
    heroJourney?: string
    aristotle?: string
    egri?: string
  }
  premiseAdvancement: number
  conflictLevel: number
  characterDevelopments: Record<string, string>
  perspectives: {
    objective: string
    protagonist: string
    antagonist: string
  }
}

export interface StoryProject {
  id: string
  title: string
  premise: Premise
  characters: Character[]
  scenes: Scene[]
  structure: {
    format: 'screenplay' | 'novel' | 'stage_play' | 'tv_series' | 'game'
    acts: number
    totalScenes: number
  }
  health: {
    premiseClarity: number
    structuralIntegrity: number
    characterDepth: number
    pacingEffectiveness: number
    conflictPower: number
    thematicUnity: number
    overall: number
  }
  frameworks: {
    egri: number
    aristotle: number
    saveTheCat: number
    heroJourney: number
  }
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface DecisionPoint {
  id: string
  type: 'premise_selection' | 'character_configuration' | 'scene_choice' | 'plot_structure'
  context: string
  options: DecisionOption[]
  recommendation?: string
}

export interface DecisionOption {
  id: string
  title: string
  description: string
  impact: {
    premise: number
    character: number
    structure: number
    theme: number
  }
  analysis: string
  examples: string[]
}