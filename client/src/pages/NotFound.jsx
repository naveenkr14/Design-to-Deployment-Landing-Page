import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Icon from '../components/Icon.jsx';
import { EmptyState } from '../components/UI.jsx';

export default function NotFound() {
  return <Layout><div className="page"><EmptyState icon="search" title="This page doesn’t exist" description="The link may be out of date, or the page may still be in the Loop roadmap." action={<Link className="btn btn-primary" to="/"><Icon name="arrowLeft" size={14} />Back home</Link>} /></div></Layout>;
}
