import fetch from 'node-fetch'

const getEnvState = async () => {




async function getState() {
  try {
    const response = await fetch('http://10.0.0.86/api/envState');
    const stateArr = await response.json();
    return stateArr;
  } catch (error) {
    console.error('Error:', error);
  }
}

const state = getState();

  return state || null;
};



export default {
 getEnvState
};
