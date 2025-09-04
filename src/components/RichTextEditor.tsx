import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Eraser } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range;
    }
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    const range = savedRangeRef.current;
    if (!el || !range) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.focus();
  };

  // Keep editor content in sync when value changes from outside
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const current = el.innerHTML;
    if (current !== value) {
      el.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command: string, value?: string) => {
    restoreSelection();
    document.execCommand(command, false, value);
    const el = editorRef.current;
    if (el) onChange(sanitizeHtml(el.innerHTML));
    saveSelection();
  };

  const onInput = () => {
    const el = editorRef.current;
    if (!el) return;
    onChange(sanitizeHtml(el.innerHTML));
    saveSelection();
  };

  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (html || text) {
      e.preventDefault();
      const payload = sanitizeHtml(html || text.replace(/\n/g, "<br>"));
      document.execCommand("insertHTML", false, payload);
    }
  };

  return (
    <Card className={cn("border border-border/60", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/40">
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("bold")}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("italic")}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("underline")}>
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("insertUnorderedList")}>
          <List className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("justifyLeft")}>
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("justifyCenter")}>
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("justifyRight")}>
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("justifyFull")}>
          <AlignJustify className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => { e.preventDefault(); restoreSelection(); }} onClick={() => exec("removeFormat")}>
          <Eraser className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-0">
        <div
          ref={editorRef}
          className={cn(
            "min-h-[200px] p-3 focus:outline-none prose prose-sm sm:prose prose-headings:m-0 prose-p:m-0 max-w-none",
            isFocused ? "ring-2 ring-primary/30" : ""
          )}
          contentEditable
          onInput={onInput}
          onPaste={onPaste}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            const el = editorRef.current;
            if (el) el.innerHTML = sanitizeHtml(el.innerHTML);
          }}
          suppressContentEditableWarning
          data-placeholder={placeholder || "Scrivi qui..."}
          style={{ whiteSpace: "pre-wrap" }}
        />
      </CardContent>
    </Card>
  );
}
