import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '@/lib/blog-data';
import { ArrowLeft } from 'lucide-react';
import NewsletterSignup from '@/components/home/NewsletterSignup';

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <Link to="/blog" className="text-primary hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="text-sm text-muted-foreground">{post.date}</span>
          <span className="text-sm text-muted-foreground">· {post.readTime}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">{post.title}</h1>

        <div className="prose prose-invert prose-lg max-w-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-foreground [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_li]:text-muted-foreground [&_strong]:text-foreground [&_ul]:space-y-2 [&_ul]:my-4">
          {post.content.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
              return <h2 key={i}>{block.replace('## ', '')}</h2>;
            }
            if (block.startsWith('- ')) {
              const items = block.split('\n').filter(l => l.startsWith('- '));
              return (
                <ul key={i} className="list-disc pl-6">
                  {items.map((item, j) => (
                    <li key={j} dangerouslySetInnerHTML={{ __html: item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  ))}
                </ul>
              );
            }
            return <p key={i} dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
          })}
        </div>

        <div className="mt-16 border-t border-border pt-12">
          <NewsletterSignup source="blog-post" />
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
