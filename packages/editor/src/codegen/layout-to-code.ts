import type { PageLayout, LayoutNode } from '../schema';

/**
 * Generate React + Tailwind code from layout for Sandpack preview.
 * Uses Sandpack's react template structure (src/App.js).
 */
export function layoutToSandpackFiles(layout: PageLayout): Record<string, string> {
  const pageContent = layoutChildrenToJSX(layout.children);

  return {
    '/src/App.js': `export default function App() {
  return (
    <div className="min-h-screen">
      ${pageContent}
    </div>
  );
}`,
  };
}

function layoutChildrenToJSX(children: LayoutNode[]): string {
  if (!children?.length) return '<div>Empty page</div>';
  return children.map((node) => nodeToJSX(node)).join('\n      ');
}

function nodeToJSX(node: LayoutNode): string {
  const props = (node.props || {}) as Record<string, string | number | boolean | undefined>;
  const children = node.children?.length
    ? layoutChildrenToJSX(node.children)
    : null;

  switch (node.type) {
    case 'Navbar':
      return `<nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.5rem',background:'#fff',borderBottom:'1px solid #e5e7eb'}}>
  <span style={{fontSize:'1.25rem',fontWeight:700}}>${escape(props.title || 'Brand')}</span>
  <button style={{padding:'0.5rem 1rem',background:'#2563eb',color:'#fff',borderRadius:'0.5rem',border:'none',cursor:'pointer'}}>${escape(props.ctaLabel || 'CTA')}</button>
</nav>`;
    case 'Hero':
      return `<section style={{padding:'5rem 1.5rem',textAlign:'center',background:'linear-gradient(135deg,#2563eb,#1d4ed8)'}}>
  <h1 style={{fontSize:'2.25rem',fontWeight:700,color:'#fff',marginBottom:'1rem'}}>${escape(props.title || 'Hero')}</h1>
  <p style={{color:'rgba(255,255,255,0.9)',marginBottom:'1.5rem',fontSize:'1.125rem'}}>${escape(props.subtitle || '')}</p>
  <button style={{padding:'0.75rem 1.5rem',background:'#fff',color:'#2563eb',borderRadius:'0.5rem',border:'none',fontWeight:600,cursor:'pointer'}}>${escape(props.ctaLabel || 'Get Started')}</button>
</section>`;
    case 'FeatureGrid':
      return children
        ? `<section style={{padding:'4rem 1.5rem'}}><div style={{maxWidth:'72rem',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'2rem'}}>${children}</div></section>`
        : '<section style={{padding:"4rem 1.5rem"}}><div style={{display:"grid",gap:"2rem"}}>Features</div></section>';
    case 'FeatureCard':
      return `<div style={{padding:'1.5rem',borderRadius:'0.75rem',border:'1px solid #e5e7eb',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
  <div style={{fontSize:'1.5rem',marginBottom:'0.5rem'}}>${escape(props.icon || '✨')}</div>
  <h3 style={{fontWeight:600,marginBottom:'0.5rem'}}>${escape(props.title || 'Feature')}</h3>
  <p style={{color:'#6b7280'}}>${escape(props.description || '')}</p>
</div>`;
    case 'CTA':
      return `<section style={{padding:'4rem 1.5rem',background:'#2563eb',textAlign:'center'}}>
  <h2 style={{fontSize:'1.5rem',fontWeight:700,color:'#fff',marginBottom:'1rem'}}>${escape(props.title || 'CTA')}</h2>
  <button style={{padding:'0.75rem 2rem',background:'#fff',color:'#2563eb',borderRadius:'0.5rem',border:'none',fontWeight:600,cursor:'pointer'}}>${escape(props.buttonLabel || 'Action')}</button>
</section>`;
    case 'Footer':
      return `<footer style={{padding:'2rem 1.5rem',background:'#111827',color:'#9ca3af',textAlign:'center'}}>
  © ${new Date().getFullYear()} ${escape(props.brand || 'App')}
</footer>`;
    default:
      return children ? `<div>${children}</div>` : '<div />';
  }
}

function escape(s: string | number | boolean | undefined): string {
  return String(s ?? '').replace(/'/g, "\\'").replace(/\n/g, ' ');
}
