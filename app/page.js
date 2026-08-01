import { supabase } from './lib/supabase'
import PropertyList from './components/PropertyList'

export default async function Home() {
  const { data: properties, error } = await supabase
    .from('proprieties')
    .select('*')

  if (error) {
    return <div style={{ padding: 40 }}>خطأ فالاتصال: {error.message}</div>
  }

  return (
    <>
      <header>
        <div className="wrap nav">
  <div className="logo">Médenine <em>Immo</em></div>
<a href="/gerer" style={{ border: '1px solid var(--line)', padding: '9px 20px', fontSize: '0.85rem', marginRight: 10 }}>تسيير</a></div>
      </header>

      <section className="wrap section">
        <div className="section-top">
          <div>
            <span className="kicker">مدنين</span>
            <h2>العقارات المتوفرة</h2>
          </div>
        </div>

        <PropertyList properties={properties} />
      </section>
    </>
  )
}