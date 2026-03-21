import api from './axiosInstance';

export const getAppVersion = async () => {
  try {
    const response = await api.get('/config/app-version');
    console.log('Response App Version : ', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching app version : ', error);
    throw error;
  }
};

//  NAYA FUNCTION ADD KAREIN
export const updateAppVersion = async data => {
  const response = await api.post('/config/app-version/update', data);
  return response;
};
