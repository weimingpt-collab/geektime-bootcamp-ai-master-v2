import type { TurnEntry, Turn, Conversation } from '../types/conversation'

export function parseJSONL(content: string): TurnEntry[] {
  const lines = content.trim().split('\n').filter(line => line.trim())
  const entries: TurnEntry[] = []

  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as TurnEntry
      entries.push(entry)
    } catch {
      console.warn('Failed to parse line:', line.slice(0, 100))
    }
  }

  return entries
}

export function groupIntoTurns(entries: TurnEntry[]): Conversation | null {
  if (entries.length === 0) return null

  const firstEntry = entries[0]
  if (!firstEntry) return null

  const sessionID = firstEntry.sessionID
  const conversationID = firstEntry.conversationID

  const turnsMap = new Map<number, Turn>()

  for (const entry of entries) {
    const turnIndex = entry.turnIndex
    let turn = turnsMap.get(turnIndex)

    if (!turn) {
      turn = { turnIndex }
      turnsMap.set(turnIndex, turn)
    }

    if (entry.type === 'turn_start') {
      turn.input = entry
    } else if (entry.type === 'turn_complete') {
      turn.output = entry
    }
  }

  const turns = Array.from(turnsMap.values()).sort((a, b) => a.turnIndex - b.turnIndex)

  return { sessionID, conversationID, turns }
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatTokens(tokens?: { input: number; output: number; reasoning?: number }): string {
  if (!tokens) return '-'
  const total = tokens.input + tokens.output + (tokens.reasoning || 0)
  return `${total.toLocaleString()} (in: ${tokens.input.toLocaleString()}, out: ${tokens.output.toLocaleString()})`
}
