'use client';

import { HealthPostCard } from './HealthPostCard';
import type { HealthPost } from '@/lib/types';

interface HealthLibraryClientProps {
    initialPosts: HealthPost[];
}

export function HealthLibraryClient({ initialPosts }: HealthLibraryClientProps) {
  return (
    <div className="border rounded-lg">
      {initialPosts.map((post, index) => (
        <div key={post.id} className={index === initialPosts.length - 1 ? '' : 'border-b'}>
            <HealthPostCard post={post} />
        </div>
      ))}
    </div>
  );
}
