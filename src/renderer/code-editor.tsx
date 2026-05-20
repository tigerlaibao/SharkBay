import { useEffect, useRef } from "react";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { bracketMatching, defaultHighlightStyle, foldGutter, foldKeymap, indentOnInput, HighlightStyle, syntaxHighlighting, type LanguageSupport } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView, drawSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import type { AppearanceTheme } from "./types";

type CodeEditorProps = {
  appearanceTheme: AppearanceTheme;
  initialContent: string;
  relativePath: string;
  readOnly?: boolean;
  onChange: (content: string) => void;
  onSave?: () => void;
};

export function CodeEditor({ appearanceTheme, initialContent, relativePath, readOnly = false, onChange, onSave }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const language = languageExtensionForPath(relativePath);
    const theme = themeForAppearance(appearanceTheme);
    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(theme.highlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        EditorState.readOnly.of(readOnly),
        EditorView.lineWrapping,
        EditorView.theme(theme.styles, { dark: theme.dark }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          {
            key: "Mod-s",
            preventDefault: true,
            run: () => { onSaveRef.current?.(); return true; },
          },
        ]),
        ...(language ? [language] : []),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [appearanceTheme, relativePath, readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== initialContent) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: initialContent } });
    }
  }, [initialContent]);

  return <div className="code-editor" ref={containerRef} />;
}

function languageExtensionForPath(relativePath: string): LanguageSupport | null {
  const lower = relativePath.toLowerCase();
  const base = lower.split("/").pop() ?? lower;
  const ext = base.includes(".") ? base.slice(base.lastIndexOf(".")) : base;

  if (/\.(tsx|jsx)$/.test(lower)) return javascript({ jsx: true, typescript: lower.endsWith(".tsx") });
  if (/\.(ts|mts|cts)$/.test(lower)) return javascript({ typescript: true });
  if (/\.(js|mjs|cjs)$/.test(lower)) return javascript();
  if (ext === ".json" || base === ".prettierrc" || base === ".eslintrc") return json();
  if (/\.(html?|svg)$/.test(lower)) return html();
  if (/\.(css|scss|sass|less)$/.test(lower)) return css();
  if (/\.(py|pyi)$/.test(lower)) return python();
  if (/\.(md|mdx|markdown)$/.test(lower)) return markdown();
  if (/\.(ya?ml)$/.test(lower)) return yaml();
  if (ext === ".rs") return rust();
  if (ext === ".go") return go();
  if (/\.(xml|xsd|xsl)$/.test(lower)) return xml();
  if (ext === ".sql") return sql();
  return null;
}

type ThemeSpec = {
  dark: boolean;
  highlightStyle: HighlightStyle;
  styles: Parameters<typeof EditorView.theme>[0];
};

function themeForAppearance(appearanceTheme: AppearanceTheme): ThemeSpec {
  return appearanceTheme === "day" ? lightTheme : darkTheme;
}

const lightTheme: ThemeSpec = {
  dark: false,
  highlightStyle: defaultHighlightStyle,
  styles: {
    "&": {
      color: "#1f2933",
      backgroundColor: "transparent",
      height: "100%",
      fontSize: "13px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    ".cm-content": { caretColor: "#0f172a" },
    ".cm-cursor": { borderLeftColor: "#0f172a" },
    ".cm-gutters": { backgroundColor: "transparent", color: "#94a3b8", border: "0" },
    ".cm-activeLine": { backgroundColor: "rgba(15, 23, 42, 0.04)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(15, 23, 42, 0.04)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(59, 130, 246, 0.25)",
    },
  },
};

const darkTheme: ThemeSpec = {
  dark: true,
  highlightStyle: HighlightStyle.define([
    { tag: t.keyword, color: "#82b7c4" },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: "#93d7a4" },
    { tag: [t.number, t.literal, t.unit], color: "#d7bd78" },
    { tag: [t.string, t.character, t.inserted], color: "#a8ddb5" },
    { tag: [t.regexp, t.escape, t.url], color: "#e2b253" },
    { tag: [t.function(t.variableName), t.labelName], color: "#8eced2" },
    { tag: [t.definition(t.name), t.className, t.typeName], color: "#c6a7d8" },
    { tag: [t.propertyName, t.attributeName], color: "#b7d7ff" },
    { tag: [t.variableName, t.name], color: "#edf2ef" },
    { tag: [t.operator, t.operatorKeyword], color: "#e7c981" },
    { tag: [t.comment, t.meta], color: "#8ca19d", fontStyle: "italic" },
    { tag: t.heading, color: "#f6f1d8", fontWeight: "700" },
    { tag: t.strong, fontWeight: "700" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.link, color: "#8eced2", textDecoration: "underline" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.invalid, color: "#ffd6d1", backgroundColor: "rgba(229, 139, 126, 0.18)" },
  ]),
  styles: {
    "&": {
      color: "#edf2ef",
      backgroundColor: "#101719",
      height: "100%",
      fontSize: "13px",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    ".cm-content": { caretColor: "#edf2ef" },
    ".cm-cursor": { borderLeftColor: "#edf2ef" },
    ".cm-scroller": { backgroundColor: "#101719" },
    ".cm-gutters": { backgroundColor: "#101719", color: "#82918d", borderRight: "1px solid #263639" },
    ".cm-activeLine": { backgroundColor: "#182426" },
    ".cm-activeLineGutter": { backgroundColor: "#182426", color: "#c5d2ce" },
    ".cm-matchingBracket": { backgroundColor: "rgba(147, 215, 164, 0.18)", outline: "1px solid rgba(147, 215, 164, 0.35)" },
    ".cm-nonmatchingBracket": { backgroundColor: "rgba(229, 139, 126, 0.22)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(142, 206, 210, 0.18)" },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(120, 169, 255, 0.34)",
    },
  },
};

export const editorIgnoredExtension: Extension = [];
