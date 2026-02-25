'use client';

import { useRef, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  rows?: number;
}

type ToolDef =
  | { type: 'divider' }
  | {
      label: React.ReactNode;
      title: string;
      className?: string;
      /* what the tool inserts ─ either wrap-style or line-prefix */
      mode: 'wrap';
      before: string;
      after?: string;
    }
  | {
      label: React.ReactNode;
      title: string;
      className?: string;
      mode: 'line';
      prefix: string;
    };

/* ------------------------------------------------------------------ */
/*  Static tool definitions (no closures over refs/state)             */
/* ------------------------------------------------------------------ */
const TOOLS: ToolDef[] = [
  // ── Text formatting ────────────────────────────────────────────
  { label: 'B', title: 'Bold (Ctrl+B)', mode: 'wrap', before: '**', after: '**', className: 'font-bold' },
  { label: 'I', title: 'Italic (Ctrl+I)', mode: 'wrap', before: '*', after: '*', className: 'italic' },
  { label: 'U', title: 'Underline (Ctrl+U)', mode: 'wrap', before: '<u>', after: '</u>', className: 'underline' },
  { label: 'S', title: 'Strikethrough', mode: 'wrap', before: '~~', after: '~~', className: 'line-through' },
  { label: (<span className="text-xs">x<sup>2</sup></span>), title: 'Superscript', mode: 'wrap', before: '<sup>', after: '</sup>' },
  { label: (<span className="text-xs">x<sub>2</sub></span>), title: 'Subscript', mode: 'wrap', before: '<sub>', after: '</sub>' },
  { type: 'divider' },

  // ── Headings ───────────────────────────────────────────────────
  { label: 'H1', title: 'Heading 1', mode: 'line', prefix: '# ', className: 'text-xs font-bold' },
  { label: 'H2', title: 'Heading 2', mode: 'line', prefix: '## ', className: 'text-xs font-bold' },
  { label: 'H3', title: 'Heading 3', mode: 'line', prefix: '### ', className: 'text-xs font-bold' },
  { label: 'H4', title: 'Heading 4', mode: 'line', prefix: '#### ', className: 'text-xs font-semibold' },
  { type: 'divider' },

  // ── Alignment ──────────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" /></svg>),
    title: 'Align Left', mode: 'wrap', before: '<div align="left">\n', after: '\n</div>',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 10h10M4 14h16M7 18h10" /></svg>),
    title: 'Align Center', mode: 'wrap', before: '<div align="center">\n', after: '\n</div>',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 10h10M4 14h16M10 18h10" /></svg>),
    title: 'Align Right', mode: 'wrap', before: '<div align="right">\n', after: '\n</div>',
  },
  { type: 'divider' },

  // ── Lists ──────────────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /><circle cx="1.5" cy="6" r="1" fill="currentColor" /><circle cx="1.5" cy="10" r="1" fill="currentColor" /><circle cx="1.5" cy="14" r="1" fill="currentColor" /></svg>),
    title: 'Bullet List', mode: 'line', prefix: '- ',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13" /><text x="1" y="8" fontSize="7" fill="currentColor" fontFamily="sans-serif">1</text><text x="1" y="14" fontSize="7" fill="currentColor" fontFamily="sans-serif">2</text><text x="1" y="20" fontSize="7" fill="currentColor" fontFamily="sans-serif">3</text></svg>),
    title: 'Numbered List', mode: 'line', prefix: '1. ',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4" /></svg>),
    title: 'Task List', mode: 'line', prefix: '- [ ] ',
  },
  { type: 'divider' },

  // ── Code ───────────────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>),
    title: 'Inline Code (Ctrl+E)', mode: 'wrap', before: '`', after: '`',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10l-2 2 2 2M16 10l2 2-2 2M13 8l-2 8" /></svg>),
    title: 'Code Block', mode: 'wrap', before: '```\n', after: '\n```',
  },
  { type: 'divider' },

  // ── Links & Media ──────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>),
    title: 'Link (Ctrl+K)', mode: 'wrap', before: '[', after: '](url)',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
    title: 'Image', mode: 'wrap', before: '![alt](', after: ')',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
    title: 'Video Embed', mode: 'wrap', before: '[![Video](thumbnail-url)](', after: ')',
  },
  { type: 'divider' },

  // ── Blocks ─────────────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>),
    title: 'Blockquote', mode: 'line', prefix: '> ',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.58 13.13A1.75 1.75 0 004.22 19.5h15.56a1.75 1.75 0 001.51-2.51L13.71 3.86a1.75 1.75 0 00-3.02 0z" /></svg>),
    title: 'Callout / Note', mode: 'wrap', before: '> **Note:** ', after: '',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    title: 'Info Block', mode: 'wrap', before: '> **Info:** ', after: '',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
    title: 'Warning Block', mode: 'wrap', before: '> **Warning:** ', after: '',
  },
  { type: 'divider' },

  // ── Table & Rule ───────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>),
    title: 'Table', mode: 'wrap', before: '| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| ', after: ' |  |  |\n',
  },
  { label: '—', title: 'Horizontal Rule', mode: 'wrap', before: '\n---\n', className: 'text-xs font-bold' },
  { type: 'divider' },

  // ── Special ────────────────────────────────────────────────────
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>),
    title: 'Highlight', mode: 'wrap', before: '<mark>', after: '</mark>',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>),
    title: 'Collapsible Section', mode: 'wrap', before: '<details>\n<summary>Click to expand</summary>\n\n', after: '\n\n</details>',
  },
  {
    label: (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71" /></svg>),
    title: 'Footnote', mode: 'wrap', before: '[^', after: ']: footnote text',
  },
  { label: 'KBD', title: 'Keyboard Key', mode: 'wrap', before: '<kbd>', after: '</kbd>', className: 'text-[10px] font-mono font-bold' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Write your content here...',
  required,
  minLength,
  rows = 15,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── helpers (called only from event handlers, never render) ── */
  function doInsertText(before: string, after = '') {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = `${before}${selected}${after}`;
    const next = value.substring(0, start) + replacement + value.substring(end);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cur = selected.length > 0 ? start + replacement.length : start + before.length;
      textarea.setSelectionRange(cur, cur);
    });
  }

  function doInsertLinePrefix(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const actualEnd = lineEnd === -1 ? value.length : lineEnd;
    const selected = value.substring(lineStart, actualEnd);
    const prefixed = selected.split('\n').map((l) => `${prefix}${l}`).join('\n');
    const next = value.substring(0, lineStart) + prefixed + value.substring(actualEnd);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + prefixed.length);
    });
  }

  function handleToolClick(tool: ToolDef) {
    if ('type' in tool) return;
    if (tool.mode === 'wrap') doInsertText(tool.before, tool.after);
    else doInsertLinePrefix(tool.prefix);
  }

  /* ── keyboard shortcuts ── */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.ctrlKey || e.metaKey) {
      const map: Record<string, [string, string?]> = {
        b: ['**', '**'],
        i: ['*', '*'],
        u: ['<u>', '</u>'],
        k: ['[', '](url)'],
        e: ['`', '`'],
      };
      const entry = map[e.key.toLowerCase()];
      if (entry) { e.preventDefault(); doInsertText(entry[0], entry[1]); }
    }
    if (e.key === 'Tab') { e.preventDefault(); doInsertText('  '); }
  }

  const wordCount = useMemo(() => {
    const t = value.trim();
    return t ? t.split(/\s+/).length : 0;
  }, [value]);

  /* ── render ── */
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-gray-800 border-b border-gray-700">
        {TOOLS.map((tool, i) =>
          'type' in tool ? (
            <div key={i} className="w-px h-5 bg-gray-600 mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => handleToolClick(tool)}
              title={tool.title}
              className={`px-2 py-1 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 transition-colors text-sm ${tool.className ?? ''}`}
            >
              {tool.label}
            </button>
          )
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        required={required}
        minLength={minLength}
        rows={rows}
        className="w-full px-4 py-3 text-sm text-gray-100 bg-gray-900 resize-y border-0 focus:ring-0 focus:outline-none placeholder-gray-500"
        placeholder={placeholder}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
        <span>Markdown supported &bull; Ctrl+B Bold &bull; Ctrl+I Italic &bull; Ctrl+K Link &bull; Ctrl+E Code &bull; Tab indent</span>
        <span>{value.length} chars &bull; {wordCount} words</span>
      </div>
    </div>
  );
}
