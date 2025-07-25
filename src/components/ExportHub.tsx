import React, { useState } from 'react'
import { useStoryStore } from '../stores/storyStore'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { 
  FileText, 
  Book, 
  Theater, 
  Tv, 
  Gamepad2,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import { AIService } from '../services/aiService'

export const ExportHub: React.FC = () => {
  const { currentProject } = useStoryStore()
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null)
  const [exportedContent, setExportedContent] = useState<string>('')
  const [isExporting, setIsExporting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const formats = [
    {
      id: 'screenplay',
      title: 'Feature Screenplay',
      description: 'Industry-standard screenplay format (90-120 pages)',
      icon: FileText,
      features: [
        'Professional formatting',
        'Visual storytelling emphasis',
        'Three-act commercial structure',
        'Production-ready annotations'
      ],
      color: 'bg-blue-500/20 border-blue-500/30'
    },
    {
      id: 'novel',
      title: 'Novel Manuscript',
      description: 'Full prose adaptation with rich internal narrative',
      icon: Book,
      features: [
        'Prose style adaptation',
        'Internal monologue expansion',
        'Chapter structure optimization',
        'Literary device integration'
      ],
      color: 'bg-green-500/20 border-green-500/30'
    },
    {
      id: 'stage_play',
      title: 'Stage Play',
      description: 'Theatrical adaptation for live performance',
      icon: Theater,
      features: [
        'Theatrical formatting',
        'Unity of time/place emphasis',
        'Dialogue-driven adaptation',
        'Technical staging notes'
      ],
      color: 'bg-purple-500/20 border-purple-500/30'
    },
    {
      id: 'tv_series',
      title: 'Television Series',
      description: 'Multi-episode series bible and pilot script',
      icon: Tv,
      features: [
        'Season arc planning',
        'Episode breakdown',
        'Character long-term development',
        'Writers\' room documentation'
      ],
      color: 'bg-orange-500/20 border-orange-500/30'
    },
    {
      id: 'game',
      title: 'Interactive/Game Narrative',
      description: 'Branching narrative for interactive media',
      icon: Gamepad2,
      features: [
        'Branching path architecture',
        'Player agency integration',
        'Environmental storytelling',
        'Dialogue trees and quest structure'
      ],
      color: 'bg-red-500/20 border-red-500/30'
    }
  ]

  const handleExport = async (formatId: string) => {
    if (!currentProject) return

    setSelectedFormat(formatId)
    setIsExporting(true)
    setShowPreview(false)

    try {
      const content = await AIService.exportStory(
        currentProject.premise,
        currentProject.characters,
        currentProject.scenes,
        formatId as any
      )
      setExportedContent(content)
      setShowPreview(true)
    } catch (error) {
      console.error('Error exporting story:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = () => {
    if (!exportedContent || !selectedFormat) return

    const format = formats.find(f => f.id === selectedFormat)
    const filename = `${currentProject?.title || 'story'}_${selectedFormat}.txt`
    
    const blob = new Blob([exportedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Story to Export</h3>
          <p className="text-gray-400">Create a story first to access the export features</p>
        </div>
      </div>
    )
  }

  if (showPreview && exportedContent) {
    const format = formats.find(f => f.id === selectedFormat)
    const Icon = format?.icon || FileText

    return (
      <div className="h-full flex flex-col">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">{format?.title} Preview</h2>
              <p className="text-gray-400">{currentProject.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <Eye className="w-4 h-4 mr-2" />
              Back to Formats
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {exportedContent}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Multi-Format Export Engine</h2>
          <p className="text-gray-400">
            Transform your story into any format while maintaining its essential truth and meaning.
            Each export is a complete reimagining optimized for its medium.
          </p>
        </div>

        {/* Story Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Story</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Title</h4>
                <p className="text-gray-300">{currentProject.title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Premise</h4>
                <p className="text-gray-300">{currentProject.premise.statement || 'Not set'}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Progress</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{currentProject.characters.length} Characters</Badge>
                  <Badge variant="secondary">{currentProject.scenes.length} Scenes</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {formats.map((format) => {
            const Icon = format.icon
            const isExportingThis = isExporting && selectedFormat === format.id

            return (
              <Card 
                key={format.id}
                className={`cursor-pointer transition-all hover:scale-105 ${format.color}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    {format.title}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">{format.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {format.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Export Button */}
                    <Button 
                      onClick={() => handleExport(format.id)}
                      disabled={isExporting || currentProject.scenes.length === 0}
                      className="w-full"
                    >
                      {isExportingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating {format.title}...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Export as {format.title}
                        </>
                      )}
                    </Button>

                    {currentProject.scenes.length === 0 && (
                      <p className="text-xs text-gray-500 text-center">
                        Generate scenes first to enable export
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Export Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Export Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Universal Story Core</h4>
                <p className="text-sm text-gray-300">
                  Each format maintains your story's essential premise and character arcs 
                  while adapting to the unique requirements of its medium.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Professional Standards</h4>
                <p className="text-sm text-gray-300">
                  All exports follow industry-standard formatting and conventions, 
                  ready for professional submission or production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ExportHub