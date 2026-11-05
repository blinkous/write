import { Extension, type CommandProps } from '@tiptap/core'
import {
  Fragment,
  NodeRange,
  type Node as ProseMirrorNode,
} from '@tiptap/pm/model'
import {
  NodeSelection,
  TextSelection,
  type EditorState,
} from '@tiptap/pm/state'

type MoveDirection = 'up' | 'down'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    moveBlocks: {
      /** Swaps the selected blocks with their neighbour, like VS Code's Alt+Up/Down. */
      moveBlocks: (direction: MoveDirection) => ReturnType
    }
  }
}

/* List items move as a whole rather than the paragraph inside them. */
const ITEM_NODE_NAMES = new Set(['listItem', 'taskItem'])

function isMovableParent(parent: ProseMirrorNode): boolean {
  return !ITEM_NODE_NAMES.has(parent.type.name)
}

function hasNeighbour(
  { parent, startIndex, endIndex }: NodeRange,
  direction: MoveDirection,
) {
  return direction === 'up' ? startIndex > 0 : endIndex < parent.childCount
}

function coversAllChildren({ parent, startIndex, endIndex }: NodeRange) {
  return startIndex === 0 && endIndex === parent.childCount
}

/**
 * Finds the sibling blocks to move. When the selection fills its container
 * (e.g. the only paragraph in a quote), the container itself moves instead.
 * At the edge of a container with other children, nothing moves.
 */
function findMovableRange(
  state: EditorState,
  direction: MoveDirection,
): NodeRange | null {
  const { $from, $to } = state.selection
  let range = $from.blockRange($to, isMovableParent)
  while (range) {
    if (hasNeighbour(range, direction)) return range
    if (range.depth === 0 || !coversAllChildren(range)) return null
    range = getEnclosingRange(range)
  }
  return null
}

/** The range one movable level up, i.e. the container holding this range. */
function getEnclosingRange({ $from, $to, depth }: NodeRange): NodeRange {
  let parentDepth = depth - 1
  while (parentDepth > 0 && !isMovableParent($from.node(parentDepth)))
    parentDepth -= 1
  return new NodeRange($from, $to, parentDepth)
}

function moveBlocksCommand(direction: MoveDirection) {
  return ({ state, tr, dispatch }: CommandProps): boolean => {
    const range = findMovableRange(state, direction)
    if (!range) return false
    if (!dispatch) return true

    const { parent, startIndex, endIndex, start, end } = range
    const movedBlocks = state.doc.slice(start, end).content
    const neighbour = parent.child(
      direction === 'up' ? startIndex - 1 : endIndex,
    )
    const shift = direction === 'up' ? -neighbour.nodeSize : neighbour.nodeSize

    if (direction === 'up') {
      tr.replaceWith(
        start - neighbour.nodeSize,
        end,
        movedBlocks.append(Fragment.from(neighbour)),
      )
    } else {
      tr.replaceWith(
        start,
        end + neighbour.nodeSize,
        Fragment.from(neighbour).append(movedBlocks),
      )
    }

    const { selection } = state
    const movedSelection =
      selection instanceof NodeSelection
        ? NodeSelection.create(tr.doc, selection.from + shift)
        : TextSelection.create(
            tr.doc,
            selection.anchor + shift,
            selection.head + shift,
          )
    tr.setSelection(movedSelection).scrollIntoView()
    return true
  }
}

export const MoveBlocks = Extension.create({
  name: 'moveBlocks',

  addCommands() {
    return { moveBlocks: moveBlocksCommand }
  },

  addKeyboardShortcuts() {
    return {
      'Alt-ArrowUp': () => this.editor.commands.moveBlocks('up'),
      'Alt-ArrowDown': () => this.editor.commands.moveBlocks('down'),
    }
  },
})
