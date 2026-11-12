import { getSchema, type JSONContent } from '@tiptap/core'
import { Node as ProseMirrorNode, type Schema } from '@tiptap/pm/model'
import { documentExtensions } from './documentExtensions'
import { titleExtensions } from './titleExtensions'

const documentSchema = getSchema(documentExtensions)
const titleSchema = getSchema(titleExtensions)

function toNode(schema: Schema, content: unknown): ProseMirrorNode | null {
  try {
    const node = ProseMirrorNode.fromJSON(schema, content)
    node.check()
    return node.type === schema.topNodeType ? node : null
  } catch {
    return null
  }
}

function toDocumentNode(content: unknown): ProseMirrorNode | null {
  return toNode(documentSchema, content)
}

/** A clean copy of a styled title if it is valid for the title schema, otherwise null. */
export function parseTitleContent(content: unknown): JSONContent | null {
  return toNode(titleSchema, content)?.toJSON() ?? null
}

/**
 * Returns a clean copy of the document if it is valid for the journal schema,
 * otherwise null. Unknown nodes, marks or attributes are rejected or dropped.
 */
export function parseDocument(content: unknown): JSONContent | null {
  return toDocumentNode(content)?.toJSON() ?? null
}

/** Compares documents by content and formatting, ignoring JSON key order. */
export function createDocumentComparer(documents: readonly JSONContent[]) {
  const existingNodes = documents.flatMap(
    (document) => toDocumentNode(document) ?? [],
  )
  return {
    hasEqual(content: JSONContent): boolean {
      const candidateNode = toDocumentNode(content)
      return (
        candidateNode !== null &&
        existingNodes.some((node) => node.eq(candidateNode))
      )
    },
    add(content: JSONContent): void {
      const documentNode = toDocumentNode(content)
      if (documentNode) existingNodes.push(documentNode)
    },
  }
}
