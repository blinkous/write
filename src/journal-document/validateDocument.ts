import { getSchema, type JSONContent } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { documentExtensions } from './documentExtensions'

const documentSchema = getSchema(documentExtensions)

function toDocumentNode(content: unknown): ProseMirrorNode | null {
  try {
    const documentNode = ProseMirrorNode.fromJSON(documentSchema, content)
    documentNode.check()
    return documentNode.type === documentSchema.topNodeType
      ? documentNode
      : null
  } catch {
    return null
  }
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
