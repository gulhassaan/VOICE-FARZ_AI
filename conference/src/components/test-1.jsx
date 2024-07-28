import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import 'tailwindcss/tailwind.css'; // Ensure you have Tailwind CSS imported

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

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSave = (content) => {
        setContent(content);
        setIsEditing(false);
    };

    return (
        <div className="p-4">
            {isEditing ? (
                <Editor
                    initialValue={content}
                    init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | \
                            alignleft aligncenter alignright alignjustify | \
                            bullist numlist outdent indent | removeformat | help',
                        content_style: `
                            body { font-family:Helvetica,Arial,sans-serif; font-size:14px }
                            h1 { color: #ef4444; font-size: 2.25rem; }
                            h2 { color: #f97316; font-size: 1.875rem; }
                            h3 { color: #eab308; font-size: 1.5rem; }
                            h4 { color: #10b981; font-size: 1.25rem; }
                            h5 { color: #3b82f6; font-size: 1.125rem; }
                            h6 { color: #8b5cf6; font-size: 1rem; }
                            p { font-size: 1rem; line-height: 1.5; }
                            ul { list-style-type: disc; list-style-position: inside; }
                            ol { list-style-type: decimal; list-style-position: inside; }
                            blockquote { border-left: 4px solid #6b7280; padding-left: 1rem; font-style: italic; margin: 1rem 0; }
                            code { background-color: #e5e7eb; padding: 0.25rem; border-radius: 0.25rem; }
                            pre { background-color: #e5e7eb; padding: 1rem; border-radius: 0.25rem; }
                            a { color: #3b82f6; text-decoration: underline; }
                        `
                    }}
                    onEditorChange={handleSave}
                />
            ) : (
                <div className="prose" dangerouslySetInnerHTML={{ __html: content }}></div>
            )}
            <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
                onClick={handleEditClick}
            >
                Edit Text
            </button>
        </div>
    );
};

export default EditableText;
