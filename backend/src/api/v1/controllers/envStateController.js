import eventLogRepo from "../repos/eventLogRepo.js";
import envStateService from "../services/envStateService.js";
import fetch from 'node-fetch'
const getEnvState = async (req, res) => {
  try {

    const envState = await envStateService.getEnvState();
    console.log(`requested: ${req.originalUrl}`);

    res.json(envState);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEnvState = async (req, res) => {
  try {


    console.log(`requested: ${req.originalUrl}`);

    const id = req.body;
    const greenhouseId = req.params.greenhouseId

    const forwardPut = async ()=>{

      try {
        const response = await fetch('http://10.0.0.86/api/envStateUpdate',{
          method: 'PUT',
          body: id
        });
        const result = await response.json();
        console.log(result)
        if(response.ok){
             //PARAMS:
        // eventType,
        // eventAction,
        // details,
        // greenhouseId,
        // zoneId,
        // squareId,
        // moduleId,
        // sensorId,
        // note_id
          const stateObject = Object.values(result);
          console.log(Number(id))
          console.log(stateObject)


          const selectedState = stateObject.find(state=> state.id === Number(id));
          console.log(selectedState)
          const addEvent = await eventLogRepo.addEvent(
            selectedState.type,
            selectedState.state,
            '',
            greenhouseId,
            null,
            null,
            null,
            null,
            null
          )
        }
        return result;
      } catch (error) {
        console.error('Error forwarding:', error);
      }
    }
    const forwardedResponse = await forwardPut();


    res.json(forwardedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export default {
  updateEnvState,
    getEnvState
};
