import React from 'react';
import ReactMarkdown from 'react-markdown';

const Markdown = ({ message }: { message: any }) => {
    const isAssistant = message.role === 'assistant';

    const components = {
        code({ node, inline, className, children, ...props }: any) {
            return (
                <code
                    className={`${inline ? 'bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded' :
                        'block bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto'} 
            font-mono text-sm`}
                    {...props}
                >
                    {children}
                </code>
            );
        },
        pre({ children }: any) {
            return <pre className="my-4">{children}</pre>;
        },
        p({ children }: any) {
            return <p className="mb-4 last:mb-0">{children}</p>;
        },
        ul({ children }: any) {
            return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
        },
        ol({ children }: any) {
            return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
        },
        h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        a: ({ children, href }: any) => (
            <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        ),
        blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-gray-200 dark:border-gray-600 pl-4 my-4 italic">
                {children}
            </blockquote>
        ),
    };

    return (
        <div className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'} group`}>
            <div className="flex flex-col gap-1 max-w-[100%]">
                <div
                    className={`rounded-2xl px-4
            ${isAssistant
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-zinc-200 dark:bg-zinc-900/50 text-black dark:text-white py-3'
                        }`}
                >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown components={components}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>
                <span className={`text-xs ${isAssistant ? 'text-left' : 'text-right'} text-gray-500 dark:text-gray-400`}>
                    {new Intl.DateTimeFormat('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    }).format(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default Markdown;