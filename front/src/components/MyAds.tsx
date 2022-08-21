import { useState, useEffect, useContext, FC } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';
import { AdInterface } from "../types";
import AdCard from './AdCard';

const MyAds: FC = () => {
  const { user } = useContext(UserContext);
  const [myAds, setMyAds] = useState<Array<AdInterface> | null>(null);

  useEffect(() => {
    user &&
      axios
        .get(`/api/ads/${user._id}`)
        .then(({ data }) => setMyAds(data));
  }, [user]);

  return (
    <div>
      {myAds?.map(ad => (
        <AdCard ad={ad} />
      ))}
    </div>
  );
};

export default MyAds;