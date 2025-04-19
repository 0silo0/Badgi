import Sidebar from '../../components/Sidebar/Sidebar';
import './HomePage.scss';

export default function HomePage() {
  return (
    <div className="homepage-container">
      <Sidebar />
      <div className="content">
        <h1>Добро пожаловать!</h1>
      </div>
    </div>
  );
}