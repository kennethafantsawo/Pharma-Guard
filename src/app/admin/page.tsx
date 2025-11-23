import { PageWrapper } from '@/components/shared/page-wrapper';
import { AdminPageClient } from './AdminPageClient';

export default function AdminPage() {
  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <AdminPageClient />
        </div>
      </div>
    </PageWrapper>
  );
}
