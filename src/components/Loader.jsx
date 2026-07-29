import Loader from "../components/Loader";
import { useEffect, useState } from "react";

function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return <Loader text="Loading Dashboard..." />;
  }

  return <h1>Dashboard Loaded</h1>;
}