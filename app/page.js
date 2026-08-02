import { supabase } from './lib/supabase'
import { HomeContent } from './components/HomeContent'
export const dynamic = 'force-dynamic'

export default async function Home() {

  const { data: properties, error } = await supabase
    .from('proprieties')
    .select('*')

  if (error) {
    return <div style={{ padding: 40 }}>خطأ فالاتصال: {error.message}</div>
  }

  return <HomeContent properties={properties} />
}