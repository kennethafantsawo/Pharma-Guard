'use server';

import { PageWrapper } from '@/components/shared/page-wrapper';
import { AdminPageClient } from './AdminPageClient';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { PharmacyWithProfile } from '@/lib/types';

async function getPharmaciesWithProfiles(): Promise<PharmacyWithProfile[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  // 1. Fetch all distinct pharmacy names from the 'pharmacies' table
  const { data: pharmaciesData, error: pharmaciesError } = await supabase
    .from('pharmacies')
    .select('nom')
    .order('nom');
  
  if (pharmaciesError) {
    console.error("Error fetching pharmacy names:", pharmaciesError);
    return [];
  }
  const distinctNames = [...new Set(pharmaciesData.map(p => p.nom))];

  // 2. Fetch all profiles
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('pharmacy_name');
  
  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return distinctNames.map(name => ({ nom: name, has_profile: false }));
  }

  const profileNames = new Set(profilesData.map(p => p.pharmacy_name));
  
  // 3. Map names to objects with profile status
  return distinctNames.map(name => ({
    nom: name,
    has_profile: profileNames.has(name),
  }));
}

export default async function AdminPage() {
  const pharmacies = await getPharmaciesWithProfiles();

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <AdminPageClient pharmacies={pharmacies} />
        </div>
      </div>
    </PageWrapper>
  );
}
