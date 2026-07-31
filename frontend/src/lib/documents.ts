import type { DocFolderKey, DocumentCategory, ProjectDocument } from '@/types';

/**
 * Suggests a category from the filename. Per §7.1 of the spec the engineer can
 * still override it, so this is a default rather than a decision — which is the
 * combined option the spec leaves open.
 */
export function guessDocCategory(filename: string): DocumentCategory {
  const extension = /\.([a-zA-Z0-9]+)$/.exec(filename)?.[1]?.toLowerCase() ?? '';

  if (extension === 'dwg' || extension === 'dxf') return 'blueprint';
  if (/report|звіт/i.test(filename)) return 'report';
  if (extension === 'pdf' || extension === 'xlsx' || extension === 'xls') return 'report';
  if (/correct|виправ/i.test(filename)) return 'correction';
  return 'documentation';
}

/** Which folder of the Documentation tab a stored document belongs to. */
export function folderOfDocument(document: ProjectDocument): DocFolderKey {
  if (/DBN|ДБН/i.test(document.name)) return 'permits';
  if (document.section.en === 'Finance') return 'finance';
  if (document.section.en === 'Facade' || document.section.en === 'Structures') return 'blueprints';
  return 'other';
}

export function fileExtension(filename: string): string {
  return /\.([a-zA-Z0-9]+)$/.exec(filename)?.[1]?.toUpperCase() ?? 'FILE';
}
