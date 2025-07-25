import { create } from 'zustand'
import { StoryProject, DecisionPoint, Premise, Character, Scene } from '../types/story'

interface StoryState {
  // Current project
  currentProject: StoryProject | null
  
  // UI state
  activeView: 'trinity' | 'decision' | 'export' | 'analysis'
  activePerspective: 'objective' | 'protagonist' | 'antagonist'
  currentScene: number
  
  // Decision system
  currentDecision: DecisionPoint | null
  decisionHistory: DecisionPoint[]
  
  // Loading states
  isGenerating: boolean
  isAnalyzing: boolean
  
  // Actions
  setCurrentProject: (project: StoryProject | null) => void
  setActiveView: (view: 'trinity' | 'decision' | 'export' | 'analysis') => void
  setActivePerspective: (perspective: 'objective' | 'protagonist' | 'antagonist') => void
  setCurrentScene: (scene: number) => void
  setCurrentDecision: (decision: DecisionPoint | null) => void
  addToDecisionHistory: (decision: DecisionPoint) => void
  setIsGenerating: (loading: boolean) => void
  setIsAnalyzing: (loading: boolean) => void
  
  // Story creation actions
  createNewProject: (title: string) => void
  updatePremise: (premise: Premise) => void
  addCharacter: (character: Character) => void
  updateCharacter: (id: string, character: Partial<Character>) => void
  addScene: (scene: Scene) => void
  updateScene: (id: string, scene: Partial<Scene>) => void
  updateStoryHealth: () => void
}

export const useStoryStore = create<StoryState>((set, get) => ({
  // Initial state
  currentProject: null,
  activeView: 'trinity',
  activePerspective: 'objective',
  currentScene: 0,
  currentDecision: null,
  decisionHistory: [],
  isGenerating: false,
  isAnalyzing: false,
  
  // Actions
  setCurrentProject: (project) => set({ currentProject: project }),
  setActiveView: (view) => set({ activeView: view }),
  setActivePerspective: (perspective) => set({ activePerspective: perspective }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setCurrentDecision: (decision) => set({ currentDecision: decision }),
  addToDecisionHistory: (decision) => set((state) => ({ 
    decisionHistory: [...state.decisionHistory, decision] 
  })),
  setIsGenerating: (loading) => set({ isGenerating: loading }),
  setIsAnalyzing: (loading) => set({ isAnalyzing: loading }),
  
  // Story creation actions
  createNewProject: (title) => {
    const newProject: StoryProject = {
      id: `project_${Date.now()}`,
      title,
      premise: {
        id: '',
        statement: '',
        trait: '',
        consequence: '',
        strength: 0,
        provability: 0,
        conflictPotential: 0,
        philosophicalDepth: 0,
        examples: []
      },
      characters: [],
      scenes: [],
      structure: {
        format: 'screenplay',
        acts: 3,
        totalScenes: 0
      },
      health: {
        premiseClarity: 0,
        structuralIntegrity: 0,
        characterDepth: 0,
        pacingEffectiveness: 0,
        conflictPower: 0,
        thematicUnity: 0,
        overall: 0
      },
      frameworks: {
        egri: 0,
        aristotle: 0,
        saveTheCat: 0,
        heroJourney: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: ''
    }
    set({ currentProject: newProject })
  },
  
  updatePremise: (premise) => set((state) => ({
    currentProject: state.currentProject ? {
      ...state.currentProject,
      premise,
      updatedAt: new Date()
    } : null
  })),
  
  addCharacter: (character) => set((state) => ({
    currentProject: state.currentProject ? {
      ...state.currentProject,
      characters: [...state.currentProject.characters, character],
      updatedAt: new Date()
    } : null
  })),
  
  updateCharacter: (id, updates) => set((state) => ({
    currentProject: state.currentProject ? {
      ...state.currentProject,
      characters: state.currentProject.characters.map(char => 
        char.id === id ? { ...char, ...updates } : char
      ),
      updatedAt: new Date()
    } : null
  })),
  
  addScene: (scene) => set((state) => ({
    currentProject: state.currentProject ? {
      ...state.currentProject,
      scenes: [...state.currentProject.scenes, scene],
      structure: {
        ...state.currentProject.structure,
        totalScenes: state.currentProject.scenes.length + 1
      },
      updatedAt: new Date()
    } : null
  })),
  
  updateScene: (id, updates) => set((state) => ({
    currentProject: state.currentProject ? {
      ...state.currentProject,
      scenes: state.currentProject.scenes.map(scene => 
        scene.id === id ? { ...scene, ...updates } : scene
      ),
      updatedAt: new Date()
    } : null
  })),
  
  updateStoryHealth: () => {
    const state = get()
    if (!state.currentProject) return
    
    const project = state.currentProject
    
    // Calculate health metrics based on project data
    const premiseClarity = project.premise.statement ? 
      Math.min(100, project.premise.strength * 20) : 0
    
    const structuralIntegrity = project.scenes.length > 0 ? 
      Math.min(100, (project.scenes.length / 10) * 100) : 0
    
    const characterDepth = project.characters.length > 0 ? 
      Math.min(100, project.characters.length * 25) : 0
    
    const pacingEffectiveness = project.scenes.length > 0 ? 
      project.scenes.reduce((acc, scene) => acc + scene.conflictLevel, 0) / project.scenes.length * 20 : 0
    
    const conflictPower = project.premise.conflictPotential * 20
    
    const thematicUnity = project.premise.philosophicalDepth * 20
    
    const overall = (premiseClarity + structuralIntegrity + characterDepth + 
                    pacingEffectiveness + conflictPower + thematicUnity) / 6
    
    set((state) => ({
      currentProject: state.currentProject ? {
        ...state.currentProject,
        health: {
          premiseClarity,
          structuralIntegrity,
          characterDepth,
          pacingEffectiveness,
          conflictPower,
          thematicUnity,
          overall
        }
      } : null
    }))
  }
}))