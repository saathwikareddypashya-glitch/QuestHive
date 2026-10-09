import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="page-fade container-qh notfound">
      <div className="nf-hex" aria-hidden>404</div>
      <h1 className="h-page-lg">This page wandered off.</h1>
      <p className="text-muted-qh">The link may be broken or the page may have moved. Let's get you back to learning.</p>
      <div className="d-flex gap-2 justify-content-center flex-wrap">
        <Link to="/" className="btn btn-primary">Go home</Link>
        <Link to="/explore" className="btn btn-secondary">Explore teachers</Link>
      </div>
    </div>
  );
}
