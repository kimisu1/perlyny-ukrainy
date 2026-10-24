import { Container } from 'react-bootstrap';
import './PageHeader.scss';

export default function PageHeader({ title, lead }) {
  return (
    <div className="page-header">
      <Container>
        <h1 className="page-header__title">{title}</h1>
        {lead && <p className="page-header__lead">{lead}</p>}
      </Container>
    </div>
  );
}
