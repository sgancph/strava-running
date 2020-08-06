import React, { useEffect, useState } from "react";

const CLIENT_ID = "51995";
const CLIENT_SECRET = "4d3bc51e94bca632db4f5ff4999525da1fc32910";
const CALLBACK_DOMAIN = "http://127.0.0.1:3000/";
const BASE_URL = "https://www.strava.com";
const AUTHORIZATION_URL = `${BASE_URL}/oauth/authorize`;
const TOKEN_URL = `${BASE_URL}/oauth/token`;
const SCOPE = "activity:read";

const getParam = (name) => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get(name);
};

const App = () => {
  const [athlete, setAthlete] = useState({});
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const code = getParam("code");

    if (!!code) {
      const requestUrl = `${TOKEN_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code`;
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      };

      fetch(requestUrl, requestOptions)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Invalid code");
          }

          return response.json();
        })
        .then((data) => {
          const { access_token, athlete } = data;
          setAthlete(athlete);
          return access_token;
        })
        .then((accessToken) =>
          fetch(`${BASE_URL}/api/v3/athlete/activities`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        )
        .then((response) => response.json())
        .then((activities) => setActivities(activities))
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const URL = `${AUTHORIZATION_URL}?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_DOMAIN}&response_type=code&scope=${SCOPE}`;

  return (
    <div>
      <p>
        <a href={URL}>Authenticate with Strava</a>
      </p>
      <div>
        <p>{JSON.stringify(athlete)}</p>
      </div>
      {!!activities.length && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Distance (km)</th>
              <th>Time (mins)</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, i) => (
              <tr key={i}>
                <td>{activity.name}</td>
                <td>{Math.round(activity.distance / 1000)}</td>
                <td>{Math.round(activity.moving_time / 60)}</td>
                <td>
                  {activity.type} ({activity.workout_type})
                </td>
                <td>
                  {new Date(activity.start_date_local).toLocaleDateString(
                    "en-US"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
