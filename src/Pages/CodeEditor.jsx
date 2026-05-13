import React from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-10">
            <div className="w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#252B48]">

                {/* Top Bar */}
                <div className="h-12 bg-[#3A415F] flex items-center px-4 gap-2 border-b border-white/10">
                    <div className="w-4 h-4 rounded-full bg-red-400"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                </div>

                {/* Editor */}
                <div className="h-[600px] w-full bg-[#252B48]">
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        theme="vs-dark"
                        defaultValue={`{
  "fruit": "Apple",
  "size": "Large",
  "color": "Red"
}`}
                        options={{
                            fontSize: 20,
                            minimap: {
                                enabled: false,
                            },

                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            lineNumbersMinChars: 3,
                            glyphMargin: false,
                            folding: false,
                            lineDecorationsWidth: 10,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
