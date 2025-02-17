import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
}

interface MarkdownProps {
    message: Message;
}

interface CodeProps {
    node?: unknown;
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface BaseComponentProps {
    children: React.ReactNode;
}

interface LinkProps extends BaseComponentProps {
    href?: string;
}

const Markdown: React.FC<MarkdownProps> = ({ message }) => {
    const isAssistant = message.role === 'assistant';

    const components: Record<string, React.FC<any>> = {
        code: ({ inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';

            return !inline && language ? (
                <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    className="rounded-lg"
                    showLineNumbers={true}
                    customStyle={{
                        margin: 0,
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: 'rgb(40, 44, 52)'
                    }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code
                    className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded font-mono text-sm"
                    {...props}
                >
                    {children}
                </code>
            );
        },
        pre: ({ children }: BaseComponentProps) => {
            return <>{children}</>;
        },
        p: ({ children }: BaseComponentProps) => {
            return <p className="mb-4 last:mb-0">{children}</p>;
        },
        ul: ({ children }: BaseComponentProps) => {
            return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
        },
        ol: ({ children }: BaseComponentProps) => {
            return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
        },
        h1: ({ children }: BaseComponentProps) => (
            <h1 className="text-2xl font-bold mb-4">{children}</h1>
        ),
        h2: ({ children }: BaseComponentProps) => (
            <h2 className="text-xl font-bold mb-3">{children}</h2>
        ),
        h3: ({ children }: BaseComponentProps) => (
            <h3 className="text-lg font-bold mb-2">{children}</h3>
        ),
        a: ({ children, href }: LinkProps) => (
            <a
                href={href}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        ),
        blockquote: ({ children }: BaseComponentProps) => (
            <blockquote className="border-l-4 border-gray-200 dark:border-gray-600 pl-4 my-4 italic">
                {children}
            </blockquote>
        ),
    };

    return (
        <div className={`flex gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'} group`}>
            <div className="flex flex-col gap-1 max-w-[100%]">
                <div
                    className={`rounded-2xl ${isAssistant
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-zinc-200 dark:bg-zinc-900/50 text-black dark:text-white px-4 py-3'
                        }`}
                >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown components={components}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>
                <span
                    className={`text-xs ${isAssistant ? 'text-left' : 'text-right'
                        } text-gray-500 dark:text-gray-400`}
                >
                    {new Intl.DateTimeFormat('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: false,
                    }).format(message.timestamp)}
                </span>
            </div>
        </div>
    );
};

export default Markdown;