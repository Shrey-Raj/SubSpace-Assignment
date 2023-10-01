const axios = require('axios');
const env = require('dotenv') 
env.config();

const fetchData = async () => {
  const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';
  const headers = {
    'x-hasura-admin-secret': `${process.env.SECRET_KEY_VALUE}`,
  };

  try {
    const response = await axios.get(url, { headers });

    if (response.status === 200) {
      return response.data; 
    } else {
      throw new Error('API request failed'); 
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = fetchData;
