import { useAppContext } from "../context/AppContext";

const HomePage = () => {
  const { user } = useAppContext();
  return <div>home</div>;
};

export default HomePage;
