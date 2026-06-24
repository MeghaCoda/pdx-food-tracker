import Image from "next/image";

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'sans-serif',
    }}>
      <p style={{ fontSize: '48px', margin: '0 0 1.5rem' }}>🛠️</p>
      <h1 style={{ fontSize: '28px', fontWeight: 500, margin: '0 0 0.75rem' }}>
        Rose City Finds is coming soon
      </h1>
      <p style={{ fontSize: '16px', color: '#666', maxWidth: '420px', lineHeight: 1.7, margin: '0 0 2rem' }}>
        We're building a resource finder to help connect Portland residents with
        local food pantries and community services. Check back soon.
      </p>
      
        <a href="mailto:rosecityfinds.info@gmail.com"
        style={{ fontSize: '14px', color: '#666', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}
      >
        rosecityfinds.info@gmail.com
      </a>
    </main>
  )
}
