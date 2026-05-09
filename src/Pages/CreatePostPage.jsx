import { useMemo, useState } from "react";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import InputField from "../components/UI/InputField";
import Select from "../components/UI/Select";
import Toast from "../components/UI/Toast";
import { createPost } from "../services/postService";
import Editor from "@monaco-editor/react";

const CATEGORY_OPTIONS = [
  "Technology",
  "Design",
  "Programming",
  "Lifestyle",
  "Business",
];

const LANGUAGE_OPTIONS = [
  "javascript",
  "typescript",
  "html",
  "css",
  "json",
  "python",
  "bash",
];

const EXTENSION_LANGUAGE_MAP = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  jsx: "javascript",
  tsx: "typescript",
  py: "python",
  css: "css",
  scss: "css",
  json: "json",
  html: "html",
  htm: "html",
  sh: "bash",
  bash: "bash",
};

export default function CreatePostPage() {
    const [snippetCode, setSnippetCode] = useState("");
  const [isCodeMode, setIsCodeMode] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
    tag: CATEGORY_OPTIONS[0],
    isPremium: false,
    iscoded: false,
    code:snippetCode,
    
  });

  const [snippetLanguage, setSnippetLanguage] = useState(
    LANGUAGE_OPTIONS[0]
  );

  const [snippetFilename, setSnippetFilename] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editorMode, setEditorMode] = useState("Mixed");

  const modeOptions = ["Mixed", "Code", "Media"];



  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    

    


  };

  const handleSnippetUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const code = await file.text();

      setSnippetCode(code);
      setSnippetFilename(file.name);

      const extension = file.name
        .split(".")
        .pop()
        ?.toLowerCase();

      const detectedLanguage =
        EXTENSION_LANGUAGE_MAP[extension];

      if (detectedLanguage) {
        setSnippetLanguage(detectedLanguage);
      }
    } catch {
      setToast({
        message: "Could not read code file",
        type: "error",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();


    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("isPremium", formData.isPremium);
      payload.append("iscoded", Boolean(formData.iscoded));

        payload.append("code", snippetCode);
      

      payload.append("tag", formData.tag);
      payload.append("tag1", snippetLanguage);

      

      payload.append("content", formData.content);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      await createPost(payload);

      setToast({
        message: "Post published successfully",
        type: "success",
      });

      setFormData({
        title: "",
        content: "",
        image: null,
        tag: CATEGORY_OPTIONS[0],
        isPremium: false,
        iscoded: false,
      });

      setSnippetLanguage(LANGUAGE_OPTIONS[0]);
      setSnippetCode("");
      setSnippetFilename("");
    } catch (error) {
      setToast({
        message:
          error.response?.data?.msg ||
          "Failed to publish post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">

        {/* Hero */}
        <Card className="overflow-hidden border-brand-300/20 bg-gradient-to-br from-zinc-950 to-brand-900/20 p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">

            <div className="space-y-4">
              <span className="app-chip">Composer</span>

              <h1 className="section-title">
                Craft a post with code, media, and context
              </h1>

              <p className="section-copy">
                Reliable post composer with Monaco Editor.
              </p>

              <div className="flex flex-wrap gap-2">
                {modeOptions.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setEditorMode(mode)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]
                    ${
                      editorMode === mode
                        ? "border-brand-300/45 bg-brand-300/15 text-brand-100"
                        : "border-white/10 bg-black text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-3">

                <div className="rounded-xl border border-white/10 bg-black/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {formData.tag}
                  </p>
                </div>

              

                <div className="rounded-xl border border-white/10 bg-black/50 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    Access
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {formData.isPremium ? "Premium" : "Public"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                "Code upload supported",
                "VS Code style editing",
                "Monaco syntax highlighting",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >

            {/* Title + Category */}
            <div className="grid gap-4 md:grid-cols-3">

              <div className="md:col-span-2">
                <InputField
                  label="Post title"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a high-signal title"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-300">
                  Category
                </label>

                <Select
                  name="tag"
                  value={formData.tag}
                  options={CATEGORY_OPTIONS}
                  onChange={handleChange}
                  className="rounded-2xl border border-white/10 bg-black px-4 py-3 text-zinc-100"
                />
              </div>
            </div>

            {/* Toggle Options */}
            <div className="grid gap-3 md:grid-cols-2">

              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black p-4">
                <input
                  id="isPremium"
                  name="isPremium"
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    Premium content
                  </p>

                  <p className="text-xs text-zinc-500">
                    Gate this post for subscribers only.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black p-4">
                <input
                  id="isCodeMode"
                  type="checkbox"
                  checked={formData.iscoded}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      code: "",
                      iscoded: e.target.checked,
                    }));

setFormData((prev) => ({
  ...prev,
  iscoded: e.target.checked,
}));                    console.log(formData.iscoded)
                  }}
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="text-sm font-semibold text-zinc-100">
                    Add code snippet
                  </p>

                  <p className="text-xs text-zinc-500">
                    Include Monaco Editor in your post.
                  </p>
                </div>
              </label>
            </div>

            {/* Content */}
            <InputField
              label="Post narrative"
              id="content"
              name="content"
              type="textarea"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write context, explanation, outcomes, and links..."
              rows="8"
              className="min-h-[220px] leading-7"
            />

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Cover image
              </label>

              <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black px-6 py-6 text-center">

                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      image: event.target.files[0],
                    }))
                  }
                  className="hidden"
                />

                <span className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200">
                  Upload image
                </span>

                <p className="mt-2 text-xs text-zinc-500">
                  Drop an illustration or screenshot.
                </p>
              </label>
            </div>

            {/* Preview Image */}
            {formData.image && (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            {/* Monaco Editor */}
            {formData.iscoded && (
              <div className="space-y-5 flex flex-col space-x-4 rounded-2xl border border-white/10 bg-black p-5 gap-3 ">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <p className="text-sm font-semibold text-zinc-100">
                      Monaco Code Editor
                    </p>

                    <p className="text-xs text-zinc-500">
                      VS Code powered editor
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    <Select
                      name="tag1"
                      value={snippetLanguage}
                      options={LANGUAGE_OPTIONS}
                      onChange={(e) =>
                        setSnippetLanguage(e.target.value)
                      }
                      className="w-[140px] rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200"
                    />

                    <label className="inline-flex cursor-pointer items-center rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-zinc-200">

                      Upload code

                      <input
                        type="file"
                        accept=".txt,.js,.mjs,.cjs,.ts,.jsx,.tsx,.py,.json,.html,.htm,.css,.scss,.sh,.bash"
                        className="hidden"
                        onChange={handleSnippetUpload}
                      />
                    </label>
                  </div>
                </div>

                {snippetFilename && (
                  <p className="text-xs text-brand-200">
                    Loaded: {snippetFilename}
                  </p>
                )}

                {/* Editor UI */}
                <div className=" gap-4  flex flex-col overflow-hidden rounded-3xl border border-white/10  shadow-2xl">

                  {/* Top Bar */}
                  <div className="flex items-center  justify-between border-b border-white/10 bg-[#31395A] px-5 py-5 space-x-3 space-y-2">

                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>

                    <p className="text-xs uppercase tracking-[0.12em] text-zinc-300">
                      {snippetLanguage}
                    </p>
                  </div>

                  {/* Monaco */}
                  <div className="h-[500px] overflow-hidden rounded-b-3xl">

                    <Editor
                      height="100%"
                      language={snippetLanguage}
                      theme="vs-dark"
                      value={snippetCode}
                      onChange={(value) =>
                        setSnippetCode(value)
                      }
                      options={{
                        lineNumbers: "on",
                        minimap: {
                          enabled: false,
                        },
                        fontSize: 15,
                        automaticLayout: true,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                        fontFamily: "IBM Plex Mono",
                        padding: {
                          top: 16,
                        },
                      }}
                    />
                  </div>
 <div className="flex items-center justify-between border-b border-white/10 bg-[#31395A] px-5 py-3">

                    <div className="flex items-center gap-2">
                      <div className=" text-white bold">View Preview</div>
                    </div>

                    <p className="text-xs uppercase tracking-[0.12em] text-zinc-300">
                      {snippetLanguage}
                    </p>
                  </div>
                                    {/* Monaco */}
                  <div className="h-[500px] overflow-hidden rounded-b-3xl">
    <Editor
  height="100%"
  language={snippetLanguage}
  theme="vs-dark"
  value={snippetCode}
  options={{
  readOnly: true,
  domReadOnly: true,
  cursorBlinking: "hidden",
  renderLineHighlight: "none",
  lineNumbers: "off",
  cursorBlinking: "hidden",
}}
/>
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Save Draft
              </Button>in this 

              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Publishing..." : "Publish Post"}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Sidebar */}
      <aside className="hidden space-y-4 2xl:block">
        <Card className="p-4">
          <p className="app-chip">Snippet Tips</p>

          <p className="mt-3 text-sm text-zinc-400">
            Keep snippets focused. Include only the
            part readers can apply immediately.
          </p>
        </Card>
      </aside>
    </div>
  );
}