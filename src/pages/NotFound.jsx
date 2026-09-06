import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" className="btn btn--primary">Back to Home</Link>
    </div>
  );
}
