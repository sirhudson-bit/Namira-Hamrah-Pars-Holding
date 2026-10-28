"use client";

import { useRef, useState } from "react";
import {
  MDXEditor,
  type MDXEditorMethods,
  type Translation,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertCodeBlock,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import { ImagePlus } from "lucide-react";
import { MediaPicker } from "./media-picker";
import type { MediaItem } from "@/lib/media";

const PERSIAN_UI: Record<string, string> = {
  "toolbar.richText": "متن غنی",
  "toolbar.source": "منبع Markdown",
  "toolbar.diffMode": "مقایسه تغییرات",
  "toolbar.undo": "واگرد {{shortcut}}",
  "toolbar.redo": "ازنو {{shortcut}}",
  "toolbar.blockTypeSelect.placeholder": "نوع بلوک",
  "toolbar.blockTypeSelect.selectBlockTypeTooltip": "نوع بلوک را انتخاب کنید",
  "toolbar.blockTypes.paragraph": "پاراگراف",
  "toolbar.blockTypes.heading": "عنوان {{level}}",
  "toolbar.blockTypes.quote": "نقل‌قول",
  "toolbar.bold": "درشت",
  "toolbar.removeBold": "حذف درشت",
  "toolbar.italic": "کج",
  "toolbar.removeItalic": "حذف کج",
  "toolbar.underline": "زیرخط",
  "toolbar.removeUnderline": "حذف زیرخط",
  "toolbar.inlineCode": "کد درون‌خطی",
  "toolbar.removeInlineCode": "حذف کد درون‌خطی",
  "toolbar.bulletedList": "فهرست نقطه‌ای",
  "toolbar.numberedList": "فهرست شماره‌دار",
  "toolbar.checkList": "فهرست کارها",
  "toolbar.link": "درج پیوند",
  "toolbar.image": "درج تصویر",
  "toolbar.table": "درج جدول",
  "toolbar.thematicBreak": "درج خط جداکننده",
  "toolbar.codeBlock": "درج بلوک کد",
  "toolbar.toggleGroup": "گروه ابزار",
  "dialog.close": "بستن پنجره",
  "dialogControls.save": "ذخیره",
  "dialogControls.cancel": "انصراف",
  "createLink.text": "متن پیوند",
  "createLink.url": "نشانی",
  "createLink.urlPlaceholder": "نشانی را وارد یا جای‌گذاری کنید",
  "createLink.title": "عنوان پیوند",
  "createLink.saveTooltip": "ثبت نشانی",
  "createLink.cancelTooltip": "انصراف از تغییر",
  "createLink.textTooltip": "متنی که برای پیوند نمایش داده می‌شود",
  "createLink.titleTooltip": "عنوانی که هنگام نگه‌داشتن نشانگر دیده می‌شود",
  "linkPreview.edit": "ویرایش نشانی پیوند",
  "linkPreview.remove": "حذف پیوند",
  "linkPreview.copyToClipboard": "کپی در حافظه",
  "linkPreview.copied": "کپی شد!",
  "uploadImage.dialogTitle": "درج تصویر",
  "uploadImage.dialogDescription": "تصویر را از نشانی وارد کنید یا از دستگاه خود بارگذاری کنید.",
  "uploadImage.dialogDescriptionNoUpload": "نشانی تصویر را وارد کنید.",
  "uploadImage.uploadInstructions": "بارگذاری تصویر از دستگاه:",
  "uploadImage.addViaUrlInstructions": "یا تصویر را از نشانی زیر اضافه کنید:",
  "uploadImage.addViaUrlInstructionsNoUpload": "تصویر را از نشانی زیر اضافه کنید:",
  "uploadImage.autoCompletePlaceholder": "نشانی تصویر را وارد یا جای‌گذاری کنید",
  "uploadImage.alt": "متن جایگزین:",
  "uploadImage.title": "عنوان:",
  "uploadImage.width": "عرض:",
  "uploadImage.height": "ارتفاع:",
  "imageEditor.editImage": "ویرایش تصویر",
  "imageEditor.deleteImage": "حذف تصویر",
  "table.insertRowAbove": "درج سطر در بالا",
  "table.insertRowBelow": "درج سطر در پایین",
  "table.insertColumnLeft": "درج ستون در چپ",
  "table.insertColumnRight": "درج ستون در راست",
  "table.deleteRow": "حذف این سطر",
  "table.deleteColumn": "حذف این ستون",
  "table.deleteTable": "حذف جدول",
  "table.alignLeft": "چینش چپ",
  "table.alignCenter": "چینش وسط",
  "table.alignRight": "چینش راست",
  "table.columnMenu": "منوی ستون",
  "table.rowMenu": "منوی سطر",
  "table.textAlignment": "چینش متن",
  "codeBlock.language": "زبان بلوک کد",
  "codeBlock.inlineLanguage": "زبان",
  "codeBlock.selectLanguage": "زبان بلوک کد را انتخاب کنید",
  "codeblock.delete": "حذف بلوک کد",
};

const persianTranslation: Translation = (key, defaultValue, interpolations) => {
  let text = PERSIAN_UI[key] ?? defaultValue;
  for (const [name, value] of Object.entries(interpolations ?? {})) {
    text = text.replaceAll(`{{${name}}}`, String(value));
  }
  return text;
};

/**
 * MDXEditor (Lexical-based) in rich-text mode with a Markdown source toggle.
 *
 * This is the ready-made editor component requested for the CMS: it provides a
 * real WYSIWYG surface, Markdown shortcuts, tables, links, code blocks and an
 * undo stack instead of a textarea with a few string helpers. The value that
 * leaves the component is still Markdown, so the existing renderer and stored
 * content keep working unchanged.
 */
export default function MdxEditorInner({
  markdown,
  onChange,
  minHeight = 360,
}: {
  markdown: string;
  onChange: (value: string) => void;
  minHeight?: number;
}) {
  const ref = useRef<MDXEditorMethods>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="mdx-editor-shell" dir="rtl" style={{ ["--mdx-min-height" as string]: `${minHeight}px` }}>
      <div className="mdx-extra-toolbar">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          درج تصویر از رسانه
        </button>
        <span className="text-[11px] text-ink-500">
          برای تصویر می‌توانید از دکمه بالا یا ابزار تصویر در نوار ویرایشگر استفاده کنید.
        </span>
      </div>

      <MDXEditor
        ref={ref}
        markdown={markdown}
        onChange={onChange}
        placeholder="متن خود را اینجا بنویسید…"
        translation={persianTranslation}
        contentEditableClassName="prose-page max-w-none px-4 py-5"
        className="mdx-editor"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              txt: "متن",
              js: "JavaScript",
              ts: "TypeScript",
              jsx: "JSX",
              css: "CSS",
              html: "HTML",
              json: "JSON",
              bash: "Bash",
            },
          }),
          markdownShortcutPlugin(),
          diffSourcePlugin(),
          toolbarPlugin({
            toolbarClassName: "mdx-toolbar",
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <BoldItalicUnderlineToggles options={["Bold", "Italic", "Underline"]} />
                <CodeToggle />
                <Separator />
                <ListsToggle options={["bullet", "number", "check"]} />
                <Separator />
                <CreateLink />
                <InsertImage />
                <InsertTable />
                <InsertThematicBreak />
                <InsertCodeBlock />
              </DiffSourceToggleWrapper>
            ),
          }),
        ]}
      />

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(item: MediaItem) => {
          ref.current?.focus();
          ref.current?.insertMarkdown(`![${item.alt || item.filename}](${item.path})`);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
