import { useRef, useEffect, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightSpecialChars } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { indentOnInput, bracketMatching, foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import type { SupportedLanguage } from '../types';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
}

function getLanguageExtension(lang: SupportedLanguage) {
  switch (lang) {
    case 'python': return python();
    case 'javascript': return javascript();
    case 'typescript': return javascript({ typescript: true });
    case 'java': return java();
    case 'cpp': return cpp();
    case 'go': return go();
    default: return python();
  }
}

export default function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const createExtensions = useCallback((lang: SupportedLanguage, isReadOnly: boolean) => [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    indentUnit.of('    '),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    getLanguageExtension(lang),
    oneDark,
    EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '14px',
      },
      '.cm-scroller': {
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        overflow: 'auto',
      },
      '.cm-gutters': {
        backgroundColor: '#1b1b2f',
        color: '#585b70',
        border: 'none',
        borderRight: '1px solid #313244',
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#2a2a3e',
        color: '#cdd6f4',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(139, 92, 246, 0.06)',
      },
      '.cm-cursor': {
        borderLeftColor: '#8b5cf6',
      },
      '.cm-selectionBackground': {
        backgroundColor: 'rgba(139, 92, 246, 0.2) !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: 'rgba(139, 92, 246, 0.3) !important',
      },
      '.cm-matchingBracket': {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        outline: '1px solid rgba(139, 92, 246, 0.5)',
      },
    }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    }),
    EditorState.readOnly.of(isReadOnly),
    EditorView.editable.of(!isReadOnly),
  ], []);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: createExtensions(language, readOnly),
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update language or readOnly
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    const state = EditorState.create({
      doc: currentDoc,
      extensions: createExtensions(language, readOnly),
    });
    view.setState(state);
  }, [language, readOnly, createExtensions]);

  // Update value from outside
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className="cm-editor-wrapper" ref={editorRef} />
  );
}
