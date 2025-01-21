'use client'

interface DebugInfoProps {
  profile: any
}

export function DebugInfo({ profile }: DebugInfoProps) {
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg max-w-lg overflow-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="text-sm">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  )
} 