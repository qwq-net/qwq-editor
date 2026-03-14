type Props = {
  content: string;
  label: string;
};

export function MdxPreview({ content }: Props) {
  return (
    <pre
      style={{
        flex: 1,
        margin: 0,
        padding: '16px',
        fontFamily: '"Fira Code", "Cascadia Code", monospace',
        fontSize: '13px',
        lineHeight: 1.6,
        color: '#cdd6f4',
        background: '#1e1e2e',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {content}
    </pre>
  );
}
