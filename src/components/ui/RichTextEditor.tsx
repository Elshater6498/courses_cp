import { forwardRef } from "react";
import ReactQuill, { type ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";

// Custom toolbar with image and video icons
const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image", "video"], // Add image and video icons
  ["clean"],
];

type RichTextEditorProps = ReactQuillProps;

export type RichTextEditorRef = ReactQuill;

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (props, ref) => {
    return (
      <div className="rich-text-editor">
        <ReactQuill
          ref={ref}
          modules={{
            toolbar: toolbarOptions,
            ...(props.modules || {}),
          }}
          {...props}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
