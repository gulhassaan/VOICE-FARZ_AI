import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditableText = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(`
        <h1 class="text-red-500 text-4xl">Heading 1</h1>
        <h2 class="text-orange-500 text-3xl">Heading 2</h2>
        <h3 class="text-yellow-500 text-2xl">Heading 3</h3>
        <h4 class="text-green-500 text-xl">Heading 4</h4>
        <h5 class="text-blue-500 text-lg">Heading 5</h5>
        <h6 class="text-purple-500 text-base">Heading 6</h6>
        <p class="text-base leading-6">This is a paragraph.</p>
        <ul class="list-disc list-inside">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
        <ol class="list-decimal list-inside">
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
        </ol>
        <blockquote class="border-l-4 border-gray-500 italic my-4 pl-4 md:pl-8">
            This is a blockquote.
        </blockquote>
        <code class="bg-gray-200 rounded p-1">This is inline code.</code>
        <pre class="bg-gray-200 rounded p-4"><code>This is a code block.</code></pre>
        <a href="#" class="text-blue-500 underline">This is a link</a>
    `);
    const [editorContent, setEditorContent] = useState(content);

    const handleEditClick = () => {
        setIsEditing(true);
        setEditorContent(content); // Load current content into editor
    };

    const handleSaveClick = () => {
        setContent(editorContent);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    return (
        <div className="p-4">
            {isEditing ? (
                <>
                    <ReactQuill value={editorContent} onChange={setEditorContent} />
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
                        onClick={handleSaveClick}
                    >
                        Save
                    </button>
                    <button 
                        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded ml-2" 
                        onClick={handleCancelClick}
                    >
                        Cancel
                    </button>
                </>
            ) : (
                <>
                    <div className="prose" dangerouslySetInnerHTML={{ __html: content }}></div>
                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
                        onClick={handleEditClick}
                    >
                        Edit Text
                    </button>
                </>
            )}
        </div>
    );
};

export default EditableText;
