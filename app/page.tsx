import Image from "next/image";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/constants";
import { HOME_COMING_SOON_TITLE, HOME_COMING_SOON_DESCRIPTION } from "./constants";

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
        {HOME_COMING_SOON_TITLE}
      </h1>
      <p style={{ fontSize: '16px', color: '#666', maxWidth: '420px', lineHeight: 1.7, margin: '0 0 2rem' }}>
        {HOME_COMING_SOON_DESCRIPTION}
      </p>

        <a href={`mailto:${CONTACT_EMAIL}`}
        style={{ fontSize: '14px', color: '#666', textDecoration: 'none', borderBottom: '1px solid #ccc', paddingBottom: '2px' }}
      >
        {CONTACT_EMAIL}
      </a>
    </main>
  )
}
